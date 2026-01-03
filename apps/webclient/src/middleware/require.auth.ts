import { Request, Response, NextFunction } from 'express';

export function redirectUnauthenticated(req: Request, res: Response, next: NextFunction): void {
  if (!req.session || !req.session.user) {
    res.redirect('/login');
    return;
  }
  next();
}
