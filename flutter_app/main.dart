import 'package:flutter/material.dart';

void main() => runApp(const MediQuickApp());

class Medicine {
  final int id;
  final String name;
  final double price;
  final String category;
  int stock;
  Medicine({required this.id, required this.name, required this.price, required this.category, required this.stock});
}

class CartItem {
  final Medicine medicine;
  int qty;
  CartItem({required this.medicine, this.qty = 1});
}

class MediQuickApp extends StatelessWidget {
  const MediQuickApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediQuick',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;
  final List<CartItem> cart = [];
  final List<Map<String, dynamic>> orders = [];

  final List<Medicine> medicines = [
    Medicine(id: 1, name: "Paracetamol 500mg", price: 25, category: "Pain Relief", stock: 50),
    Medicine(id: 2, name: "Amoxicillin 250mg", price: 120, category: "Antibiotic", stock: 30),
    Medicine(id: 3, name: "Cetirizine 10mg", price: 40, category: "Allergy", stock: 80),
    Medicine(id: 4, name: "Omeprazole 20mg", price: 75, category: "Gastro", stock: 60),
    Medicine(id: 5, name: "Vitamin C 500mg", price: 90, category: "Supplement", stock: 100),
  ];

  void addToCart(Medicine med) {
    setState(() {
      final existing = cart.where((i) => i.medicine.id == med.id);
      if (existing.isNotEmpty) {
        existing.first.qty++;
      } else {
        cart.add(CartItem(medicine: med));
      }
    });
  }

  void placeOrder() {
    if (cart.isEmpty) return;
    setState(() {
      orders.add({
        'id': orders.length + 1,
        'items': List.from(cart),
        'total': cart.fold(0.0, (s, i) => s + i.medicine.price * i.qty),
        'status': 'Confirmed',
      });
      cart.clear();
      _tab = 2;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('💊 MediQuick'), backgroundColor: Colors.blue, foregroundColor: Colors.white),
      body: [
        MedicineListScreen(medicines: medicines, onAddToCart: addToCart),
        CartScreen(cart: cart, onPlaceOrder: placeOrder),
        OrdersScreen(orders: orders),
      ][_tab],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _tab,
        onTap: (i) => setState(() => _tab = i),
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.medical_services), label: 'Medicines'),
          BottomNavigationBarItem(icon: Badge(label: Text('${cart.length}'), child: const Icon(Icons.shopping_cart)), label: 'Cart'),
          const BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Orders'),
        ],
      ),
    );
  }
}

class MedicineListScreen extends StatefulWidget {
  final List<Medicine> medicines;
  final Function(Medicine) onAddToCart;
  const MedicineListScreen({super.key, required this.medicines, required this.onAddToCart});
  @override
  State<MedicineListScreen> createState() => _MedicineListScreenState();
}

class _MedicineListScreenState extends State<MedicineListScreen> {
  String query = '';
  @override
  Widget build(BuildContext context) {
    final filtered = widget.medicines.where((m) => m.name.toLowerCase().contains(query.toLowerCase())).toList();
    return Column(children: [
      Padding(
        padding: const EdgeInsets.all(12),
        child: TextField(
          onChanged: (v) => setState(() => query = v),
          decoration: InputDecoration(hintText: 'Search medicines...', prefixIcon: const Icon(Icons.search), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
        ),
      ),
      Expanded(
        child: ListView.builder(
          itemCount: filtered.length,
          itemBuilder: (ctx, i) {
            final med = filtered[i];
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: ListTile(
                title: Text(med.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('${med.category} • Stock: ${med.stock}'),
                trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                  Text('₹${med.price.toInt()}', style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  ElevatedButton(onPressed: () => widget.onAddToCart(med), child: const Text('Add')),
                ]),
              ),
            );
          },
        ),
      ),
    ]);
  }
}

class CartScreen extends StatelessWidget {
  final List<CartItem> cart;
  final VoidCallback onPlaceOrder;
  const CartScreen({super.key, required this.cart, required this.onPlaceOrder});
  @override
  Widget build(BuildContext context) {
    if (cart.isEmpty) return const Center(child: Text('Your cart is empty'));
    final total = cart.fold(0.0, (s, i) => s + i.medicine.price * i.qty);
    return Column(children: [
      Expanded(
        child: ListView(children: cart.map((item) => Card(
          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: ListTile(
            title: Text(item.medicine.name),
            subtitle: Text('Qty: ${item.qty} × ₹${item.medicine.price.toInt()}'),
            trailing: Text('₹${(item.qty * item.medicine.price).toInt()}', style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
        )).toList()),
      ),
      Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Text('Total: ₹${total.toInt()}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          SizedBox(width: double.infinity, child: ElevatedButton(onPressed: onPlaceOrder, style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14)), child: const Text('Place Order', style: TextStyle(fontSize: 16)))),
        ]),
      ),
    ]);
  }
}

class OrdersScreen extends StatelessWidget {
  final List<Map<String, dynamic>> orders;
  const OrdersScreen({super.key, required this.orders});
  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) return const Center(child: Text('No orders yet'));
    return ListView(children: orders.map((o) => Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Order #${o['id']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Chip(label: Text(o['status']), backgroundColor: Colors.green.shade100),
          ]),
          Text((o['items'] as List<CartItem>).map((i) => i.medicine.name).join(', '), style: const TextStyle(color: Colors.grey)),
          Text('Total: ₹${o['total'].toInt()}', style: const TextStyle(fontWeight: FontWeight.bold)),
        ]),
      ),
    )).toList());
  }
}
