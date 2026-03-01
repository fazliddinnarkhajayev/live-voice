import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../auth/models/user_model.dart';
import '../../../core/network/api_client.dart';

class AuthState {
  final UserModel? user;
  final bool loading;
  final String? error;

  const AuthState({this.user, this.loading = false, this.error});

  AuthState copyWith({UserModel? user, bool? loading, String? error, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      loading: loading ?? this.loading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _tryRestoreToken();
  }

  Future<void> _tryRestoreToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;
    apiClient.setToken(token);
    try {
      final data = await apiClient.get('/auth/me');
      state = state.copyWith(user: UserModel.fromJson(data as Map<String, dynamic>));
    } catch (_) {
      await prefs.remove('token');
      apiClient.clearToken();
    }
  }

  Future<void> register(String email, String password, String name, String role) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await apiClient.post('/auth/register', {
        'email': email,
        'password': password,
        'name': name,
        'role': role,
      }) as Map<String, dynamic>;
      await _saveSession(data);
    } on ApiException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Network error. Check your connection.');
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await apiClient.post('/auth/login', {
        'email': email,
        'password': password,
      }) as Map<String, dynamic>;
      await _saveSession(data);
    } on ApiException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Network error. Check your connection.');
    }
  }

  Future<void> _saveSession(Map<String, dynamic> data) async {
    final token = data['access_token'] as String;
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    apiClient.setToken(token);
    state = state.copyWith(user: user, loading: false, error: null);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    apiClient.clearToken();
    state = state.copyWith(clearUser: true, loading: false, error: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
