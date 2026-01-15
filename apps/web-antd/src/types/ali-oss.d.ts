declare module 'ali-oss' {
  export interface PutOptions {
    progress?: (percent: number) => void;
  }

  export interface PutResult {
    name: string;
    url: string;
    res: any;
  }

  export interface OssOptions {
    region: string;
    bucket: string;
    accessKeyId: string;
    accessKeySecret: string;
    stsToken?: string;
    authorizationV4?: boolean;
    refreshSTSToken?: () => Promise<{
      accessKeyId: string;
      accessKeySecret: string;
      stsToken: string;
    }>;
    refreshSTSTokenInterval?: number;
  }

  export default class OSS {
    constructor(options: OssOptions);

    put(
      name: string,
      file: File | Blob,
      options?: PutOptions
    ): Promise<PutResult>;
  }
}
