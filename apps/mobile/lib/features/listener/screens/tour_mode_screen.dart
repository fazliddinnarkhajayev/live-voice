import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/listener_provider.dart';

class TourModeScreen extends StatefulWidget {
  final GroupModel group;
  final ListenerProvider notifier;

  const TourModeScreen({super.key, required this.group, required this.notifier});

  @override
  State<TourModeScreen> createState() => _TourModeScreenState();
}

class _TourModeScreenState extends State<TourModeScreen> {
  @override
  void initState() {
    super.initState();
    // Keep screen on, full-screen immersive
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  @override
  void dispose() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (!didPop) {
          await _confirmLeave(context);
        }
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),
                // Live indicator
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.circle, color: Colors.white, size: 10),
                      SizedBox(width: 6),
                      Text('LIVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                const Icon(Icons.headphones, size: 96, color: Colors.white),
                const SizedBox(height: 24),
                Text(
                  widget.group.name,
                  style: const TextStyle(
                      color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Listening to your guide...',
                  style: TextStyle(color: Colors.grey, fontSize: 16),
                ),
                const Spacer(),
                // Info banner
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white10,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'You are in listen-only mode.\nYour microphone is not active.',
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white54),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => _confirmLeave(context),
                    icon: const Icon(Icons.exit_to_app),
                    label: const Text('Leave Tour', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmLeave(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.grey.shade900,
        title: const Text('Leave Tour', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Are you sure you want to leave the live tour?',
          style: TextStyle(color: Colors.grey),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Stay'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Leave', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await widget.notifier.leaveSession();
      if (context.mounted) Navigator.of(context).pop();
    }
  }
}
