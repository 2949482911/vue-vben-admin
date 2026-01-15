declare module 'spark-md5' {
  interface SparkMD5Static {
    new (): {
      append(data: ArrayBuffer | string): void;
      end(): string;
      reset(): void;
    };

    ArrayBuffer: {
      new (): {
        append(data: ArrayBuffer): void;
        end(): string;
        reset(): void;
      };
    };
  }

  const SparkMD5: SparkMD5Static;
  export default SparkMD5;
}
