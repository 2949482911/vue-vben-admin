<script setup lang="ts" name="AudiencePackageSelector">
// 定向包选择组件 - 供全媒体批投公用
// 参照 pageview/PageViewSelector.vue 模式：内部组装 展示(Show) + 弹窗(Modal) + 选择按钮
import type { AccountInfo, AudienceConfigData } from "#/views/marketing/creation/creation";
import { RuleMethod } from "#/views/marketing/creation/creation_enums";
import { Alert, Button, Card } from "ant-design-vue";
import { useVbenModal } from "@vben/common-ui";
import { computed, ref, watch } from "vue";
import AudiencePackageShow from "./AudiencePackageShow.vue";
import AudiencePackageModal from "./AudiencePackageModal.vue";

const props = withDefaults(
  defineProps<{
    /** 定向包数据 */
    audience: AudienceConfigData | null;
    /** 账户列表 */
    accountInfo: AccountInfo[];
    /** 定向包查询平台（各媒体不同，如 BYTEDANCE / VIVO / OPPO） */
    platform: string;
    /** 是否禁用内部选择（整体置灰） */
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits(["update:audience"]);

const [AudiencePackageModalComp, audiencePackageModalApi] = useVbenModal({
  connectedComponent: AudiencePackageModal,
});

// 本地定向包数据
const localAudience = ref<AudienceConfigData>({
  config: { method: props.audience?.config?.method || RuleMethod.ALL },
  data: new Map(),
});

// 计算定向包总数量
const totalCount = computed(() => {
  let total = 0;
  (localAudience.value.data as any).forEach((items: any[]) => {
    total += Array.isArray(items) ? items.length : 0;
  });
  return total;
});

// 打开弹窗
function openAudiencePackage() {
  audiencePackageModalApi.setData({
    config: { ...localAudience.value.config },
    data: new Map(toMap(localAudience.value.data)),
  });
  audiencePackageModalApi.open();
}

// 接收弹窗确认回调，更新本地数据并 emit 到最外层
function updateAudience(data: AudienceConfigData) {
  localAudience.value = {
    config: { ...data.config },
    data: toMap(data.data),
  };
  emit('update:audience', {
    config: { ...localAudience.value.config },
    data: toMap(localAudience.value.data),
  });
}

// 清空定向包
function handleClear() {
  localAudience.value = {
    config: { method: RuleMethod.ALL },
    data: new Map(),
  };
  emit('update:audience', {
    config: { ...localAudience.value.config },
    data: new Map(),
  });
}

// 监听父组件传入的 audience 变化，实现回显（兼容 Map / 普通对象）
watch(
  () => props.audience,
  (newAudience) => {
    if (newAudience && newAudience.data) {
      localAudience.value = {
        ...newAudience,
        config: { ...newAudience.config },
        data: toMap(newAudience.data),
      };
    }
  },
  { immediate: true, deep: true },
);

/** 兼容复用策略组后 Map 被 JSON 序列化成普通对象的情况 */
function toMap(data: any): Map<string, any[]> {
  return data instanceof Map ? data : new Map(Object.entries(data || {}));
}
</script>

<template>
  <div class="audience-package-selector-container" :class="{ 'is-disabled': disabled }">
    <Card title="定向包" class="info-card">
      <div class="card-content">
        <template v-if="totalCount > 0">
          <AudiencePackageShow :audience="localAudience" />
        </template>
        <template v-else>
          <Alert type="error" message="请选择定向包" show-icon class="empty-alert" />
        </template>
      </div>
      <div class="card-footer">
        <Button v-if="totalCount > 0" type="link" danger @click="handleClear">清空</Button>
        <Button type="primary" danger @click="openAudiencePackage">
          {{ totalCount > 0 ? "编辑" : "添加" }}
        </Button>
      </div>
    </Card>

    <AudiencePackageModalComp
      :account-info="accountInfo"
      :platform="platform"
      @update:orientation="updateAudience"
    />
  </div>
</template>

<style scoped lang="scss">
.audience-package-selector-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &.is-disabled {
    opacity: 0.5;
    filter: grayscale(1);

    .info-card {
      pointer-events: none;
    }
  }
}

.info-card {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.ant-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 12px 16px;
    min-height: 57px;
  }

  :deep(.ant-card-body) {
    padding: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.card-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.card-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.empty-alert {
  margin: 8px 0;
}
</style>
