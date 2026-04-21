import React, { useState } from "react";

const medicines = [
  { id: 1, name: "Paracetamol 500mg", price: 25, category: "Pain Relief", stock: 50 },
  { id: 2, name: "Amoxicillin 250mg", price: 120, category: "Antibiotic", stock: 30 },
  { id: 3, name: "Cetirizine 10mg", price: 40, category: "Allergy", stock: 80 },
  { id: 4, name: "Omeprazole 20mg", price: 75, category: "Gastro", stock: 60 },
  { id: 5, name: "Vitamin C 500mg", price: 90, category: "Supplement", stock: 100 },
];

export default function App() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("home");

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (med) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === med.id);
      if (existing) return prev.map((i) => i.id === med.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...med, qty: 1 }];
    });
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    const order = { id: Date.now(), items: cart, total: cart.reduce((s, i) => s + i.price * i.qty, 0), status: "Confirmed" };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setTab("orders");
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "auto", padding: 16 }}>
      <h2 style={{ color: "#1976d2" }}>💊 MediQuick - Medicine Delivery</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {["home", "cart", "orders"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 16px", background: tab === t ? "#1976d2" : "#eee", color: tab === t ? "#fff" : "#333", border: "none", borderRadius: 6, cursor: "pointer" }}>
            {t === "cart" ? `🛒 Cart (${cart.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <>
          <input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 16, boxSizing: "border-box" }} />
          {filtered.map((med) => (
            <div key={med.id} style={{ border: "1px solid #e0e0e0", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "bold" }}>{med.name}</div>
                <div style={{ color: "#888", fontSize: 13 }}>{med.category} • Stock: {med.stock}</div>
                <div style={{ color: "#1976d2", fontWeight: "bold" }}>₹{med.price}</div>
              </div>
              <button onClick={() => addToCart(med)}
                style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer" }}>
                Add
              </button>
            </div>
          ))}
        </>
      )}

      {tab === "cart" && (
        <>
          {cart.length === 0 ? <p>Cart is empty.</p> : cart.map((item) => (
            <div key={item.id} style={{ border: "1px solid #e0e0e0", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <div><b>{item.name}</b><br /><span>Qty: {item.qty} × ₹{item.price}</span></div>
              <div style={{ fontWeight: "bold" }}>₹{item.qty * item.price}</div>
            </div>
          ))}
          {cart.length > 0 && (
            <>
              <div style={{ textAlign: "right", fontWeight: "bold", marginBottom: 10 }}>
                Total: ₹{cart.reduce((s, i) => s + i.price * i.qty, 0)}
              </div>
              <button onClick={placeOrder}
                style={{ width: "100%", background: "#43a047", color: "#fff", border: "none", borderRadius: 8, padding: 12, fontSize: 16, cursor: "pointer" }}>
                Place Order
              </button>
            </>
          )}
        </>
      )}

      {tab === "orders" && (
        <>
          {orders.length === 0 ? <p>No orders yet.</p> : orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #e0e0e0", borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div><b>Order #{order.id}</b> — <span style={{ color: "green" }}>{order.status}</span></div>
              <div style={{ fontSize: 13, color: "#555" }}>{order.items.map((i) => i.name).join(", ")}</div>
              <div style={{ fontWeight: "bold" }}>Total: ₹{order.total}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
