class DevKitError implements Exception {
  final String message;
  final Object? cause;

  DevKitError(this.message, [this.cause]);

  @override
  String toString() => 'DevKitError: $message';
}

class AuthenticationError extends DevKitError {
  AuthenticationError(super.message, [super.cause]);

  @override
  String toString() => 'AuthenticationError: $message';
}
