export class DevKitError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DevKitError';
  }
}

export class AuthenticationError extends DevKitError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'AuthenticationError';
  }
}
