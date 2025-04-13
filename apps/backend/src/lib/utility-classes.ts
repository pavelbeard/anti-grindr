export class AppError extends Error {
  statusCode = 400

  static typeToCode = {
    badRequest: 400,
    validation: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    conflict: 409,
    server: 500,
  }

  constructor(type: keyof typeof AppError.typeToCode, message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = Error.name
    this.statusCode = AppError.typeToCode[type]
    Error.captureStackTrace(this)
  }
}
