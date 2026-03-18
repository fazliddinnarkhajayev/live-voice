import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:livekit_client/livekit_client.dart';
import '../../../core/network/api_client.dart';

enum ListenerSessionStatus { idle, checking, connecting, listening, disconnecting, error }

class ListenerSessionState {
  final ListenerSessionStatus status;
  final bool sessionActive;
  final String? error;
  final Room? room;

  const ListenerSessionState({
    this.status = ListenerSessionStatus.idle,
    this.sessionActive = false,
    this.error,
    this.room,
  });

  ListenerSessionState copyWith({
    ListenerSessionStatus? status,
    bool? sessionActive,
    String? error,
    Room? room,
    bool clearRoom = false,
  }) {
    return ListenerSessionState(
      status: status ?? this.status,
      sessionActive: sessionActive ?? this.sessionActive,
      error: error,
      room: clearRoom ? null : (room ?? this.room),
    );
  }
}

class ListenerProvider extends StateNotifier<ListenerSessionState> {
  final int groupId;

  ListenerProvider(this.groupId) : super(const ListenerSessionState());

  Future<void> checkSession() async {
    state = state.copyWith(status: ListenerSessionStatus.checking, error: null);
    try {
      final data = await apiClient.get('/groups/$groupId/session/status') as Map<String, dynamic>;
      state = state.copyWith(
        status: ListenerSessionStatus.idle,
        sessionActive: data['active'] as bool? ?? false,
      );
    } catch (_) {
      state = state.copyWith(status: ListenerSessionStatus.idle, sessionActive: false);
    }
  }

  Future<void> joinSession() async {
    state = state.copyWith(status: ListenerSessionStatus.connecting, error: null);
    try {
      final data = await apiClient.post('/groups/$groupId/session/join', {})
          as Map<String, dynamic>;
      final token = data['token'] as String;
      final livekitUrl = data['livekit_url'] as String;

      final room = Room();

      // Listener MUST NOT publish - enforce via server token too
      await room.connect(
        livekitUrl,
        token,
        roomOptions: const RoomOptions(
          adaptiveStream: true,
          dynacast: false,
        ),
      );

      // Explicitly ensure no mic is published (defense in depth)
      await room.localParticipant?.setMicrophoneEnabled(false);

      state = state.copyWith(
        status: ListenerSessionStatus.listening,
        room: room,
      );
    } on ApiException catch (e) {
      state = state.copyWith(status: ListenerSessionStatus.error, error: e.message);
    } catch (e) {
      state = state.copyWith(
          status: ListenerSessionStatus.error, error: 'Failed to connect: $e');
    }
  }

  Future<void> leaveSession() async {
    state = state.copyWith(status: ListenerSessionStatus.disconnecting, error: null);
    try {
      await state.room?.disconnect();
      state = state.copyWith(
        status: ListenerSessionStatus.idle,
        sessionActive: false,
        clearRoom: true,
      );
    } catch (e) {
      state = state.copyWith(
          status: ListenerSessionStatus.idle, clearRoom: true);
    }
  }

  @override
  void dispose() {
    state.room?.disconnect();
    super.dispose();
  }
}

final listenerProviderFamily =
    StateNotifierProvider.family<ListenerProvider, ListenerSessionState, int>(
  (ref, groupId) => ListenerProvider(groupId),
);
