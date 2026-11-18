<script setup lang="ts" name="ProductConfigAllocationDrawer">
import type {
  ProductConfigAllocationConfig,
  ProductConfigAllocationMethod,
  ProductConfigItem,
} from './types';

/**
 * 产品配置分配抽屉
 *
 * 多条产品配置项 + 三种分配方式：
 * - 统一配置：所有账户共用一组，账户内计划循环
 * - 分账户配置：每个账户独立维护配置，账户内计划循环
 * - 平均分配：全局配置项按全部计划顺序铺开
 */
import type { AccountInfo } from '#/views/marketing/creation/creation';

import { computed, nextTick, ref, watch } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Alert, Button, message, Radio, RadioGroup, Tag } from 'ant-design-vue';

import TextareaTags from '#/components/textarea_tags/TextareaTags.vue';
import ProductImageButtonField
  from '#/views/marketing/creation/bytedance/components/ProductImageButtonField.vue';
import MaterialSelector
  from '#/views/marketing/creation/components/material/MaterialSelector.vue';

import {
  cloneProductConfigItem,
  createEmptyProductConfigItem,
  normalizeProductConfig,
} from './types';

const props = defineProps<{
  accountInfo: AccountInfo[];
}>();

const emit = defineEmits<{
  'update:productConfig': [value: ProductConfigAllocationConfig];
}>();

const MODE_OPTIONS: Array<{
  desc: string;
  label: string;
  value: ProductConfigAllocationMethod;
}> = [
  {
    desc: '所有账户共用一组配置，账户内计划循环',
    label: '统一配置',
    value: 'ALL_SAME',
  },
  {
    desc: '每个账户独立配置，账户内计划循环',
    label: '分账户配置',
    value: 'PER_ACCOUNT',
  },
  {
    desc: '全局配置项按全部计划顺序平均铺开',
    label: '平均分配',
    value: 'AVERAGE',
  },
];

const method = ref<ProductConfigAllocationMethod>('ALL_SAME');
const globalItems = ref<ProductConfigItem[]>([]);
const accountItems = ref<Map<string, ProductConfigItem[]>>(new Map());
const currentAccountId = ref('');
const selectedIndex = ref(0);
const draft = ref<ProductConfigItem>(createEmptyProductConfigItem());
const drawerOpen = ref(false);

const currentAccount = computed(() =>
  props.accountInfo.find(
    (account) => account.localAdvertiserId === currentAccountId.value,
  ),
);

const currentList = computed<ProductConfigItem[]>(() => {
  if (method.value === 'PER_ACCOUNT') {
    return accountItems.value.get(currentAccountId.value) ?? [];
  }
  return globalItems.value;
});

const selectedItem = computed(() => currentList.value[selectedIndex.value]);

const previewItems = computed(() => {
  const items = currentList.value;
  if (items.length === 0) {
    return [];
  }
  const count = method.value === 'AVERAGE' ? 8 : 4;
  return Array.from({ length: count }, (_, index) => ({
    config: items[index % items.length]!,
    name: `计划 ${String(index + 1).padStart(2, '0')}`,
  }));
});

function displayName(item: ProductConfigItem, index: number) {
  return item.titles?.[0] || `配置项 ${String(index + 1).padStart(2, '0')}`;
}

function setCurrentList(items: ProductConfigItem[]) {
  if (method.value === 'PER_ACCOUNT') {
    if (!currentAccountId.value) {
      return;
    }
    accountItems.value.set(currentAccountId.value, items);
    accountItems.value = new Map(accountItems.value);
  } else {
    globalItems.value = items;
  }
}

function saveDraft() {
  const list = [...currentList.value];
  if (selectedIndex.value >= 0 && selectedIndex.value < list.length) {
    list[selectedIndex.value] = cloneProductConfigItem(draft.value);
    setCurrentList(list);
  }
}

function loadDraft(index = 0) {
  selectedIndex.value = index;
  const item = currentList.value[index];
  draft.value = item
    ? cloneProductConfigItem(item)
    : createEmptyProductConfigItem();
}

watch(
  draft,
  (value) => {
    const list = [...currentList.value];
    if (selectedIndex.value >= 0 && selectedIndex.value < list.length) {
      list[selectedIndex.value] = cloneProductConfigItem(value);
      setCurrentList(list);
    }
  },
  { deep: true },
);

function switchMode(value: ProductConfigAllocationMethod) {
  saveDraft();
  method.value = value;
  if (value === 'PER_ACCOUNT' && !currentAccountId.value) {
    currentAccountId.value = props.accountInfo[0]?.localAdvertiserId ?? '';
  }
  loadDraft(0);
}

function switchAccount(accountId: string) {
  saveDraft();
  currentAccountId.value = accountId;
  loadDraft(0);
}

function selectItem(index: number) {
  if (index === selectedIndex.value) {
    return;
  }
  saveDraft();
  loadDraft(index);
}

function addItem() {
  saveDraft();
  const list = [...currentList.value, createEmptyProductConfigItem()];
  setCurrentList(list);
  loadDraft(list.length - 1);
}

function copyItem() {
  if (!selectedItem.value) {
    return;
  }
  saveDraft();
  const list = [...currentList.value];
  list.splice(
    selectedIndex.value + 1,
    0,
    cloneProductConfigItem(draft.value),
  );
  setCurrentList(list);
  loadDraft(selectedIndex.value + 1);
}

function removeItem() {
  if (!selectedItem.value) {
    return;
  }
  saveDraft();
  const list = [...currentList.value];
  list.splice(selectedIndex.value, 1);
  setCurrentList(list);
  loadDraft(Math.min(selectedIndex.value, Math.max(0, list.length - 1)));
}

const [ProductImageModal, productImageModalApi] = useVbenModal({
  connectedComponent: MaterialSelector,
});

function openProductImageModal() {
  productImageModalApi.setData({
    materialType: 'image',
    maxCount: 50,
    preSelectedIds: [...draft.value.image_button],
  });
  productImageModalApi.open();
}

function onProductImageSelected(
  selectedMaterials: Array<{ id: number | string }>,
) {
  draft.value.image_button = selectedMaterials.map((item) => String(item.id));
}

function validateItems(items: ProductConfigItem[], label: string) {
  if (items.length === 0) {
    return `${label}至少需要配置 1 条产品配置`;
  }
  for (let index = 0; index < items.length; index++) {
    const item = items[index]!;
    if ((item.titles ?? []).length === 0) {
      return `${label}第 ${index + 1} 条配置缺少产品名称`;
    }
    if ((item.image_button ?? []).length === 0) {
      return `${label}第 ${index + 1} 条配置缺少产品主图`;
    }
  }
  return '';
}

function collectData(): null | ProductConfigAllocationConfig {
  saveDraft();
  if (method.value === 'PER_ACCOUNT') {
    for (const account of props.accountInfo) {
      const items = accountItems.value.get(account.localAdvertiserId) ?? [];
      const error = validateItems(items, `账户 ${account.advertiserName}`);
      if (error) {
        message.warning(error);
        return null;
      }
    }
    const data = new Map<string, ProductConfigItem[]>();
    for (const account of props.accountInfo) {
      data.set(account.localAdvertiserId, [
        ...(accountItems.value.get(account.localAdvertiserId) ?? []),
      ]);
    }
    return { config: { method: 'PER_ACCOUNT' }, data };
  }

  const error = validateItems(globalItems.value, '产品配置');
  if (error) {
    message.warning(error);
    return null;
  }
  return {
    config: { method: method.value },
    data: new Map([['0', globalItems.value.map(cloneProductConfigItem)]]),
  };
}

const [Drawer, drawerApi] = useVbenDrawer<ProductConfigAllocationConfig>({
  class: 'w-[75%]',
  closeOnClickModal: false,
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    const data = collectData();
    if (!data) {
      return;
    }
    emit('update:productConfig', data);
    await drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    drawerOpen.value = isOpen;
    if (!isOpen) {
      return;
    }
    const config = normalizeProductConfig(drawerApi.getData());
    method.value = config.config.method;
    globalItems.value = [...(config.data.get('0') ?? [])].map(
      cloneProductConfigItem,
    );
    accountItems.value = new Map();
    config.data.forEach((items, key) => {
      if (key !== '0') {
        accountItems.value.set(
          key,
          items.map(cloneProductConfigItem),
        );
      }
    });
    currentAccountId.value = props.accountInfo[0]?.localAdvertiserId ?? '';
    selectedIndex.value = 0;
    await nextTick();
    loadDraft(0);
  },
});
</script>

<template>
  <Drawer title="产品配置">
    <div class="product-config-drawer">
      <div class="mode-block">
        <div class="block-title">
          <span>配置方式</span>
          <span class="muted">
            每条配置最多 50 张主图；配置项按顺序参与分配
          </span>
        </div>
        <RadioGroup
          :value="method"
          class="mode-grid"
          @change="switchMode($event.target.value)"
        >
          <Radio
            v-for="option in MODE_OPTIONS"
            :key="option.value"
            :value="option.value"
            class="mode-card"
          >
            <span class="mode-name">{{ option.label }}</span>
            <span class="mode-desc">{{ option.desc }}</span>
          </Radio>
        </RadioGroup>
      </div>

      <div v-if="method === 'PER_ACCOUNT'" class="account-strip">
        <span class="strip-label">媒体账户</span>
        <div
          v-for="account in accountInfo"
          :key="account.localAdvertiserId"
          class="account-chip"
          :class="{
            active: currentAccountId === account.localAdvertiserId,
          }"
          @click="switchAccount(account.localAdvertiserId)"
        >
          <div>
            <div class="account-name">{{ account.advertiserName }}</div>
            <div class="account-id">ID {{ account.localAdvertiserId }}</div>
          </div>
          <Tag
            :color="
              (accountItems.get(account.localAdvertiserId) ?? []).length > 0
                ? 'blue'
                : 'default'
            "
          >
            {{
              (accountItems.get(account.localAdvertiserId) ?? []).length > 0
                ? `${(accountItems.get(account.localAdvertiserId) ?? []).length} 条配置`
                : '未配置'
            }}
          </Tag>
        </div>
      </div>

      <div class="work-grid">
        <aside class="list-col">
          <div class="col-head">
            <span>
              {{
                method === 'PER_ACCOUNT'
                  ? `${currentAccount?.advertiserName || '账户'}配置项`
                  : method === 'AVERAGE'
                    ? '全局配置项'
                    : '配置项'
              }}
            </span>
            <small>{{ currentList.length }} 条</small>
          </div>
          <div class="config-list">
            <div
              v-for="(item, index) in currentList"
              :key="index"
              class="config-item"
              :class="{ active: index === selectedIndex }"
              @click="selectItem(index)"
            >
              <span class="config-index">{{ index + 1 }}</span>
              <div class="config-main">
                <div class="config-name">{{ displayName(item, index) }}</div>
                <div class="config-meta">
                  {{ (item.image_button ?? []).length }} 张主图 ·
                  {{ (item.selling_points ?? []).length }} 个卖点
                </div>
              </div>
            </div>
            <div v-if="currentList.length === 0" class="empty-list">
              暂无配置项
            </div>
          </div>
          <div class="add-config" @click="addItem">+ 新增配置项</div>
        </aside>

        <section class="editor">
          <div class="editor-head">
            <div class="editor-title">
              {{
                method === 'PER_ACCOUNT'
                  ? `${currentAccount?.advertiserName || '账户'} · 配置项 ${String(selectedIndex + 1).padStart(2, '0')}`
                  : `配置项 ${String(selectedIndex + 1).padStart(2, '0')}`
              }}
              <small>{{ displayName(draft, selectedIndex) }}</small>
            </div>
            <div class="editor-actions">
              <Button
                size="small"
                type="link"
                :disabled="currentList.length === 0"
                @click="copyItem"
              >
                复制
              </Button>
              <Button
                danger
                size="small"
                type="link"
                :disabled="currentList.length === 0"
                @click="removeItem"
              >
                删除
              </Button>
            </div>
          </div>

          <div v-if="currentList.length === 0" class="editor-empty">
            <Alert
              message="请先新增一条产品配置"
              show-icon
              type="info"
            />
          </div>
          <template v-else>
            <div class="editor-body">
              <div class="field">
                <div class="field-label">
                  <span><span class="required">*</span>产品名称</span>
                  <small>最多 1 个</small>
                </div>
                <TextareaTags
                  v-model="draft.titles"
                  :max-count="1"
                  :max-length="20"
                  placeholder="输入后回车添加"
                />
              </div>
              <div class="field">
                <div class="field-label">
                  <span>产品卖点</span>
                  <small>6-9 字，最多 10 个</small>
                </div>
                <TextareaTags
                  v-model="draft.selling_points"
                  :max-count="10"
                  :max-length="9"
                  :min-length="6"
                  placeholder="输入后回车添加"
                />
              </div>
              <div class="field">
                <div class="field-label">
                  <span>行动号召</span>
                  <small>2-4 字，最多 10 个</small>
                </div>
                <TextareaTags
                  v-model="draft.action_buttons"
                  :max-count="10"
                  :max-length="4"
                  :min-length="2"
                  placeholder="输入后回车添加"
                />
              </div>
              <div class="field">
                <div class="field-label">
                  <span><span class="required">*</span>产品主图</span>
                  <small>最多 50 张</small>
                </div>
                <ProductImageButtonField
                  v-model="draft.image_button"
                  :open-product-image-modal="openProductImageModal"
                />
              </div>
            </div>
            <div class="editor-tip">
              修改会实时保存到当前配置项；切换配置项或账户不会丢失。
            </div>
          </template>
        </section>

        <aside class="side-col">
          <div class="side-card">
            <div class="side-title">
              <span>
                {{
                  method === 'PER_ACCOUNT'
                    ? '账户内分配预览'
                    : method === 'AVERAGE'
                      ? '平均分配预览'
                      : '计划分配预览'
                }}
              </span>
              <small>{{ previewItems.length }} 个计划</small>
            </div>
            <div v-if="previewItems.length > 0" class="preview-list">
              <div
                v-for="row in previewItems"
                :key="row.name"
                class="preview-row"
              >
                <span>{{ row.name }}</span>
                <span class="config-pill">
                  {{ displayName(row.config, currentList.indexOf(row.config)) }}
                </span>
              </div>
            </div>
            <div v-else class="empty-list">配置后展示计划分配预览</div>
            <div class="hint">
              {{
                method === 'PER_ACCOUNT'
                  ? '该账户下的计划按配置项顺序循环。'
                  : method === 'AVERAGE'
                    ? '配置项按全局计划顺序铺开，不足时从头循环。'
                    : '所有账户共用这一组配置，账户内计划从第 1 条开始循环。'
              }}
            </div>
          </div>
          <div class="side-card rule-card">
            <div class="side-title">配置规则</div>
            <div class="rule-line">
              <span>统一配置</span><span>共用一组，账户内循环</span>
            </div>
            <div class="rule-line">
              <span>分账户配置</span><span>每账户独立配置</span>
            </div>
            <div class="rule-line">
              <span>平均分配</span><span>全局按计划铺开</span>
            </div>
          </div>
        </aside>
      </div>

      <ProductImageModal @update:material="onProductImageSelected" />
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.product-config-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.mode-block {
  flex: none;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.block-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 600;
}

.muted {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  font-weight: 400;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.mode-grid :deep(.ant-radio-wrapper) {
  align-items: flex-start;
  margin: 0;
  padding: 11px 13px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition: all 0.18s ease;
}

.mode-grid :deep(.ant-radio-wrapper:hover) {
  border-color: #91caff;
}

.mode-grid :deep(.ant-radio-wrapper-checked) {
  background: #eef5ff;
  border-color: #1677ff;
}

.mode-grid :deep(.ant-radio) {
  margin-top: 2px;
}

.mode-name {
  display: block;
  margin-bottom: 2px;
  font-weight: 600;
}

.mode-desc {
  display: block;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.45;
}

.account-strip {
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
  padding: 10px 0;
  overflow-x: auto;
}

.strip-label {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  white-space: nowrap;
}

.account-chip {
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 7px;
}

.account-chip.active {
  background: #eef5ff;
  border-color: #1677ff;
}

.account-name {
  font-weight: 600;
}

.account-id {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.work-grid {
  display: grid;
  flex: 1;
  grid-template-columns: 238px minmax(0, 1fr) 282px;
  gap: 12px;
  min-height: 0;
  padding-top: 12px;
}

.list-col,
.editor,
.side-col {
  min-height: 0;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 9px;
}

.list-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.col-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-weight: 650;
  border-bottom: 1px solid #f0f2f5;
}

.col-head small {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 400;
}

.config-list {
  flex: 1;
  min-height: 0;
  padding: 9px;
  overflow-y: auto;
}

.config-item {
  display: flex;
  gap: 9px;
  padding: 9px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition: all 0.16s ease;
}

.config-item:hover {
  border-color: #91caff;
}

.config-item.active {
  background: #eef5ff;
  border-color: #1677ff;
}

.config-index {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-top: 2px;
  color: #0958d9;
  font-size: 11px;
  font-weight: 700;
  background: #eef5ff;
  border: 1px solid #cfe5ff;
  border-radius: 6px;
}

.config-item.active .config-index {
  color: #fff;
  background: #1677ff;
  border-color: #1677ff;
}

.config-main {
  flex: 1;
  min-width: 0;
}

.config-name {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-meta {
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.empty-list {
  padding: 14px 4px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  text-align: center;
}

.add-config {
  flex: none;
  padding: 9px;
  margin: 0 9px 9px;
  color: #1677ff;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  background: #f8fbff;
  border: 1px dashed #91caff;
  border-radius: 8px;
}

.editor {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid #f0f2f5;
}

.editor-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 650;
}

.editor-title small {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 400;
}

.editor-actions {
  display: flex;
  gap: 6px;
}

.editor-empty {
  padding: 18px;
}

.editor-body {
  flex: 1;
  min-height: 0;
  padding: 12px 14px;
  overflow-y: auto;
}

.field {
  margin-bottom: 12px;
}

.field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  color: hsl(var(--foreground));
  font-size: 12px;
  font-weight: 600;
}

.field-label small {
  color: hsl(var(--muted-foreground));
  font-weight: 400;
}

.required {
  margin-right: 3px;
  color: #ff4d4f;
}

.editor-tip {
  flex: none;
  padding: 8px 14px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  border-top: 1px solid #f0f2f5;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  background: #fbfcfe;
}

.side-card {
  padding: 11px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 650;
}

.side-title small {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  font-weight: 400;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 8px;
  background: #f8fafc;
  border: 1px solid #f0f2f5;
  border-radius: 6px;
}

.config-pill {
  max-width: 160px;
  padding: 2px 7px;
  overflow: hidden;
  color: #0958d9;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #eef5ff;
  border: 1px solid #cfe5ff;
  border-radius: 4px;
}

.hint {
  margin-top: 9px;
  padding: 8px 9px;
  color: #0958d9;
  font-size: 12px;
  line-height: 1.55;
  background: #eef7ff;
  border: 1px solid #bae0ff;
  border-radius: 6px;
}

.rule-card {
  background: #fbfcfe;
}

.rule-line {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  border-bottom: 1px dashed hsl(var(--border));
}

.rule-line:last-child {
  border-bottom: 0;
}
</style>
