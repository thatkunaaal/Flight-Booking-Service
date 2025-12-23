class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.StatusCodes = statusCode;
    this.explanation = message;
  }
}

module.exports = AppError;
