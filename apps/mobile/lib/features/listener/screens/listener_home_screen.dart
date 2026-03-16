import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/listener_provider.dart';
import 'pretour_checklist_screen.dart';
import 'tour_mode_screen.dart';

class ListenerHomeScreen extends ConsumerStatefulWidget {
  final GroupModel group;
  const ListenerHomeScreen({super.key, required this.group});

  @override
  ConsumerState<ListenerHomeScreen> createState() => _ListenerHomeScreenState();
}

class _ListenerHomeScreenState extends ConsumerState<ListenerHomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(listenerProviderFamily(widget.group.id).notifier).checkSession(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(listenerProviderFamily(widget.group.id));
    final notifier = ref.read(listenerProviderFamily(widget.group.id).notifier);

    ref.listen<ListenerSessionState>(listenerProviderFamily(widget.group.id), (_, next) {
      if (next.status == ListenerSessionStatus.listening) {
        Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => TourModeScreen(
            group: widget.group,
            notifier: notifier,
          ),
        ));
      }
    });

    return Scaffold(
      appBar: AppBar(title: Text(widget.group.name)),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildSessionStatus(session),
            const SizedBox(height: 32),
            if (session.error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(session.error!,
                    style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
              ),
            if (session.sessionActive)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                  onPressed: session.status == ListenerSessionStatus.connecting
                      ? null
                      : () => _onListenTapped(context),
                  icon: session.status == ListenerSessionStatus.connecting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.headphones, color: Colors.white),
                  label: const Text('Listen Live',
                      style: TextStyle(fontSize: 18, color: Colors.white)),
                ),
              )
            else
              Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton.icon(
                      onPressed: session.status == ListenerSessionStatus.checking
                          ? null
                          : () => notifier.checkSession(),
                      icon: session.status == ListenerSessionStatus.checking
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.refresh),
                      label: const Text('Check for Live Session',
                          style: TextStyle(fontSize: 16)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'No active session.\nWaiting for your guide to go live.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSessionStatus(ListenerSessionState session) {
    final isLive = session.sessionActive;
    return Column(
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: (isLive ? Colors.green : Colors.grey).withOpacity(0.15),
            shape: BoxShape.circle,
            border: Border.all(
                color: isLive ? Colors.green : Colors.grey, width: 3),
          ),
          child: Icon(
            isLive ? Icons.radio : Icons.radio_button_unchecked,
            size: 60,
            color: isLive ? Colors.green : Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          isLive ? 'Guide is LIVE' : 'Guide is Offline',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: isLive ? Colors.green : Colors.grey,
          ),
        ),
      ],
    );
  }

  void _onListenTapped(BuildContext context) {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => PreTourChecklistScreen(
        onReady: () {
          Navigator.pop(context);
          ref.read(listenerProviderFamily(widget.group.id).notifier).joinSession();
        },
      ),
    ));
  }
}
