"""Backend tests for new features: notifications, upload, revenue, approve-from-waiting-payment."""
import io
import os
import struct
import zlib
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break
API = f"{BASE_URL}/api"

ADMIN = {"username": "founderrqo", "password": "founderrqo123"}
USER = {"username": "rexid", "password": "rexid12345"}


def _tok(cred):
    r = requests.post(f"{API}/auth/login", json=cred, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def H(t):
    return {"Authorization": f"Bearer {t}"}


def _make_png(width=2, height=2):
    """Generate a tiny valid PNG (2x2 red)."""
    def chunk(cid, data):
        return (struct.pack(">I", len(data)) + cid + data +
                struct.pack(">I", zlib.crc32(cid + data) & 0xffffffff))
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw = b""
    for _ in range(height):
        raw += b"\x00" + (b"\xff\x00\x00" * width)
    idat = zlib.compress(raw)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


@pytest.fixture(scope="session")
def admin_token():
    return _tok(ADMIN)


@pytest.fixture(scope="session")
def user_token():
    r = requests.post(f"{API}/auth/login", json=USER, timeout=15)
    if r.status_code == 200:
        return r.json()["token"]
    payload = {"username": USER["username"], "password": USER["password"],
               "phone": "62811" + str(int(time.time()))[-7:],
               "email": f"{USER['username']}@test.local", "full_name": "Rex"}
    r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ---------------- Upload ----------------
class TestUpload:
    def test_upload_non_admin_forbidden(self, user_token):
        png = _make_png()
        r = requests.post(f"{API}/upload", files={"file": ("t.png", png, "image/png")},
                          headers=H(user_token))
        assert r.status_code == 403, r.text

    def test_upload_and_serve(self, admin_token):
        png = _make_png()
        r = requests.post(f"{API}/upload", files={"file": ("t.png", png, "image/png")},
                          headers=H(admin_token))
        assert r.status_code == 200, r.text
        data = r.json()
        assert "path" in data and "url" in data
        assert data["url"].startswith("/api/files/")
        # serve
        r2 = requests.get(f"{BASE_URL}{data['url']}")
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/png")
        assert r2.content == png

    def test_upload_bad_ext(self, admin_token):
        r = requests.post(f"{API}/upload",
                          files={"file": ("t.txt", b"hello", "text/plain")},
                          headers=H(admin_token))
        assert r.status_code == 400


# ---------------- Revenue ----------------
class TestRevenue:
    def test_revenue_shape(self, admin_token):
        r = requests.get(f"{API}/admin/revenue", headers=H(admin_token))
        assert r.status_code == 200
        d = r.json()
        for k in ("daily", "monthly", "yearly", "total_revenue", "total_completed"):
            assert k in d
        for k in ("daily", "monthly", "yearly"):
            assert isinstance(d[k], list)
            for row in d[k]:
                assert set(row.keys()) >= {"period", "revenue", "count"}

    def test_revenue_non_admin(self, user_token):
        r = requests.get(f"{API}/admin/revenue", headers=H(user_token))
        assert r.status_code == 403


# ---------------- Notifications + Approve from Waiting Payment ----------------
class TestNotificationsAndApproveWaitingPayment:
    def _create_waiting_payment_order(self, user_token):
        products = requests.get(f"{API}/products").json()
        pid = products[0]["id"]
        requests.post(f"{API}/cart", json={"product_id": pid}, headers=H(user_token))
        r = requests.post(f"{API}/orders/checkout", headers=H(user_token))
        assert r.status_code == 200
        return r.json()

    def test_approve_from_waiting_payment_creates_notification(self, admin_token, user_token):
        order = self._create_waiting_payment_order(user_token)
        assert order["status"] == "Waiting Payment"
        order_id = order["id"]
        inv = order["invoice_no"]

        # Admin sees it in payments list
        r = requests.get(f"{API}/admin/payments", headers=H(admin_token))
        assert r.status_code == 200
        assert any(o["id"] == order_id and o["status"] == "Waiting Payment" for o in r.json())

        # Approve directly from Waiting Payment
        r = requests.post(f"{API}/admin/orders/{order_id}/approve", headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()["status"] == "Completed"

        # user notifications: should contain success with invoice
        r = requests.get(f"{API}/notifications", headers=H(user_token))
        assert r.status_code == 200
        notifs = r.json()
        match = [n for n in notifs if n.get("invoice_no") == inv and n.get("type") == "success"]
        assert match, f"success notif not found for {inv}: {notifs[:3]}"
        assert not match[0]["read"]
        assert "Pembayaran Diterima" in match[0]["title"]

    def test_reject_creates_error_notification(self, admin_token, user_token):
        order = self._create_waiting_payment_order(user_token)
        order_id = order["id"]
        inv = order["invoice_no"]
        requests.post(f"{API}/orders/{order_id}/confirm-payment", headers=H(user_token))
        r = requests.post(f"{API}/admin/orders/{order_id}/reject",
                          json={"reason": "TEST rejection reason"}, headers=H(admin_token))
        assert r.status_code == 200

        r = requests.get(f"{API}/notifications", headers=H(user_token))
        notifs = r.json()
        match = [n for n in notifs if n.get("invoice_no") == inv and n.get("type") == "error"]
        assert match
        assert "TEST rejection reason" in match[0]["message"]

    def test_read_all_marks_read(self, user_token):
        r = requests.post(f"{API}/notifications/read-all", headers=H(user_token))
        assert r.status_code == 200
        r = requests.get(f"{API}/notifications", headers=H(user_token))
        assert all(n["read"] for n in r.json())
