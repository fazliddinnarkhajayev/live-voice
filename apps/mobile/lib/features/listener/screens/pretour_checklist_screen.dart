import 'package:flutter/material.dart';

class PreTourChecklistScreen extends StatefulWidget {
  final VoidCallback onReady;
  const PreTourChecklistScreen({super.key, required this.onReady});

  @override
  State<PreTourChecklistScreen> createState() => _PreTourChecklistScreenState();
}

class _PreTourChecklistScreenState extends State<PreTourChecklistScreen> {
  final List<bool> _checked = [false, false, false, false];

  final List<Map<String, String>> _items = [
    {
      'title': 'Enable Do Not Disturb (iOS Focus / Android DND)',
      'subtitle':
          'iOS: Settings → Focus → Do Not Disturb → Turn On\n'
          'Android: Swipe down → Do Not Disturb → Turn On',
    },
    {
      'title': 'Turn volume up to a comfortable level',
      'subtitle': 'Use your phone\'s volume buttons to set audio level.',
    },
    {
      'title': 'Connect headphones (recommended)',
      'subtitle': 'Wired or Bluetooth headphones improve audio quality.',
    },
    {
      'title': 'Keep screen on during tour',
      'subtitle': 'Audio continues in background, but keep the app open for best experience.',
    },
  ];

  bool get _allChecked => _checked.every((c) => c);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pre-Tour Checklist')),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: Colors.blue.shade50,
            padding: const EdgeInsets.all(16),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Before You Start Listening',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 4),
                Text(
                  'Complete these steps for the best tour experience.',
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _items.length,
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemBuilder: (_, i) {
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: CheckboxListTile(
                    value: _checked[i],
                    onChanged: (v) => setState(() => _checked[i] = v!),
                    title: Text(
                      _items[i]['title']!,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        decoration: _checked[i] ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    subtitle: Text(_items[i]['subtitle']!),
                    controlAffinity: ListTileControlAffinity.leading,
                    activeColor: Colors.blue,
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const Text(
                  '⚠️ Note: We cannot block phone calls or SMS during the tour. '
                  'Enable Focus/DND yourself for an uninterrupted experience.',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _allChecked ? Colors.blue : Colors.grey,
                    ),
                    onPressed: _allChecked ? widget.onReady : null,
                    child: const Text(
                      "I'm Ready – Start Listening",
                      style: TextStyle(fontSize: 16, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
