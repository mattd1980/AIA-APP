export class AppError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static notFound(entity: string): AppError {
    const labels: Record<string, string> = {
      Room: 'Piece introuvable',
      Safe: 'Coffre introuvable',
      Location: 'Lieu introuvable',
      Item: 'Objet introuvable',
      Image: 'Image introuvable',
      Inventory: 'Inventaire introuvable',
      User: 'Utilisateur non trouve',
    };
    return new AppError(404, labels[entity] ?? `${entity} introuvable`);
  }

  static badRequest(message: string): AppError {
    return new AppError(400, message);
  }

  static unauthorized(message = 'Authentification requise'): AppError {
    return new AppError(401, message);
  }

  static forbidden(message = 'Acces refuse'): AppError {
    return new AppError(403, message);
  }
}
