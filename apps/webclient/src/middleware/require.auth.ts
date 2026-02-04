import { Request, Response, NextFunction } from 'express';

export function redirectUnauthenticated(req: Request, res: Response, next: NextFunction): void {
  if (!req.session) {
    res.redirect('/login');
    return;
  }
  next();
}
