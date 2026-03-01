import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

class GroupModel {
  final int id;
  final String name;
  final String? description;
  final String inviteCode;
  final int guideId;

  const GroupModel({
    required this.id,
    required this.name,
    this.description,
    required this.inviteCode,
    required this.guideId,
  });

  factory GroupModel.fromJson(Map<String, dynamic> json) => GroupModel(
        id: json['id'] as int,
        name: json['name'] as String,
        description: json['description'] as String?,
        inviteCode: json['invite_code'] as String,
        guideId: json['guide_id'] as int,
      );
}

class GroupsState {
  final List<GroupModel> groups;
  final bool loading;
  final String? error;

  const GroupsState({this.groups = const [], this.loading = false, this.error});

  GroupsState copyWith({List<GroupModel>? groups, bool? loading, String? error}) {
    return GroupsState(
      groups: groups ?? this.groups,
      loading: loading ?? this.loading,
      error: error,
    );
  }
}

class GroupsNotifier extends StateNotifier<GroupsState> {
  GroupsNotifier() : super(const GroupsState());

  Future<void> loadGroups() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await apiClient.get('/groups') as List;
      state = state.copyWith(
        loading: false,
        groups: data.map((e) => GroupModel.fromJson(e as Map<String, dynamic>)).toList(),
      );
    } on ApiException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Network error');
    }
  }

  Future<GroupModel?> createGroup(String name, {String? description}) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await apiClient.post('/groups', {
        'name': name,
        if (description != null) 'description': description,
      }) as Map<String, dynamic>;
      final group = GroupModel.fromJson(data);
      state = state.copyWith(loading: false, groups: [...state.groups, group]);
      return group;
    } on ApiException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
      return null;
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Network error');
      return null;
    }
  }

  Future<GroupModel?> joinGroup(String inviteCode) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await apiClient.post('/groups/join', {
        'invite_code': inviteCode,
      }) as Map<String, dynamic>;
      final group = GroupModel.fromJson(data);
      state = state.copyWith(loading: false, groups: [...state.groups, group]);
      return group;
    } on ApiException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
      return null;
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Network error');
      return null;
    }
  }
}

final groupsProvider = StateNotifierProvider<GroupsNotifier, GroupsState>(
  (ref) => GroupsNotifier(),
);
