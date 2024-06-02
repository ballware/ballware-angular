import { Observable } from 'rxjs';

export enum SCREEN_SIZE {
  XS,
  SM,
  MD,
  LG,
  XL
}

export abstract class ResponsiveService {

  abstract get resize$(): Observable<SCREEN_SIZE>;

  abstract get small$(): Observable<boolean>;

  abstract onResize(size: SCREEN_SIZE): void;
}
