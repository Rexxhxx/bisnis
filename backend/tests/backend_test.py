"""Backend API regression tests for Quick Order (QO)."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend .env for local tests
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"

ADMIN_USER = {"username": "founderrqo", "password": "founderrqo123"}
TEST_USER = {"username": "rexid", "password": "rexid12345"}


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json=ADMIN_USER, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def user_token():
    # Try login first; if user doesn't exist, register.
    r = requests.post(f"{API}/auth/login", json=TEST_USER, timeout=15)
    if r.status_code == 200:
        return r.json()["token"]
    # Register
    payload = {
        "username": TEST_USER["username"],
        "password": TEST_USER["password"],
        "phone": "62811" + str(int(time.time()))[-7:],
        "email": f"{TEST_USER['username']}@test.local",
        "full_name": "Rex Id",
    }
    r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def H(tok):
    return {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


# ---------------- Auth ----------------
class TestAuth:
    def test_register_short_password(self):
        r = requests.post(f"{API}/auth/register", json={
            "username": f"TEST_{uuid.uuid4().hex[:8]}",
            "password": "short",
            "phone": "628" + uuid.uuid4().hex[:9],
            "email": f"TEST_{uuid.uuid4().hex[:8]}@x.com",
        })
        assert r.status_code == 400

    def test_register_success_and_duplicate(self):
        uname = f"test_{uuid.uuid4().hex[:8]}"
        phone = "628" + uuid.uuid4().hex[:9]
        email = f"{uname}@x.com"
        payload = {"username": uname, "password": "password123",
                   "phone": phone, "email": email, "full_name": "T"}
        r = requests.post(f"{API}/auth/register", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and data["user"]["role"] == "user"
        assert data["user"]["username"] == uname
        # duplicate username
        r2 = requests.post(f"{API}/auth/register", json=payload)
        assert r2.status_code == 400
        # duplicate email but new username/phone
        r3 = requests.post(f"{API}/auth/register", json={
            **payload, "username": uname + "2", "phone": "628" + uuid.uuid4().hex[:9]
        })
        assert r3.status_code == 400

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"username": "founderrqo", "password": "wrong!!!"})
        assert r.status_code == 401

    def test_login_admin_and_me(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"


# ---------------- Products / Settings ----------------
class TestPublic:
    def test_products_seeded(self):
        r = requests.get(f"{API}/products")
        assert r.status_code == 200
        products = r.json()
        assert len(products) >= 3
        names = {p["name"] for p in products}
        assert {"Japan Number", "Canada Number", "Indonesia Number"}.issubset(names)

    def test_settings(self):
        r = requests.get(f"{API}/settings")
        assert r.status_code == 200
        s = r.json()
        for k in ("dana_number", "bri_number", "qris_image", "whatsapp_owner"):
            assert k in s


# ---------------- Cart + Order lifecycle ----------------
class TestOrderFlow:
    def test_full_flow(self, user_token, admin_token):
        # get products
        products = requests.get(f"{API}/products").json()
        pid = products[0]["id"]

        # add to cart
        r = requests.post(f"{API}/cart", json={"product_id": pid}, headers=H(user_token))
        assert r.status_code == 200
        cart = r.json()
        assert len(cart["items"]) >= 1
        assert cart["total"] == cart["subtotal"] - cart["discount"]

        # get cart
        r = requests.get(f"{API}/cart", headers=H(user_token))
        assert r.status_code == 200

        # checkout
        r = requests.post(f"{API}/orders/checkout", headers=H(user_token))
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["status"] == "Waiting Payment"
        assert order["invoice_no"].startswith("INV-")
        assert len(order["invoice_no"]) == len("INV-000001")
        order_id = order["id"]

        # cart cleared
        r = requests.get(f"{API}/cart", headers=H(user_token))
        assert r.json()["items"] == []

        # confirm payment
        r = requests.post(f"{API}/orders/{order_id}/confirm-payment", headers=H(user_token))
        assert r.status_code == 200
        assert r.json()["status"] == "Waiting Admin Confirmation"

        # admin sees in payments
        r = requests.get(f"{API}/admin/payments", headers=H(admin_token))
        assert r.status_code == 200
        assert any(o["id"] == order_id for o in r.json())

        # approve
        r = requests.post(f"{API}/admin/orders/{order_id}/approve", headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()["status"] == "Completed"

        # verify via get
        r = requests.get(f"{API}/orders/{order_id}", headers=H(user_token))
        assert r.status_code == 200
        assert r.json()["status"] == "Completed"

        # user cannot access admin
        r = requests.get(f"{API}/admin/orders", headers=H(user_token))
        assert r.status_code == 403

    def test_reject_flow(self, user_token, admin_token):
        products = requests.get(f"{API}/products").json()
        pid = products[1]["id"]
        requests.post(f"{API}/cart", json={"product_id": pid}, headers=H(user_token))
        order = requests.post(f"{API}/orders/checkout", headers=H(user_token)).json()
        requests.post(f"{API}/orders/{order['id']}/confirm-payment", headers=H(user_token))
        r = requests.post(f"{API}/admin/orders/{order['id']}/reject",
                          json={"reason": "Invalid proof"}, headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()["status"] == "Payment Rejected"
        assert r.json()["reject_reason"] == "Invalid proof"


# ---------------- Admin CRUD ----------------
class TestAdmin:
    def test_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=H(admin_token))
        assert r.status_code == 200
        for k in ("total_users", "total_orders", "pending_confirmations", "revenue", "total_products"):
            assert k in r.json()

    def test_product_crud(self, admin_token):
        payload = {"name": "TEST_Product", "description": "d", "price": 1000, "discount": 0,
                   "image": "", "stock": 10, "category": "Virtual Number", "status": "active"}
        r = requests.post(f"{API}/products", json=payload, headers=H(admin_token))
        assert r.status_code == 200
        pid = r.json()["id"]
        # update
        payload["price"] = 2000
        r = requests.put(f"{API}/products/{pid}", json=payload, headers=H(admin_token))
        assert r.status_code == 200 and r.json()["price"] == 2000
        # delete
        r = requests.delete(f"{API}/products/{pid}", headers=H(admin_token))
        assert r.status_code == 200
        # verify gone
        r = requests.get(f"{API}/products/{pid}")
        assert r.status_code == 404

    def test_admin_users_list(self, admin_token):
        r = requests.get(f"{API}/admin/users", headers=H(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_settings_update(self, admin_token):
        cur = requests.get(f"{API}/settings").json()
        new_val = "TEST_" + uuid.uuid4().hex[:6]
        r = requests.put(f"{API}/settings", json={**cur, "banner": new_val}, headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()["banner"] == new_val
        # restore
        requests.put(f"{API}/settings", json=cur, headers=H(admin_token))

    def test_non_admin_forbidden(self, user_token):
        for path in ["/admin/stats", "/admin/orders", "/admin/payments", "/admin/users"]:
            r = requests.get(f"{API}{path}", headers=H(user_token))
            assert r.status_code == 403, f"{path} -> {r.status_code}"
