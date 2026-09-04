from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Body, UploadFile, File, Header, Query, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from bson import ObjectId
import logging
import bcrypt
import jwt
import uuid
import requests

# ---------------------------------------------------------------------------
# Object Storage (Emergent)
# ---------------------------------------------------------------------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "quickorder"
MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp",
}
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------------------------------------------------------------------
# DB setup
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

app = FastAPI(title="Quick Order (QO) API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("qo")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, role: str, remember: bool = False) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=30 if remember else 1)
    payload = {"sub": user_id, "role": role, "exp": exp, "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def serialize_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "username": doc.get("username"),
        "email": doc.get("email"),
        "phone": doc.get("phone"),
        "full_name": doc.get("full_name", doc.get("username")),
        "role": doc.get("role", "user"),
        "status": doc.get("status", "active"),
        "created_at": doc.get("created_at"),
    }


def serialize_order(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    return d


def serialize_product(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    return d


async def get_token(request: Request) -> Optional[str]:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    return token


async def get_current_user(request: Request) -> dict:
    token = await get_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("status") == "suspended":
            raise HTTPException(status_code=403, detail="Account suspended")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please login again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def next_invoice_number() -> str:
    counter = await db.counters.find_one_and_update(
        {"_id": "invoice"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return f"INV-{counter['seq']:06d}"


async def create_notification(user_id: str, title: str, message: str, ntype: str = "info", invoice_no: str = None):
    await db.notifications.insert_one({
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": ntype,
        "invoice_no": invoice_no,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterInput(BaseModel):
    username: str
    password: str
    phone: str
    email: EmailStr
    full_name: Optional[str] = None


class LoginInput(BaseModel):
    username: str
    password: str
    remember: bool = False


class CartItemInput(BaseModel):
    product_id: str


class ProductInput(BaseModel):
    name: str
    description: str
    price: float
    discount: float = 0
    image: str = ""
    stock: int = 100
    category: str = "Virtual Number"
    status: str = "active"
    promo_badge: Optional[str] = None


class RejectInput(BaseModel):
    reason: str


class UserUpdateInput(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class PasswordResetInput(BaseModel):
    new_password: str


class ReviewInput(BaseModel):
    rating: int
    comment: str
    product_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(data: RegisterInput):
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password minimal 8 karakter")
    username = data.username.strip().lower()
    email = data.email.strip().lower()
    phone = data.phone.strip()
    if not username or not phone:
        raise HTTPException(status_code=400, detail="Semua field wajib diisi")
    if await db.users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username sudah digunakan")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email sudah digunakan")
    if await db.users.find_one({"phone": phone}):
        raise HTTPException(status_code=400, detail="Nomor sudah digunakan")
    doc = {
        "username": username,
        "email": email,
        "phone": phone,
        "full_name": data.full_name or data.username,
        "password_hash": hash_password(data.password),
        "role": "user",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    token = create_token(str(res.inserted_id), "user")
    return {"token": token, "user": serialize_user(doc)}


@api.post("/auth/login")
async def login(data: LoginInput):
    username = data.username.strip().lower()
    user = await db.users.find_one({"username": username})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Username atau password salah")
    if user.get("status") == "suspended":
        raise HTTPException(status_code=403, detail="Akun Anda telah disuspend")
    token = create_token(str(user["_id"]), user.get("role", "user"), data.remember)
    return {"token": token, "user": serialize_user(user)}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": serialize_user(user)}


@api.post("/auth/logout")
async def logout():
    return {"message": "Logged out"}


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------
@api.get("/products")
async def list_products(all: bool = False):
    query = {} if all else {"status": "active"}
    docs = await db.products.find(query).sort("created_at", 1).to_list(100)
    return [serialize_product(d) for d in docs]


@api.get("/products/{product_id}")
async def get_product(product_id: str):
    doc = await db.products.find_one({"_id": ObjectId(product_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    return serialize_product(doc)


@api.post("/products")
async def create_product(data: ProductInput, admin: dict = Depends(require_admin)):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.products.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_product(doc)


@api.put("/products/{product_id}")
async def update_product(product_id: str, data: ProductInput, admin: dict = Depends(require_admin)):
    await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": data.model_dump()})
    doc = await db.products.find_one({"_id": ObjectId(product_id)})
    return serialize_product(doc)


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(require_admin)):
    await db.products.delete_one({"_id": ObjectId(product_id)})
    return {"message": "Produk dihapus"}


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------
async def get_cart_doc(user_id: str) -> dict:
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        cart = {"user_id": user_id, "items": []}
        await db.carts.insert_one(cart)
    return cart


async def build_cart_response(user_id: str) -> dict:
    cart = await get_cart_doc(user_id)
    items = []
    subtotal = 0
    discount_total = 0
    for pid in cart.get("items", []):
        try:
            p = await db.products.find_one({"_id": ObjectId(pid)})
        except Exception:
            p = None
        if not p:
            continue
        price = p["price"]
        disc = p.get("discount", 0) or 0
        line = price - disc
        subtotal += price
        discount_total += disc
        items.append({
            "product_id": str(p["_id"]),
            "name": p["name"],
            "image": p.get("image", ""),
            "price": price,
            "discount": disc,
            "total": line,
        })
    return {
        "items": items,
        "subtotal": subtotal,
        "discount": discount_total,
        "total": subtotal - discount_total,
    }


@api.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    return await build_cart_response(str(user["_id"]))


@api.post("/cart")
async def add_to_cart(data: CartItemInput, user: dict = Depends(get_current_user)):
    p = await db.products.find_one({"_id": ObjectId(data.product_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    if p.get("stock", 0) <= 0:
        raise HTTPException(status_code=400, detail="Stok habis")
    await db.carts.update_one(
        {"user_id": str(user["_id"])},
        {"$addToSet": {"items": data.product_id}},
        upsert=True,
    )
    return await build_cart_response(str(user["_id"]))


@api.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": str(user["_id"])},
        {"$pull": {"items": product_id}},
    )
    return await build_cart_response(str(user["_id"]))


# ---------------------------------------------------------------------------
# Orders / Invoices
# ---------------------------------------------------------------------------
@api.post("/orders/checkout")
async def checkout(user: dict = Depends(get_current_user)):
    cart = await build_cart_response(str(user["_id"]))
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Keranjang kosong")
    invoice_no = await next_invoice_number()
    order = {
        "invoice_no": invoice_no,
        "user_id": str(user["_id"]),
        "username": user["username"],
        "full_name": user.get("full_name", user["username"]),
        "phone": user.get("phone"),
        "email": user.get("email"),
        "items": cart["items"],
        "subtotal": cart["subtotal"],
        "discount": cart["discount"],
        "total": cart["total"],
        "status": "Waiting Payment",
        "reject_reason": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.orders.insert_one(order)
    order["_id"] = res.inserted_id
    # clear cart
    await db.carts.update_one({"user_id": str(user["_id"])}, {"$set": {"items": []}})
    return serialize_order(order)


@api.get("/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    docs = await db.orders.find({"user_id": str(user["_id"])}).sort("created_at", -1).to_list(500)
    return [serialize_order(d) for d in docs]


@api.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice tidak ditemukan")
    if doc["user_id"] != str(user["_id"]) and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak")
    return serialize_order(doc)


@api.post("/orders/{order_id}/confirm-payment")
async def confirm_payment(order_id: str, user: dict = Depends(get_current_user)):
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice tidak ditemukan")
    if doc["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Akses ditolak")
    if doc["status"] not in ("Waiting Payment", "Payment Rejected"):
        raise HTTPException(status_code=400, detail="Status transaksi tidak valid")
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "Waiting Admin Confirmation", "reject_reason": None}},
    )
    doc["status"] = "Waiting Admin Confirmation"
    return serialize_order(doc)


# ---------------------------------------------------------------------------
# Admin: orders / payments
# ---------------------------------------------------------------------------
@api.get("/admin/orders")
async def admin_orders(admin: dict = Depends(require_admin)):
    docs = await db.orders.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_order(d) for d in docs]


@api.get("/admin/payments")
async def admin_payments(admin: dict = Depends(require_admin)):
    docs = await db.orders.find(
        {"status": {"$in": ["Waiting Admin Confirmation", "Waiting Payment"]}}
    ).sort("created_at", -1).to_list(1000)
    return [serialize_order(d) for d in docs]


@api.post("/admin/orders/{order_id}/approve")
async def approve_order(order_id: str, admin: dict = Depends(require_admin)):
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice tidak ditemukan")
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "Completed", "reject_reason": None}},
    )
    doc["status"] = "Completed"
    await create_notification(
        doc["user_id"],
        "Pembayaran Diterima ✅",
        f"Pembayaran untuk invoice {doc['invoice_no']} telah dikonfirmasi. Pembelian selesai. Terima kasih!",
        "success",
        doc["invoice_no"],
    )
    return serialize_order(doc)


@api.post("/admin/orders/{order_id}/reject")
async def reject_order(order_id: str, data: RejectInput, admin: dict = Depends(require_admin)):
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice tidak ditemukan")
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "Payment Rejected", "reject_reason": data.reason}},
    )
    doc["status"] = "Payment Rejected"
    doc["reject_reason"] = data.reason
    await create_notification(
        doc["user_id"],
        "Pembayaran Ditolak ❌",
        f"Pembayaran untuk invoice {doc['invoice_no']} ditolak. Alasan: {data.reason}",
        "error",
        doc["invoice_no"],
    )
    return serialize_order(doc)


# ---------------------------------------------------------------------------
# Notifications (in-app)
# ---------------------------------------------------------------------------
@api.get("/notifications")
async def list_notifications(user: dict = Depends(get_current_user)):
    docs = await db.notifications.find({"user_id": str(user["_id"])}).sort("created_at", -1).to_list(100)
    out = []
    for d in docs:
        d["id"] = str(d.pop("_id"))
        out.append(d)
    return out


@api.post("/notifications/read-all")
async def read_all_notifications(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": str(user["_id"])}, {"$set": {"read": True}})
    return {"message": "ok"}


@api.post("/notifications/{notif_id}/read")
async def read_notification(notif_id: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"_id": ObjectId(notif_id), "user_id": str(user["_id"])},
        {"$set": {"read": True}},
    )
    return {"message": "ok"}


# ---------------------------------------------------------------------------
# File upload / serving (object storage)
# ---------------------------------------------------------------------------
@api.post("/upload")
async def upload_file(file: UploadFile = File(...), admin: dict = Depends(require_admin)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Format gambar tidak didukung (jpg, png, webp, gif)")
    content_type = MIME_TYPES[ext]
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ukuran gambar maksimal 5MB")
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.error(f"upload failed: {e}")
        raise HTTPException(status_code=500, detail="Gagal upload gambar")
    await db.files.insert_one({
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}


@api.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    try:
        data, ct = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    return Response(content=data, media_type=record.get("content_type", ct))


# ---------------------------------------------------------------------------
# Admin: revenue analytics
# ---------------------------------------------------------------------------
@api.get("/admin/revenue")
async def admin_revenue(admin: dict = Depends(require_admin)):
    orders = await db.orders.find({"status": "Completed"}).to_list(10000)
    daily = defaultdict(lambda: {"revenue": 0, "count": 0})
    monthly = defaultdict(lambda: {"revenue": 0, "count": 0})
    yearly = defaultdict(lambda: {"revenue": 0, "count": 0})
    for o in orders:
        try:
            dt = datetime.fromisoformat(o["created_at"])
        except Exception:
            continue
        total = o.get("total", 0)
        daily[dt.strftime("%Y-%m-%d")]["revenue"] += total
        daily[dt.strftime("%Y-%m-%d")]["count"] += 1
        monthly[dt.strftime("%Y-%m")]["revenue"] += total
        monthly[dt.strftime("%Y-%m")]["count"] += 1
        yearly[dt.strftime("%Y")]["revenue"] += total
        yearly[dt.strftime("%Y")]["count"] += 1

    def series(d, last_n=None):
        items = [{"period": k, "revenue": v["revenue"], "count": v["count"]} for k, v in sorted(d.items())]
        return items[-last_n:] if last_n else items

    return {
        "daily": series(daily, 30),
        "monthly": series(monthly, 12),
        "yearly": series(yearly),
        "total_revenue": sum(o.get("total", 0) for o in orders),
        "total_completed": len(orders),
    }


# ---------------------------------------------------------------------------
# Admin: users
# ---------------------------------------------------------------------------
@api.get("/admin/users")
async def admin_users(admin: dict = Depends(require_admin)):
    docs = await db.users.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_user(d) for d in docs]


@api.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, data: UserUpdateInput, admin: dict = Depends(require_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    return serialize_user(doc)


@api.post("/admin/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str, data: PasswordResetInput, admin: dict = Depends(require_admin)):
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password minimal 8 karakter")
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": hash_password(data.new_password)}},
    )
    return {"message": "Password direset"}


@api.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(require_admin)):
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if target and target.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Tidak dapat menghapus akun admin")
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User dihapus"}


# ---------------------------------------------------------------------------
# Admin: dashboard stats
# ---------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({"role": "user"})
    total_orders = await db.orders.count_documents({})
    pending = await db.orders.count_documents({"status": "Waiting Admin Confirmation"})
    completed_orders = await db.orders.find({"status": "Completed"}).to_list(5000)
    revenue = sum(o.get("total", 0) for o in completed_orders)
    total_products = await db.products.count_documents({})
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "pending_confirmations": pending,
        "completed": len(completed_orders),
        "revenue": revenue,
        "total_products": total_products,
    }


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
DEFAULT_SETTINGS = {
    "_id": "site",
    "site_name": "Quick Order",
    "logo": "",
    "whatsapp_owner": "6282322811829",
    "dana_name": "K****K",
    "dana_number": "0895-3393-69871",
    "bri_name": "NHR",
    "bri_number": "2030-0102-3091-500",
    "qris_image": "https://files.catbox.moe/4djxqd.jpg",
    "currency": "Rp",
    "banner": "Beli Virtual Number cepat, aman, dan terpercaya.",
    "footer": "New Era 2026 Quick Order (QO).",
    "contact": "teamvelyn@gmail.com",
}


@api.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"_id": "site"})
    if not doc:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
        doc = dict(DEFAULT_SETTINGS)
    doc.pop("_id", None)
    return doc


@api.put("/settings")
async def update_settings(data: dict = Body(...), admin: dict = Depends(require_admin)):
    data.pop("_id", None)
    await db.settings.update_one({"_id": "site"}, {"$set": data}, upsert=True)
    doc = await db.settings.find_one({"_id": "site"})
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# Startup: seed admin + products + settings + indexes
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.warning(f"storage init warning: {e}")
    try:
        await db.users.create_index("username", unique=True)
        await db.users.create_index("email", unique=True)
        await db.users.create_index("phone", unique=True)
    except Exception as e:
        logger.warning(f"index warning: {e}")

    admin_username = os.environ["ADMIN_USERNAME"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"username": admin_username})
    if not existing:
        await db.users.insert_one({
            "username": admin_username,
            "email": os.environ["ADMIN_EMAIL"].lower(),
            "phone": os.environ["ADMIN_PHONE"],
            "full_name": "Founder QO",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"username": admin_username},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}},
        )

    if await db.products.count_documents({}) == 0:
        seed_products = [
            {
                "name": "Japan Number",
                "description": "Virtual Number Japan - aktivasi cepat untuk berbagai aplikasi.",
                "price": 25000,
                "discount": 0,
                "image": "https://images.pexels.com/photos/34974288/pexels-photo-34974288.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "stock": 50,
                "category": "Virtual Number",
                "status": "active",
                "promo_badge": None,
            },
            {
                "name": "Canada Number",
                "description": "Virtual Number Canada - nomor premium siap pakai.",
                "price": 35000,
                "discount": 5000,
                "image": "https://images.pexels.com/photos/3744699/pexels-photo-3744699.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "stock": 30,
                "category": "Virtual Number",
                "status": "active",
                "promo_badge": "Promo",
            },
            {
                "name": "Indonesia Number",
                "description": "Virtual Number Indonesia - lokal, stabil, dan terjangkau.",
                "price": 15000,
                "discount": 0,
                "image": "https://images.unsplash.com/photo-1663602532604-358d1c8d2086?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWElMjBmbGFnfGVufDB8fHx8MTc4NzgyMjE5Mnww&ixlib=rb-4.1.0&q=85",
                "stock": 100,
                "category": "Virtual Number",
                "status": "active",
                "promo_badge": None,
            },
        ]
        for p in seed_products:
            p["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.products.insert_many(seed_products)
        logger.info("Products seeded")

    if not await db.settings.find_one({"_id": "site"}):
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)