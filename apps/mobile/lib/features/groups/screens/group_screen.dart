import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/groups_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../guide/screens/guide_home_screen.dart';
import '../../listener/screens/listener_home_screen.dart';

class GroupScreen extends ConsumerStatefulWidget {
  const GroupScreen({super.key});

  @override
  ConsumerState<GroupScreen> createState() => _GroupScreenState();
}

class _GroupScreenState extends ConsumerState<GroupScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(groupsProvider.notifier).loadGroups());
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final groups = ref.watch(groupsProvider);
    final user = auth.user!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Groups'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: Colors.blue.shade50,
            padding: const EdgeInsets.all(12),
            child: Text(
              'Logged in as ${user.name} (${user.role})',
              style: const TextStyle(fontWeight: FontWeight.w500),
              textAlign: TextAlign.center,
            ),
          ),
          if (groups.error != null)
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(groups.error!, style: const TextStyle(color: Colors.red)),
            ),
          Expanded(
            child: groups.loading
                ? const Center(child: CircularProgressIndicator())
                : groups.groups.isEmpty
                    ? _buildEmptyState(user.role)
                    : ListView.builder(
                        itemCount: groups.groups.length,
                        itemBuilder: (_, i) {
                          final g = groups.groups[i];
                          return ListTile(
                            leading: const Icon(Icons.group, color: Colors.blue),
                            title: Text(g.name),
                            subtitle: user.isGuide
                                ? Text('Invite code: ${g.inviteCode}')
                                : Text('Code: ${g.inviteCode}'),
                            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              if (user.isGuide) {
                                Navigator.of(context).push(MaterialPageRoute(
                                  builder: (_) => GuideHomeScreen(group: g),
                                ));
                              } else {
                                Navigator.of(context).push(MaterialPageRoute(
                                  builder: (_) => ListenerHomeScreen(group: g),
                                ));
                              }
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: user.isGuide
          ? FloatingActionButton.extended(
              onPressed: () => _showCreateGroupDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New Group'),
            )
          : FloatingActionButton.extended(
              onPressed: () => _showJoinGroupDialog(context),
              icon: const Icon(Icons.group_add),
              label: const Text('Join Group'),
            ),
    );
  }

  Widget _buildEmptyState(String role) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.group_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            role == 'guide'
                ? 'No groups yet.\nTap + to create your first group.'
                : 'No groups yet.\nAsk your guide for an invite code.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.grey, fontSize: 16),
          ),
        ],
      ),
    );
  }

  void _showCreateGroupDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Group'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Group Name', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descCtrl,
              decoration: const InputDecoration(labelText: 'Description (optional)', border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              await ref.read(groupsProvider.notifier).createGroup(
                    nameCtrl.text.trim(),
                    description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                  );
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  void _showJoinGroupDialog(BuildContext context) {
    final codeCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Join Group'),
        content: TextField(
          controller: codeCtrl,
          decoration: const InputDecoration(
            labelText: 'Invite Code',
            border: OutlineInputBorder(),
            hintText: 'e.g. DEMO2024',
          ),
          textCapitalization: TextCapitalization.characters,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (codeCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              await ref.read(groupsProvider.notifier).joinGroup(codeCtrl.text.trim().toUpperCase());
            },
            child: const Text('Join'),
          ),
        ],
      ),
    );
  }
}
