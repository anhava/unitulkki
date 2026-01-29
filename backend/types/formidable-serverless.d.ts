declare module 'formidable-serverless' {
  import { IncomingMessage } from 'http';

  interface File {
    filepath: string;
    originalFilename: string | null;
    mimetype: string | null;
    size: number;
  }

  interface Fields {
    [key: string]: string | string[];
  }

  interface Files {
    [key: string]: File | File[];
  }

  interface Options {
    encoding?: string;
    uploadDir?: string;
    keepExtensions?: boolean;
    maxFileSize?: number;
    maxFields?: number;
    maxFieldsSize?: number;
    hash?: boolean | string;
    multiples?: boolean;
  }

  class IncomingForm {
    encoding: string;
    uploadDir: string;
    keepExtensions: boolean;
    maxFileSize: number;
    maxFields: number;
    maxFieldsSize: number;
    hash: boolean | string;
    multiples: boolean;
    openedFiles: File[];

    constructor(options?: Options);

    parse(
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ): void;

    on(event: string, callback: (...args: any[]) => void): this;
  }

  const formidable: {
    IncomingForm: typeof IncomingForm;
  };

  export default formidable;
  export { IncomingForm, File, Fields, Files, Options };
}
