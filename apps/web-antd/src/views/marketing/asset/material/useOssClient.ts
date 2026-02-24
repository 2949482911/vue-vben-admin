import OSS from 'ali-oss';
import { ref } from 'vue';
import type { OssClient } from '#/types/ali-oss-client';
import type { voucherParams } from '#/api/models';
import { uploadCredentialsApi } from '#/api/core';

let ossClient: OssClient | null = null;
const voucher = ref<voucherParams>();

export async function useOssClient(): Promise<OssClient> {
  if (!voucher.value) {
    voucher.value = await uploadCredentialsApi.fetchEvidence();
  }

  if (!ossClient) {
    ossClient = new OSS({
      region: 'oss-cn-shenzhen',
      bucket: 'starfiread',
      accessKeyId: voucher.value!.accessKeyId,
      accessKeySecret: voucher.value!.accessKeySecret,
      stsToken: voucher.value!.securityToken,
      authorizationV4: true,
      refreshSTSToken: async () => {
        const res = await uploadCredentialsApi.fetchEvidence();
        voucher.value = res;
        return {
          accessKeyId: res.accessKeyId,
          accessKeySecret: res.accessKeySecret,
          stsToken: res.securityToken,
        };
      },
      refreshSTSTokenInterval: 5 * 60 * 1000,
    });
  }

  return ossClient;
}
