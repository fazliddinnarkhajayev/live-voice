import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ApiClient {
  final String _base;
  String? _token;

  ApiClient({String? baseUrl}) : _base = baseUrl ?? kApiBaseUrl;

  void setToken(String token) => _token = token;
  void clearToken() => _token = null;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$_base$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handle(response);
  }

  Future<dynamic> get(String path) async {
    final response = await http.get(
      Uri.parse('$_base$path'),
      headers: _headers,
    );
    return _handle(response);
  }

  dynamic _handle(http.Response response) {
    final decoded = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }
    final msg = decoded is Map ? (decoded['message'] ?? 'Request failed') : 'Request failed';
    throw ApiException(msg is List ? msg.join(', ') : msg.toString(),
        statusCode: response.statusCode);
  }
}

final apiClient = ApiClient();
