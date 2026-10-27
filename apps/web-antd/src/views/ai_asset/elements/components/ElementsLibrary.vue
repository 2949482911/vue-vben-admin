<script lang="ts" setup name="ElementsLibrary">
import type { SettingItem } from '#/api/models/ai_asset';
import type { RefAsset } from '#/views/ai_asset/studio/constants';

import { computed, onMounted, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { useDictStore } from '@vben/stores';

import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined,
  UnlockOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Empty,
  Image,
  Input,
  message,
  Modal,
  Spin,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import RefPickerDrawer from '../../studio/components/RefPickerDrawer.vue';

const dictStore = useDictStore();

const FALLBACK_TYPES = [
  { label: '人物', value: 'character' },
  { label: '情绪', value: 'emotion' },
  { label: '环境', value: 'environment' },
  { label: '服装', value: 'costume' },
  { label: '首饰', value: 'jewelry' },
  { label: '工具', value: 'tool' },
  { label: '其他', value: 'other' },
];

const loading = ref(false);
const novels = ref<Array<{ id: number | string; name?: string }>>([]);
const novelId = ref<number | string>();
const settings = ref<SettingItem[]>([]);
const activeType = ref('all');
const keyword = ref('');

const editOpen = ref(false);
const editSaving = ref(false);
const editForm = reactive({
  id: undefined as number | string | undefined,
  elementType: 'emotion',
  name: '',
  description: '',
  tags: '',
});

const bindTarget = ref<SettingItem>();

const [MaterialDrawer, materialDrawerApi] = useVbenDrawer({
  connectedComponent: RefPickerDrawer,
});

const typeOptions = computed(() => {
  const items = dictStore.dictMap.ai_element_type ?? [];
  return items.length
    ? items.map((item) => ({ label: String(item.label), value: String(item.value) }))
    : FALLBACK_TYPES;
});

const counts = computed(() => {
  const result: Record<string, number> = {};
  settings.value.forEach((item) => {
    result[item.type] = (result[item.type] ?? 0) + 1;
  });
  return result;
});

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return settings.value.filter((item) => {
    if (activeType.value !== 'all' && item.type !== activeType.value) {
      return false;
    }
    if (
      q &&
      !item.name.toLowerCase().includes(q) &&
      !(item.description ?? '').toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
});

const typeLabel = (type?: string) =>
  typeOptions.value.find((item) => item.value === type)?.label ?? type ?? '—';

const isElementType = (type: string) =>
  !['character', 'environment'].includes(type);

async function loadNovels() {
  try {
    const res = await aiAssetApi.fetchNovelList({ page: 1, pageSize: 200 });
    novels.value = res?.items ?? [];
    if (!novelId.value) {
      novelId.value = novels.value[0]?.id;
    }
    if (novelId.value) {
      await loadSettings();
    }
  } catch (error: any) {
    message.error(error?.message || '加载书籍失败');
  }
}

async function loadSettings() {
  if (!novelId.value) {
    settings.value = [];
    return;
  }
  loading.value = true;
  try {
    settings.value = (await aiAssetApi.fetchNovelSettings({
      novelId: novelId.value,
    })) ?? [];
  } catch (error: any) {
    message.error(error?.message || '加载创作素材失败');
  } finally {
    loading.value = false;
  }
}

function selectType(value: string) {
  activeType.value = value;
}

function openCreate() {
  const type = activeType.value === 'all' ? 'emotion' : activeType.value;
  if (!isElementType(type)) {
    message.info('人物和环境请到「资产」页维护，这里负责其余设定素材');
    return;
  }
  Object.assign(editForm, {
    id: undefined,
    elementType: type,
    name: '',
    description: '',
    tags: '',
  });
  editOpen.value = true;
}

function openEdit(item: SettingItem) {
  if (item.source !== 'element') {
    message.info('人物/环境请在「资产」页编辑');
    return;
  }
  Object.assign(editForm, {
    id: item.id,
    elementType: item.type,
    name: item.name,
    description: item.description ?? '',
    tags: (item.tags ?? []).join('、'),
  });
  editOpen.value = true;
}

async function saveElement() {
  if (!novelId.value) {
    message.warning('请先选择书籍');
    return;
  }
  if (!editForm.name.trim()) {
    message.warning('请输入名称');
    return;
  }
  editSaving.value = true;
  try {
    await aiAssetApi.saveElement({
      description: editForm.description || undefined,
      elementType: editForm.elementType,
      id: editForm.id,
      name: editForm.name.trim(),
      novelId: novelId.value,
      tags: editForm.tags
        ? editForm.tags
            .split(/[,、，]/)
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined,
    });
    editOpen.value = false;
    await loadSettings();
    message.success('已保存');
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  } finally {
    editSaving.value = false;
  }
}

function remove(item: SettingItem) {
  if (item.source !== 'element') {
    message.info('人物/环境请在「资产」页删除');
    return;
  }
  Modal.confirm({
    title: `删除素材「${item.name}」？`,
    okType: 'danger',
    async onOk() {
      await aiAssetApi.batchElementOptions({
        targetIds: [String(item.id)],
        type: 'delete',
        values: {},
      });
      await loadSettings();
      message.success('已删除');
    },
  });
}

function openBind(item: SettingItem) {
  bindTarget.value = item;
  const current = item.materialId
    ? [
        {
          description: typeLabel(item.type),
          id: item.materialId,
          name: item.name,
          url: item.materialThumbnailUrl || item.materialUrl || item.refUrl || '',
        },
      ]
    : [];
  materialDrawerApi.setData({
    hint: '选择 1 个素材绑定到当前设定，确定后立即生效',
    max: 1,
    selected: current,
    sources: ['workspace'],
    title: `绑定素材 · ${item.name}`,
  });
  materialDrawerApi.open();
}

async function onMaterialPicked(refs: RefAsset[]) {
  const target = bindTarget.value;
  const picked = refs[0];
  if (!target || !picked) {
    return;
  }
  try {
    const payload = { id: target.id, materialId: picked.id };
    if (target.source === 'character') {
      await aiAssetApi.bindCharacterMaterial(payload);
    } else if (target.source === 'scene') {
      await aiAssetApi.bindSceneMaterial(payload);
    } else {
      await aiAssetApi.bindElementMaterial(payload);
    }
    await loadSettings();
    message.success('已绑定素材');
  } catch (error: any) {
    message.error(error?.message || '绑定失败');
  }
}

async function unbind(item: SettingItem) {
  try {
    const payload = { id: item.id, materialId: null };
    if (item.source === 'character') {
      await aiAssetApi.bindCharacterMaterial(payload);
    } else if (item.source === 'scene') {
      await aiAssetApi.bindSceneMaterial(payload);
    } else {
      await aiAssetApi.bindElementMaterial(payload);
    }
    await loadSettings();
    message.success('已解除绑定');
  } catch (error: any) {
    message.error(error?.message || '解绑失败');
  }
}

function materialUrl(item: SettingItem) {
  return item.materialThumbnailUrl || item.materialUrl || item.refUrl || '';
}

onMounted(loadNovels);
</script>

<template>
    <div class="el-shell">
      <Card class="el-card">
        <div class="el-body">
          <div class="el-toolbar">
            <select v-model="novelId" class="el-select" @change="loadSettings">
              <option v-for="novel in novels" :key="novel.id" :value="novel.id">
                《{{ novel.name || novel.id }}》
              </option>
            </select>

            <div class="el-tabs">
              <button
                type="button"
                class="el-tab"
                :class="{ 'is-on': activeType === 'all' }"
                @click="selectType('all')"
              >
                全部 <span>{{ settings.length }}</span>
              </button>
              <button
                v-for="type in typeOptions"
                :key="type.value"
                type="button"
                class="el-tab"
                :class="{ 'is-on': activeType === type.value }"
                @click="selectType(type.value)"
              >
                {{ type.label }} <span>{{ counts[type.value] ?? 0 }}</span>
              </button>
            </div>

            <span class="spacer"></span>
            <Input
              v-model:value="keyword"
              allow-clear
              placeholder="搜索名称 / 描述"
              style="width: 220px"
            >
              <template #prefix><SearchOutlined /></template>
            </Input>
            <Button
              type="primary"
              :disabled="
                activeType === 'character' || activeType === 'environment'
              "
              @click="openCreate"
            >
              <template #icon><PlusOutlined /></template>
              新建素材
            </Button>
          </div>

          <div class="el-scroll">
            <Spin :spinning="loading">
              <Empty
                v-if="!loading && filtered.length === 0"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="这本还没有这类设定素材"
                class="el-empty"
              />
              <div v-else class="el-grid">
                <Card
                  v-for="item in filtered"
                  :key="`${item.source}-${item.id}`"
                  size="small"
                  class="el-item"
                >
                  <div class="el-item__hd">
                    <span class="el-thumb">
                      <Image v-if="materialUrl(item)" :src="materialUrl(item)" :preview="false" />
                      <template v-else>{{ item.name.slice(0, 1) }}</template>
                    </span>
                    <div class="el-item__name">
                      <b>{{ item.name }}</b>
                      <span>{{ typeLabel(item.type) }} · {{ item.source }}</span>
                    </div>
                    <Tag
                      :bordered="false"
                      :color="item.hasMaterial ? 'green' : 'orange'"
                    >
                      {{ item.hasMaterial ? '已绑素材' : '待补图' }}
                    </Tag>
                  </div>
                  <p class="el-item__desc">{{ item.description || '暂无描述' }}</p>
                  <div class="el-item__tags">
                    <Tag v-for="tag in item.tags || []" :key="tag" :bordered="false">
                      {{ tag }}
                    </Tag>
                  </div>
                  <div class="el-item__foot">
                    <Button type="link" size="small" @click="openBind(item)">
                      <template #icon><LinkOutlined /></template>
                      {{ item.hasMaterial ? '更换素材' : '绑定素材' }}
                    </Button>
                    <Button
                      v-if="item.hasMaterial"
                      type="link"
                      size="small"
                      @click="unbind(item)"
                    >
                      <template #icon><UnlockOutlined /></template>解绑
                    </Button>
                    <span class="spacer"></span>
                    <Button
                      v-if="item.source === 'element'"
                      type="link"
                      size="small"
                      @click="openEdit(item)"
                    >
                      <template #icon><EditOutlined /></template>
                    </Button>
                    <Button
                      v-if="item.source === 'element'"
                      type="link"
                      size="small"
                      danger
                      @click="remove(item)"
                    >
                      <template #icon><DeleteOutlined /></template>
                    </Button>
                  </div>
                </Card>
              </div>
            </Spin>
          </div>
        </div>
      </Card>
    </div>

    <Modal
      v-model:open="editOpen"
      :confirm-loading="editSaving"
      :title="editForm.id ? '编辑素材' : '新建素材'"
      ok-text="保存"
      @ok="saveElement"
    >
      <div class="el-form">
        <label>
          <span>类型</span>
          <select v-model="editForm.elementType" class="el-select">
            <option
              v-for="type in typeOptions.filter(
                (item) =>
                  item.value !== 'character' && item.value !== 'environment',
              )"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>
        </label>
        <label>
          <span>名称 <em>*</em></span>
          <Input v-model:value="editForm.name" />
        </label>
        <label>
          <span>描述</span>
          <Input.TextArea v-model:value="editForm.description" :rows="3" />
        </label>
        <label>
          <span>标签</span>
          <Input v-model:value="editForm.tags" placeholder="用逗号或顿号分隔" />
        </label>
      </div>
    </Modal>

    <MaterialDrawer @confirm="onMaterialPicked" />
</template>

<style scoped lang="scss">
.el-shell {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.el-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 16px;
  }
}

.el-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.el-toolbar {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.el-select {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  outline: none;
}

.el-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.el-tab {
  height: 30px;
  padding: 0 10px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 8px;

  span {
    margin-left: 4px;
    font-size: 11px;
    opacity: 0.7;
  }

  &.is-on {
    font-weight: 600;
    color: hsl(var(--primary));
    background: color-mix(in srgb, hsl(var(--primary)) 9%, transparent);
  }
}

.spacer {
  flex: 1;
}

.el-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.el-empty {
  padding: 48px 0;
}

.el-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.el-item {
  display: flex;
  flex-direction: column;

  &__hd {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  &__name {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 14px;
    }

    span {
      font-size: 11px;
      color: hsl(var(--muted-foreground));
    }
  }

  &__desc {
    display: -webkit-box;
    margin: 0 0 8px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__foot {
    display: flex;
    gap: 2px;
    align-items: center;
    margin-top: 8px;
    border-top: 1px dashed hsl(var(--border));
  }
}

.el-thumb {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, hsl(var(--c-violet)), hsl(var(--primary)));
  border-radius: 9px;

  :deep(.ant-image),
  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.el-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
  }

  em {
    font-style: normal;
    color: hsl(var(--destructive));
  }
}

.el-materials {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  max-height: 520px;
  overflow-y: auto;
}

.el-material {
  padding: 0;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;

  :deep(.ant-image),
  :deep(img) {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  &:hover {
    border-color: hsl(var(--primary));
  }

  &__name {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
