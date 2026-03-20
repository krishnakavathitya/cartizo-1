import { GraphQLError } from 'graphql'

export class AppError extends GraphQLError {
  constructor(message: string, code: string, statusCode: number = 400) {
    super(message, {
      extensions: {
        code,
        http: { status: statusCode },
      },
    })
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400)
    if (fields) {
      this.extensions.fields = fields
    }
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class BusinessError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_ERROR') {
    super(message, code, 400)
  }
}
