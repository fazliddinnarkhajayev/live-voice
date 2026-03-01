import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:livekit_client/livekit_client.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

enum GuideSessionStatus { idle, connecting, live, ending, error }

class GuideSessionState {
  final GuideSessionStatus status;
  final String? token;
  final String? livekitUrl;
  final String? roomName;
  final int listenerCount;
  final String? error;
  final Room? room;

  const GuideSessionState({
    this.status = GuideSessionStatus.idle,
    this.token,
    this.livekitUrl,
    this.roomName,
    this.listenerCount = 0,
    this.error,
    this.room,
  });

  GuideSessionState copyWith({
    GuideSessionStatus? status,
    String? token,
    String? livekitUrl,
    String? roomName,
    int? listenerCount,
    String? error,
    Room? room,
  }) {
    return GuideSessionState(
      status: status ?? this.status,
      token: token ?? this.token,
      livekitUrl: livekitUrl ?? this.livekitUrl,
      roomName: roomName ?? this.roomName,
      listenerCount: listenerCount ?? this.listenerCount,
      error: error,
      room: room ?? this.room,
    );
  }
}

class GuideProvider extends StateNotifier<GuideSessionState> {
  final int groupId;
  final Ref _ref;

  GuideProvider(this.groupId, this._ref) : super(const GuideSessionState());

  Future<void> goLive() async {
    // Request mic permission
    final micStatus = await Permission.microphone.request();
    if (!micStatus.isGranted) {
      state = state.copyWith(
        status: GuideSessionStatus.error,
        error: 'Microphone permission denied. Please enable it in settings.',
      );
      return;
    }

    state = state.copyWith(status: GuideSessionStatus.connecting, error: null);
    try {
      final data = await apiClient.post('/groups/$groupId/session/start', {})
          as Map<String, dynamic>;
      final token = data['token'] as String;
      final livekitUrl = data['livekit_url'] as String;
      final roomName = data['room'] as String;
      final listenerCount = data['listener_count'] as int? ?? 0;

      final room = Room();
      await room.connect(
        livekitUrl,
        token,
        roomOptions: const RoomOptions(
          adaptiveStream: true,
          dynacast: true,
        ),
      );

      // Enable microphone
      await room.localParticipant?.setMicrophoneEnabled(true);

      state = state.copyWith(
        status: GuideSessionStatus.live,
        token: token,
        livekitUrl: livekitUrl,
        roomName: roomName,
        listenerCount: listenerCount,
        room: room,
      );
    } on ApiException catch (e) {
      state = state.copyWith(status: GuideSessionStatus.error, error: e.message);
    } catch (e) {
      state = state.copyWith(
          status: GuideSessionStatus.error, error: 'Failed to start session: $e');
    }
  }

  Future<void> endSession() async {
    state = state.copyWith(status: GuideSessionStatus.ending, error: null);
    try {
      await state.room?.disconnect();
      await apiClient.post('/groups/$groupId/session/end', {});
      state = const GuideSessionState(status: GuideSessionStatus.idle);
    } on ApiException catch (e) {
      state = state.copyWith(status: GuideSessionStatus.error, error: e.message);
    } catch (e) {
      state = state.copyWith(status: GuideSessionStatus.error, error: 'Failed to end session: $e');
    }
  }

  void updateListenerCount(int count) {
    state = state.copyWith(listenerCount: count);
  }

  @override
  void dispose() {
    state.room?.disconnect();
    super.dispose();
  }
}

final guideProviderFamily =
    StateNotifierProvider.family<GuideProvider, GuideSessionState, int>(
  (ref, groupId) => GuideProvider(groupId, ref),
);
