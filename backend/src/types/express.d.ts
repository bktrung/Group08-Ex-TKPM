import { TFunction } from 'i18next';

declare global {
  namespace Express {
    interface Request {
      t: TFunction;
      i18n: any;
      lng: string;
    }
  }
} 