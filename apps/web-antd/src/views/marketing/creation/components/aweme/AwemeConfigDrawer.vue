<script setup lang="ts" name="AwemeConfigDrawer">
/**
 * 抖音号配置抽屉
 *
 * 三种模式均支持多选：
 * - 统一配置：所有账户共用一组，账户内计划循环
 * - 分账户配置：每个账户独立多选，账户内计划循环
 * - 平均分配：全局抖音号池按全部计划顺序铺开
 */
import type { BytedanceToolsAwemeAuthListList } from '#/api/models/bytedance';
import type {
  AccountInfo,
  AwemeConfigData,
  AwemeDistributionRule,
  AwemeMapping,
} from '#/views/marketing/creation/creation';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Empty,
  Input,
  message,
  Radio,
  RadioGroup,
  Spin,
  Tag,
} from 'ant-design-vue';

import { bytedanceAdvertisementApi } from '#/api';

import { normalizeAwemeConfig } from './types';

const props = defineProps<{
  accountInfo: AccountInfo[];
}>();

const emit = defineEmits<{
  'update:awemeConfig': [value: AwemeConfigData];
}>();

const MODE_OPTIONS: Array<{
  desc: string;
  label: string;
  value: AwemeDistributionRule;
}> = [
  {
    desc: '所有账户共用一组抖音号，账户内计划循环',
    label: '统一配置',
    value: 'ALL_SAME',
  },
  {
    desc: '每个账户独立选择，账户内计划循环',
    label: '分账户配置',
    value: 'PER_ACCOUNT',
  },
  {
    desc: '全局抖音号按全部计划顺序平均铺开',
    label: '平均分配',
    value: 'AVERAGE',
  },
];

const method = ref<AwemeDistributionRule>('ALL_SAME');
const globalAwemes = ref<AwemeMapping[]>([]);
const accountAwemes = ref<Map<string, AwemeMapping[]>>(new Map());
const currentAccountId = ref('');
const awemeList = ref<BytedanceToolsAwemeAuthListList[]>([]);
const loadingAweme = ref(false);
const searchText = ref('');
const drawerOpen = ref(false);

const accountList = computed(() => {
  const seen = new Set<string>();
  return props.accountInfo.filter((account) => {
    const key = account.localAdvertiserId;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
});

const currentAccount = computed(() =>
  accountList.value.find(
    (account) => account.localAdvertiserId === currentAccountId.value,
  ),
);

const currentSelection = computed(() => {
  if (method.value === 'PER_ACCOUNT') {
    return accountAwemes.value.get(currentAccountId.value) ?? [];
  }
  return globalAwemes.value;
});

const filteredAwemes = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  if (!keyword) {
    return awemeList.value;
  }
  return awemeList.value.filter(
    (aweme) =>
      aweme.aweme_name?.toLowerCase().includes(keyword) ||
      String(aweme.aweme_id).includes(keyword),
  );
});

const previewRows = computed(() => {
  const items = currentSelection.value;
  if (items.length === 0) {
    return [];
  }
  const count = method.value === 'AVERAGE' ? 8 : 4;
  return Array.from({ length: count }, (_, index) => ({
    aweme: items[index % items.length]!,
    name: `计划 ${String(index + 1).padStart(2, '0')}`,
  }));
});

function isSelected(awemeId: string) {
  return currentSelection.value.some((item) => item.awemeId === awemeId);
}

function setCurrentSelection(items: AwemeMapping[]) {
  if (method.value === 'PER_ACCOUNT') {
    if (!currentAccountId.value) {
      return;
    }
    accountAwemes.value.set(currentAccountId.value, items);
    accountAwemes.value = new Map(accountAwemes.value);
  } else {
    globalAwemes.value = items;
  }
}

function toggleAweme(aweme: BytedanceToolsAwemeAuthListList) {
  const selected = isSelected(aweme.aweme_id);
  const current = [...currentSelection.value];
  if (selected) {
    setCurrentSelection(
      current.filter((item) => item.awemeId !== aweme.aweme_id),
    );
    return;
  }
  current.push({
    awemeId: aweme.aweme_id,
    awemeName: aweme.aweme_name,
  });
  setCurrentSelection(current);
}

function removeAweme(awemeId: string) {
  setCurrentSelection(
    currentSelection.value.filter((item) => item.awemeId !== awemeId),
  );
}

function configuredCount(accountId: string) {
  return accountAwemes.value.get(accountId)?.length ?? 0;
}

function switchMode(value: AwemeDistributionRule) {
  method.value = value;
  if (value === 'PER_ACCOUNT' && !currentAccountId.value) {
    currentAccountId.value = accountList.value[0]?.localAdvertiserId ?? '';
  }
}

async function fetchAwemeList() {
  if (accountList.value.length === 0) {
    awemeList.value = [];
    return;
  }
  loadingAweme.value = true;
  try {
    const list = await bytedanceAdvertisementApi.fetchAewmeAuthList({
      advertiserId: accountList.value.map(
        (account) => account.localAdvertiserId,
      ),
    });
    awemeList.value = (list || []).filter(
      (item) =>
        item.auth_status === 'AUTHRIZED' &&
        item.auth_type === 'AWEME_ACCOUNT',
    );
  } catch {
    message.warning('抖音号列表加载失败');
  } finally {
    loadingAweme.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer<AwemeConfigData>({
  class: 'w-[75%]',
  closeOnClickModal: false,
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    if (method.value !== 'PER_ACCOUNT' && globalAwemes.value.length === 0) {
      message.warning('请至少选择 1 个抖音号');
      return;
    }
    const data = new Map<string, AwemeMapping[]>();
    if (method.value === 'PER_ACCOUNT') {
      const unconfigured = accountList.value.filter(
        (account) => configuredCount(account.localAdvertiserId) === 0,
      );
      if (unconfigured.length > 0) {
        message.warning(
          `请为账户 [${unconfigured.map((account) => account.advertiserName).join('、')}] 选择抖音号`,
        );
        return;
      }
      for (const account of accountList.value) {
        data.set(account.localAdvertiserId, [
          ...(accountAwemes.value.get(account.localAdvertiserId) ?? []),
        ]);
      }
    } else {
      data.set('0', [...globalAwemes.value]);
    }
    emit('update:awemeConfig', {
      config: { method: method.value },
      data,
    });
    drawerApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    drawerOpen.value = isOpen;
    if (!isOpen) {
      return;
    }
    const config = normalizeAwemeConfig(drawerApi.getData());
    method.value = config.config.method;
    globalAwemes.value = [...(config.data.get('0') ?? [])].map((item) => ({
      ...item,
    }));
    accountAwemes.value = new Map();
    config.data.forEach((items, key) => {
      if (key !== '0' && items.length > 0) {
        accountAwemes.value.set(
          key,
          items.map((item) => ({ ...item })),
        );
      }
    });
    currentAccountId.value = accountList.value[0]?.localAdvertiserId ?? '';
    searchText.value = '';
    await fetchAwemeList();
  },
});
</script>

<template>
  <Drawer title="抖音号配置">
    <div class="aweme-drawer">
      <div class="mode-block">
        <div class="block-title">
          <span>配置方式</span>
          <span class="muted">
            三种模式均支持多选，按勾选顺序参与循环分配
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
          v-for="account in accountList"
          :key="account.localAdvertiserId"
          class="account-chip"
          :class="{
            active: currentAccountId === account.localAdvertiserId,
          }"
          @click="currentAccountId = account.localAdvertiserId"
        >
          <div>
            <div class="account-name">{{ account.advertiserName }}</div>
            <div class="account-id">ID {{ account.localAdvertiserId }}</div>
          </div>
          <Tag
            :color="
              configuredCount(account.localAdvertiserId) > 0
                ? 'blue'
                : 'default'
            "
          >
            {{
              configuredCount(account.localAdvertiserId) > 0
                ? `${configuredCount(account.localAdvertiserId)} 个抖音号`
                : '未配置'
            }}
          </Tag>
        </div>
      </div>

      <div class="work-grid">
        <section class="pool-col">
          <div class="pool-head">
            <span class="pool-title">
              {{
                method === 'PER_ACCOUNT'
                  ? `${currentAccount?.advertiserName || '账户'}可用抖音号`
                  : '可用抖音号'
              }}
            </span>
            <Input
              v-model:value="searchText"
              allow-clear
              placeholder="搜索抖音号名称 / ID"
              style="width: 240px"
            />
          </div>
          <div class="aweme-list">
            <Spin :spinning="loadingAweme">
              <div
                v-for="aweme in filteredAwemes"
                :key="aweme.aweme_id"
                class="aweme-item"
                :class="{ selected: isSelected(aweme.aweme_id) }"
                @click="toggleAweme(aweme)"
              >
                <span class="checkbox"></span>
                <span class="avatar">
                  {{ (aweme.aweme_name || '抖')[0] }}
                </span>
                <div class="aweme-main">
                  <div class="aweme-name">{{ aweme.aweme_name }}</div>
                  <div class="aweme-meta">
                    <span
                      class="type-tag"
                      :class="{
                        personal: aweme.aweme_user_type !== 'ENTERPRISE',
                      }"
                    >
                      {{
                        aweme.aweme_user_type === 'ENTERPRISE'
                          ? '企业号'
                          : '个人号'
                      }}
                    </span>
                    <span class="auth-tag">已授权</span>
                    <span>ID {{ aweme.aweme_id }}</span>
                  </div>
                </div>
              </div>
              <Empty
                v-if="!loadingAweme && filteredAwemes.length === 0"
                description="暂无可用抖音号，请检查账户授权状态"
              />
            </Spin>
          </div>
        </section>

        <aside class="selected-col">
          <div class="selected-head">
            <span class="selected-title">
              {{
                method === 'PER_ACCOUNT'
                  ? `${currentAccount?.advertiserName || '账户'}已选`
                  : '已选抖音号'
              }}
            </span>
            <small>{{ currentSelection.length }} 个</small>
          </div>
          <div v-if="currentSelection.length > 0" class="selected-list">
            <div
              v-for="(item, index) in currentSelection"
              :key="item.awemeId"
              class="selected-item"
            >
              <span class="selected-index">{{ index + 1 }}</span>
              <div class="selected-main">
                <div class="selected-name">{{ item.awemeName }}</div>
                <div class="selected-sub">ID {{ item.awemeId }}</div>
              </div>
              <span class="remove" @click="removeAweme(item.awemeId)">×</span>
            </div>
          </div>
          <div v-else class="selected-empty">
            请在左侧勾选抖音号
          </div>
          <div class="selected-foot">
            {{
              method === 'PER_ACCOUNT'
                ? '切换账户会保留各账户已选抖音号。'
                : '按勾选顺序在计划中循环。'
            }}
          </div>
        </aside>

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
              <small>{{ previewRows.length }} 个计划</small>
            </div>
            <div v-if="previewRows.length > 0" class="preview-list">
              <div
                v-for="row in previewRows"
                :key="row.name"
                class="preview-row"
              >
                <span>{{ row.name }}</span>
                <span class="aweme-pill">{{ row.aweme.awemeName }}</span>
              </div>
            </div>
            <div v-else class="selected-empty">选择抖音号后展示分配预览</div>
            <div class="hint">
              {{
                method === 'PER_ACCOUNT'
                  ? '该账户下的计划按已选抖音号顺序循环；每个账户必须至少选择 1 个。'
                  : method === 'AVERAGE'
                    ? '抖音号按全局计划顺序铺开，不足时从头循环。'
                    : '所有账户共用这组抖音号，每个账户内的计划从第 1 个开始循环。'
              }}
            </div>
          </div>
          <div class="side-card rule-card">
            <div class="side-title">配置规则</div>
            <div class="rule-line">
              <span>统一配置</span><span>共用一组，账户内循环</span>
            </div>
            <div class="rule-line">
              <span>分账户配置</span><span>每账户独立选择</span>
            </div>
            <div class="rule-line">
              <span>平均分配</span><span>全局按计划铺开</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.aweme-drawer {
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
  border-color: hsl(var(--primary) / 45%);
}

.mode-grid :deep(.ant-radio-wrapper-checked) {
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary));
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
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary));
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
  grid-template-columns: minmax(0, 1fr) 270px 282px;
  gap: 12px;
  min-height: 0;
  padding-top: 12px;
}

.pool-col,
.selected-col,
.side-col {
  min-height: 0;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 9px;
}

.pool-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pool-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.pool-title {
  font-weight: 650;
  white-space: nowrap;
}

.aweme-list {
  flex: 1;
  min-height: 0;
  padding: 9px;
  overflow-y: auto;
}

.aweme-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  transition: all 0.16s ease;
}

.aweme-item:hover {
  border-color: hsl(var(--primary) / 45%);
}

.aweme-item.selected {
  background: hsl(var(--primary) / 12%);
  border-color: hsl(var(--primary));
}

.checkbox {
  position: relative;
  flex: none;
  width: 15px;
  height: 15px;
  background: hsl(var(--card));
  border: 1.5px solid hsl(var(--border));
  border-radius: 3px;
}

.aweme-item.selected .checkbox {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.aweme-item.selected .checkbox::after {
  content: "✓";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--primary-foreground));
  font-size: 10px;
  font-weight: 700;
}

.avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: hsl(var(--primary-foreground));
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(
    145deg,
    hsl(var(--primary)),
    hsl(var(--primary) / 55%)
  );
  border-radius: 50%;
}

.aweme-main {
  flex: 1;
  min-width: 0;
}

.aweme-name {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aweme-meta {
  display: flex;
  gap: 7px;
  align-items: center;
  margin-top: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.type-tag {
  padding: 1px 6px;
  color: hsl(var(--primary));
  font-size: 10px;
  background: hsl(var(--primary) / 12%);
  border: 1px solid hsl(var(--primary) / 30%);
  border-radius: 4px;
}

.type-tag.personal {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
  border-color: hsl(var(--border));
}

.auth-tag {
  color: hsl(var(--success));
}

.selected-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selected-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.selected-title {
  font-weight: 650;
}

.selected-head small {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.selected-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
  min-height: 0;
  padding: 9px;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background: hsl(var(--muted) / 55%);
  border: 1px solid hsl(var(--border));
  border-radius: 7px;
}

.selected-index {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: hsl(var(--primary-foreground));
  font-size: 10px;
  font-weight: 700;
  background: hsl(var(--primary));
  border-radius: 50%;
}

.selected-main {
  flex: 1;
  min-width: 0;
}

.selected-name {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-sub {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.remove {
  color: hsl(var(--primary) / 65%);
  cursor: pointer;
}

.selected-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  text-align: center;
}

.selected-foot {
  flex: none;
  padding: 9px 11px;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  border-top: 1px solid hsl(var(--border));
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  background: hsl(var(--muted) / 45%);
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
  background: hsl(var(--muted) / 55%);
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.aweme-pill {
  max-width: 160px;
  padding: 2px 7px;
  overflow: hidden;
  color: hsl(var(--primary));
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: hsl(var(--primary) / 12%);
  border: 1px solid hsl(var(--primary) / 30%);
  border-radius: 4px;
}

.hint {
  margin-top: 9px;
  padding: 8px 9px;
  color: hsl(var(--primary));
  font-size: 12px;
  line-height: 1.55;
  background: hsl(var(--primary) / 10%);
  border: 1px solid hsl(var(--primary) / 28%);
  border-radius: 6px;
}

.rule-card {
  background: hsl(var(--card));
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
