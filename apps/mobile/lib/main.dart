import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/groups/screens/group_screen.dart';

void main() {
  runApp(const ProviderScope(child: LiveVoiceApp()));
}

class LiveVoiceApp extends ConsumerWidget {
  const LiveVoiceApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return MaterialApp(
      title: 'Tour Guide Live Voice',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: auth.user != null ? const GroupScreen() : const LoginScreen(),
    );
  }
}
