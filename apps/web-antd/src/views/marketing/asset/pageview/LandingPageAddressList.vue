<script setup lang="ts" name="LandingPageAddressList">
/**
 * 落地页地址展示
 *
 * 按媒体配置地址类型，类型用标签展示，地址不直接铺开，提供一键复制。
 */
import { computed } from 'vue';

import { CopyOutlined } from '@ant-design/icons-vue';
import { Button, message, Tag, Tooltip } from 'ant-design-vue';

type AddressKey = 'pageUrl' | 'pageUrlIaa' | 'pageUrlIap';

interface AddressType {
  color: string;
  key: AddressKey;
  label: string;
}

const props = defineProps<{
  config?: null | Record<string, any>;
  platform: string;
}>();

const DEFAULT_ADDRESS_TYPES: AddressType[] = [
  { color: 'green', key: 'pageUrl', label: '详情页' },
];

/** 每个媒体支持的地址类型 */
const PLATFORM_ADDRESS_TYPES: Record<string, AddressType[]> = {
  bytedance: [
    { color: 'blue', key: 'pageUrlIap', label: 'IAP' },
    { color: 'purple', key: 'pageUrlIaa', label: 'IAA' },
    { color: 'default', key: 'pageUrl', label: 'pageUrl' },
  ],
  huawei: [{ color: 'cyan', key: 'pageUrl', label: '详情页' }],
  oppo: [{ color: 'orange', key: 'pageUrl', label: '详情页' }],
  tencent: [{ color: 'geekblue', key: 'pageUrl', label: '详情页' }],
  vivo: [{ color: 'green', key: 'pageUrl', label: '详情页' }],
};

const addressTypes = computed(
  () => PLATFORM_ADDRESS_TYPES[props.platform] ?? DEFAULT_ADDRESS_TYPES,
);

const addresses = computed(() =>
  addressTypes.value
    .map((type) => ({
      ...type,
      url: String(props.config?.[type.key] ?? '').trim(),
    }))
    .filter((item) => item.url),
);

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    message.success('地址已复制');
  } catch {
    message.error('复制失败');
  }
}
</script>

<template>
  <div v-if="addresses.length" class="address-list">
    <div v-for="item in addresses" :key="item.key" class="address-item">
      <Tooltip :title="item.url" placement="topLeft">
        <Tag :bordered="false" :color="item.color">{{ item.label }}</Tag>
      </Tooltip>
      <Tooltip title="复制地址">
        <Button
          class="copy-button"
          size="small"
          type="text"
          @click="copyUrl(item.url)"
        >
          <CopyOutlined />
        </Button>
      </Tooltip>
    </div>
  </div>
  <span v-else>-</span>
</template>

<style scoped lang="scss">
.address-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  align-items: center;
}

.address-item {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}

.copy-button {
  height: 20px;
  padding: 0 2px;
}
</style>
