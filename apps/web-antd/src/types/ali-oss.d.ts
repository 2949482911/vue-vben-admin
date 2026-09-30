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
    /** true 走 https 拼 endpoint，默认 false 会走 http */
    secure?: boolean;
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
