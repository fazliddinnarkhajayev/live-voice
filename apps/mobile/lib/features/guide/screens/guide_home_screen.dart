import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/guide_provider.dart';

class GuideHomeScreen extends ConsumerWidget {
  final GroupModel group;
  const GuideHomeScreen({super.key, required this.group});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final guide = ref.watch(guideProviderFamily(group.id));
    final notifier = ref.read(guideProviderFamily(group.id).notifier);

    return Scaffold(
      appBar: AppBar(
        title: Text(group.name),
        actions: [
          if (guide.status == GuideSessionStatus.live)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Row(
                children: [
                  const Icon(Icons.people, size: 18),
                  const SizedBox(width: 4),
                  Text('${guide.listenerCount}', style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildStatusIndicator(guide.status),
            const SizedBox(height: 32),
            _buildInviteCodeCard(group.inviteCode),
            const SizedBox(height: 32),
            if (guide.error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  guide.error!,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
              ),
            _buildActionButton(context, guide, notifier),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(GuideSessionStatus status) {
    final (icon, label, color) = switch (status) {
      GuideSessionStatus.idle => (Icons.mic_none, 'Not Live', Colors.grey),
      GuideSessionStatus.connecting => (Icons.hourglass_empty, 'Connecting...', Colors.orange),
      GuideSessionStatus.live => (Icons.mic, 'LIVE', Colors.red),
      GuideSessionStatus.ending => (Icons.hourglass_empty, 'Ending...', Colors.orange),
      GuideSessionStatus.error => (Icons.error_outline, 'Error', Colors.red),
    };
    return Column(
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 3),
          ),
          child: Icon(icon, size: 60, color: color),
        ),
        const SizedBox(height: 12),
        Text(label, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }

  Widget _buildInviteCodeCard(String code) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Invite Code', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 8),
            SelectableText(
              code,
              style: const TextStyle(
                  fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: 4),
            ),
            const SizedBox(height: 4),
            const Text(
              'Share this code with your listeners',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context,
    GuideSessionState guide,
    GuideProvider notifier,
  ) {
    if (guide.status == GuideSessionStatus.live) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
          onPressed: () async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const Text('End Session'),
                content: const Text('Are you sure you want to end the live session?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text('End'),
                  ),
                ],
              ),
            );
            if (confirm == true) await notifier.endSession();
          },
          icon: const Icon(Icons.stop, color: Colors.white),
          label: const Text('End Session', style: TextStyle(fontSize: 18, color: Colors.white)),
        ),
      );
    }

    final isLoading = guide.status == GuideSessionStatus.connecting ||
        guide.status == GuideSessionStatus.ending;

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
        onPressed: isLoading ? null : () => notifier.goLive(),
        icon: isLoading
            ? const SizedBox(
                width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : const Icon(Icons.mic, color: Colors.white),
        label: Text(
          isLoading ? 'Please wait...' : 'Go Live',
          style: const TextStyle(fontSize: 18, color: Colors.white),
        ),
      ),
    );
  }
}
