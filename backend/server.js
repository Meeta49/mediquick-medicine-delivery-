const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store
let medicines = [
  { id: 1, name: "Paracetamol 500mg", price: 25, category: "Pain Relief", stock: 50 },
  { id: 2, name: "Amoxicillin 250mg", price: 120, category: "Antibiotic", stock: 30 },
  { id: 3, name: "Cetirizine 10mg", price: 40, category: "Allergy", stock: 80 },
  { id: 4, name: "Omeprazole 20mg", price: 75, category: "Gastro", stock: 60 },
  { id: 5, name: "Vitamin C 500mg", price: 90, category: "Supplement", stock: 100 },
];

let orders = [];

// GET all medicines
app.get('/api/medicines', (req, res) => {
  const { search } = req.query;
  if (search) {
    return res.json(medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase())));
  }
  res.json(medicines);
});

// GET single medicine
app.get('/api/medicines/:id', (req, res) => {
  const med = medicines.find(m => m.id === parseInt(req.params.id));
  if (!med) return res.status(404).json({ error: 'Medicine not found' });
  res.json(med);
});

// POST place order
app.post('/api/orders', (req, res) => {
  const { items, userDetails } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'No items in order' });

  // Check stock and calculate total
  let total = 0;
  for (const item of items) {
    const med = medicines.find(m => m.id === item.medicineId);
    if (!med) return res.status(404).json({ error: `Medicine ${item.medicineId} not found` });
    if (med.stock < item.qty) return res.status(400).json({ error: `Insufficient stock for ${med.name}` });
    total += med.price * item.qty;
  }

  // Deduct stock
  items.forEach(item => {
    const med = medicines.find(m => m.id === item.medicineId);
    med.stock -= item.qty;
  });

  const order = {
    id: orders.length + 1,
    items,
    userDetails,
    total,
    status: 'Confirmed',
    placedAt: new Date().toISOString()
  };
  orders.push(order);
  res.status(201).json({ message: 'Order placed successfully', order });
});

// GET all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// GET single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// PATCH update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status;
  res.json({ message: 'Status updated', order });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MediQuick Backend running on port ${PORT}`));
