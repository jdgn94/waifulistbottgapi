import { Request, RequestHandler } from 'express';
import { Readable } from 'stream';


declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        stream: Readable;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }

    interface FileArray {
      image: Multer.file;
      fav_img: Multer.file;
      summer_img: Multer.file;
      winter_img: Multer.file;
      spring_img: Multer.file;
      fall_img: Multer.file;
      // album: [Multer.File];
    }

    interface Request {
      file: Multer.File;
      files: FileArray;
    }
  }
}
declare function multer(options?: multer.Options): multer.Multer;

declare namespace multer {
  interface Multer {
    single(fieldName: string): RequestHandler;
    array(fieldName: string, maxCount?: number): RequestHandler;
    fields(fields: ReadonlyArray<Field>): RequestHandler;
    any(): RequestHandler;
    none(): RequestHandler;
  }

  function diskStorage(options: DiskStorageOptions): StorageEngine;

  function memoryStorage(): StorageEngine;

  type ErrorCode =
    | 'LIMIT_PART_COUNT'
    | 'LIMIT_FILE_SIZE'
    | 'LIMIT_FILE_COUNT'
    | 'LIMIT_FIELD_KEY'
    | 'LIMIT_FIELD_VALUE'
    | 'LIMIT_FIELD_COUNT'
    | 'LIMIT_UNEXPECTED_FILE';

  class MulterError extends Error {
    constructor(code: ErrorCode, field?: string);
    name: string;
    code: ErrorCode;
    message: string;
    field?: string;
  }

  interface FileFilterCallback {
    (error: Error): void;
    (error: null, acceptFile: boolean): void;
  }

  interface Options {

    storage?: StorageEngine;
    dest?: string;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
    fileFilter?(
      req: Request,
      file: Express.Multer.File,
      callback: FileFilterCallback,
    ): void;
  }

  interface StorageEngine {
    _handleFile(
      req: Request,
      file: Express.Multer.File,
      callback: (error?: any, info?: Partial<Express.Multer.File>) => void
    ): void;
    _removeFile(
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null) => void
    ): void;
  }

  interface DiskStorageOptions {
    destination?: string | ((
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, destination: string) => void
    ) => void);
    filename?(
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void
    ): void;
  }

  interface Field {
    name: string;
    maxCount?: number;
  }
}

export default multer;