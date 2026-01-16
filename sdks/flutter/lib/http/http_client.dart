import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/errors.dart';

class HttpClient {
  final String baseUrl;
  final String apiKey;
  final Duration timeout;

  HttpClient({
    required String baseUrl,
    required this.apiKey,
    this.timeout = const Duration(milliseconds: 10000),
  }) : baseUrl = baseUrl.endsWith('/')
            ? baseUrl.substring(0, baseUrl.length - 1)
            : baseUrl;

  Future<T> _request<T>(
    String path, {
    String method = 'GET',
    Object? body,
  }) async {
    final url = '$baseUrl$path';
    final headers = {
      'Authorization': 'Bearer $apiKey',
      'Content-Type': 'application/json',
    };

    late http.Response response;
    try {
      if (method == 'GET') {
        response =
            await http.get(Uri.parse(url), headers: headers).timeout(timeout);
      } else if (method == 'POST') {
        response = await http
            .post(
              Uri.parse(url),
              headers: headers,
              body: body != null ? jsonEncode(body) : null,
            )
            .timeout(timeout);
      } else if (method == 'PUT') {
        response = await http
            .put(
              Uri.parse(url),
              headers: headers,
              body: body != null ? jsonEncode(body) : null,
            )
            .timeout(timeout);
      } else if (method == 'DELETE') {
        response = await http
            .delete(Uri.parse(url), headers: headers)
            .timeout(timeout);
      } else {
        throw DevKitError('Unsupported HTTP method: $method');
      }

      if (response.statusCode == 401) {
        throw AuthenticationError('Invalid API key');
      }

      if (response.statusCode >= 400) {
        throw DevKitError('HTTP error: ${response.statusCode}');
      }

      if (response.statusCode == 204) {
        return null as T;
      }

      final responseBody =
          response.body.isNotEmpty ? jsonDecode(response.body) : null;

      return responseBody as T;
    } on TimeoutException {
      throw DevKitError('Request timeout');
    } on AuthenticationError {
      rethrow;
    } on DevKitError {
      rethrow;
    } catch (e) {
      throw DevKitError('Network error', e);
    }
  }

  Future<T> get<T>(String path) => _request<T>(path);

  Future<T> post<T>(String path, [Object? body]) =>
      _request<T>(path, method: 'POST', body: body);

  Future<T> put<T>(String path, [Object? body]) =>
      _request<T>(path, method: 'PUT', body: body);

  Future<void> delete(String path) => _request<void>(path, method: 'DELETE');
}
