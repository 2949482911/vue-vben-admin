<script lang="ts" setup name="AssetEditDrawer">
import type {
  NovelCharacterAsset,
  NovelElementAsset,
  NovelSceneAsset,
} from '#/api/models/ai_asset';

import { computed, reactive, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { useDictStore } from '@vben/stores';

import { Button, Input, message, Select } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { useAssetTagDicts } from '../useAssetTagDicts';
import TagDimensionChips from './TagDimensionChips.vue';

type AssetType = 'character' | 'element' | 'scene';
type AssetItem = NovelCharacterAsset | NovelElementAsset | NovelSceneAsset;

const emit = defineEmits<{ success: [] }>();

const dictStore = useDictStore();
const { characterDimensions, labelOf, sceneDimensions } = useAssetTagDicts();

const saving = ref(false);
const novelId = ref<number | string>();
const assetType = ref<AssetType>('character');
const original = ref<AssetItem>();

const form = reactive({
  appearance: '',
  description: '',
  elementType: 'prop',
  id: '' as number | string,
  location: '',
  name: '',
  role: '',
  tags: {} as Record<string, any>,
  visualPrompt: '',
});

const anchor = reactive({
  age: '',
  features: '',
  hair: '',
  height: '',
  outfit: '',
});

const anchorManual = ref(false);
const promptManual = ref(false);

const dimensions = computed(() =>
  assetType.value === 'character'
    ? characterDimensions
    : sceneDimensions,
);

const elementTypeOptions = computed(() => {
  const items = dictStore.dictMap.ai_element_type ?? [];
  return items.length
    ? items.map((item) => ({ label: String(item.label), value: String(item.value) }))
    : [
        { label: '道具', value: 'prop' },
        { label: '服装', value: 'costume' },
        { label: '情绪', value: 'emotion' },
        { label: '首饰', value: 'jewelry' },
        { label: '工具', value: 'tool' },
        { label: '其他', value: 'other' },
      ];
});

function tagLabels(keys: string[]) {
  return keys
    .map((key) => {
      const dimension = dimensions.value.find((item) => item.key === key);
      if (!dimension) {
        return '';
      }
      const value = form.tags[key];
      const values = Array.isArray(value) ? value : value ? [value] : [];
      return values.map((item) => labelOf(dimension, item)).join('、');
    })
    .filter(Boolean)
    .join(' / ');
}

function deriveAnchor() {
  anchor.hair = tagLabels(['hairStyle', 'hairColor']);
  anchor.outfit = tagLabels(['outfitStyle']);
  anchor.features = tagLabels(['features']);
}

function composePrompt() {
  const tags = dimensions.value
    .map((dimension) => {
      const value = form.tags[dimension.key];
      const values = Array.isArray(value) ? value : value ? [value] : [];
      if (!values.length) {
        return '';
      }
      return `${dimension.label}：${values
        .map((item) => labelOf(dimension, item))
        .join('、')}`;
    })
    .filter(Boolean);
  const free =
    assetType.value === 'character' ? form.appearance : form.description;
  return [
    assetType.value === 'character'
      ? `角色：${form.name}${form.role ? `（${form.role}）` : ''}`
      : `场景：${form.name}${form.location ? `（${form.location}）` : ''}`,
    ...tags,
    free ? `补充：${free}` : '',
  ]
    .filter(Boolean)
    .join('；');
}

function refreshPrompt(force = false) {
  if (force || !promptManual.value) {
    form.visualPrompt = composePrompt();
    promptManual.value = false;
  }
}

function refreshAnchor(force = false) {
  if (force || !anchorManual.value) {
    deriveAnchor();
    anchorManual.value = false;
  }
}

watch(
  () => form.tags,
  () => {
    refreshAnchor();
    refreshPrompt();
  },
  { deep: true },
);
watch(
  () => [form.appearance, form.description, form.location, form.name, form.role],
  () => refreshPrompt(),
);

function fill(item: AssetItem) {
  const character = item as NovelCharacterAsset;
  const scene = item as NovelSceneAsset;
  const element = item as NovelElementAsset;
  Object.assign(form, {
    appearance: character.appearance ?? '',
    description: item.description ?? '',
    elementType: element.elementType ?? 'prop',
    id: item.id,
    location: scene.location ?? '',
    name: item.name,
    role: (character as any).attributes?.role ?? character.role ?? '',
    tags: { ...(character.appearanceTags ?? scene.sceneTags ?? {}) },
    visualPrompt: item.visualPrompt ?? '',
  });
  anchor.height = String(character.consistencyAnchor?.height ?? '');
  anchor.age = String(character.consistencyAnchor?.age ?? '');
  anchorManual.value = false;
  promptManual.value = Boolean(item.visualPrompt);
  deriveAnchor();
  if (!item.visualPrompt) {
    form.visualPrompt = composePrompt();
  }
}

async function save(generateAfter = false) {
  if (!form.name.trim()) {
    message.warning('请输入名称');
    return;
  }
  saving.value = true;
  try {
    if (assetType.value === 'character') {
      const source = original.value as NovelCharacterAsset;
      await aiAssetApi.saveCharacter({
        appearance: form.appearance || undefined,
        appearanceTags: form.tags,
        attributes: {
          ...(source?.attributes ?? {}),
          role: form.role || undefined,
        },
        consistencyAnchor: {
          ...(source?.consistencyAnchor ?? {}),
          age: anchor.age || undefined,
          features: anchor.features || undefined,
          hair: anchor.hair || undefined,
          height: anchor.height || undefined,
          outfit: anchor.outfit || undefined,
        },
        description: form.description || undefined,
        id: form.id,
        name: form.name.trim(),
        prompt: source?.prompt,
        visualPrompt: form.visualPrompt || undefined,
      });
    } else if (assetType.value === 'scene') {
      const source = original.value as NovelSceneAsset;
      await aiAssetApi.saveScene({
        attributes: source?.attributes,
        description: form.description || undefined,
        id: form.id,
        location: form.location || undefined,
        name: form.name.trim(),
        sceneTags: form.tags,
        visualPrompt: form.visualPrompt || undefined,
      });
    } else {
      await aiAssetApi.saveElement({
        description: form.description || undefined,
        elementType: form.elementType,
        id: form.id,
        name: form.name.trim(),
        novelId: novelId.value!,
      });
    }

    if (generateAfter && assetType.value !== 'element') {
      await aiAssetApi.generateAssetImage({
        assetId: form.id,
        assetType: assetType.value,
      });
      message.success('设定已保存，形象生成任务已提交');
    } else {
      message.success('设定已保存');
    }
    emit('success');
    await drawerApi.close();
  } catch (error: any) {
    message.error(error?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[760px]',
  contentClass: 'flex min-h-0 flex-col gap-3 p-3',
  onConfirm: () => save(false),
  async onOpenChange(open) {
    if (!open) {
      return;
    }
    const data = drawerApi.getData() as
      | undefined
      | { item: AssetItem; novelId: number | string; type: AssetType };
    if (!data?.item) {
      return;
    }
    novelId.value = data.novelId;
    assetType.value = data.type;
    original.value = data.item;
    fill(data.item);
  },
});
</script>

<template>
  <Drawer
    :title="
      assetType === 'character'
        ? '编辑角色设定'
        : assetType === 'scene'
          ? '编辑场景设定'
          : '编辑道具设定'
    "
  >
    <div class="asset-edit">
      <div class="asset-edit__grid">
        <label>
          <span>名称</span>
          <Input v-model:value="form.name" />
        </label>
        <label v-if="assetType === 'character'">
          <span>身份</span>
          <Input v-model:value="form.role" placeholder="主角 / 配角 / 反派" />
        </label>
        <label v-if="assetType === 'scene'">
          <span>地点 location</span>
          <Input v-model:value="form.location" placeholder="例如：修表铺 / 码头" />
        </label>
        <label v-if="assetType === 'element'">
          <span>类型</span>
          <Select v-model:value="form.elementType" :options="elementTypeOptions" />
        </label>
      </div>

      <label v-if="assetType === 'character'">
        <span>描述</span>
        <Input.TextArea v-model:value="form.description" :rows="2" />
      </label>

      <TagDimensionChips
        v-if="assetType !== 'element'"
        v-model="form.tags"
        :dimensions="dimensions"
      />

      <label v-if="assetType === 'character'">
        <span>外貌补充（自由文本）</span>
        <Input.TextArea v-model:value="form.appearance" :rows="3" />
      </label>
      <label v-else-if="assetType === 'scene'">
        <span>场景描述（自由文本）</span>
        <Input.TextArea v-model:value="form.description" :rows="3" />
      </label>
      <label v-else>
        <span>描述</span>
        <Input.TextArea v-model:value="form.description" :rows="3" />
      </label>

      <div v-if="assetType === 'character'" class="asset-edit__anchor">
        <div class="asset-edit__anchor-hd">
          <b>一致性锚 consistencyAnchor</b>
          <Button type="link" size="small" @click="refreshAnchor(true)">
            重新生成锚点
          </Button>
        </div>
        <div class="asset-edit__grid">
          <label>
            <span>发型</span>
            <Input v-model:value="anchor.hair" @input="anchorManual = true" />
          </label>
          <label>
            <span>服装</span>
            <Input v-model:value="anchor.outfit" @input="anchorManual = true" />
          </label>
          <label>
            <span>特征</span>
            <Input v-model:value="anchor.features" @input="anchorManual = true" />
          </label>
          <label>
            <span>身高</span>
            <Input v-model:value="anchor.height" @input="anchorManual = true" />
          </label>
          <label>
            <span>年龄</span>
            <Input v-model:value="anchor.age" @input="anchorManual = true" />
          </label>
        </div>
      </div>

      <label v-if="assetType !== 'element'">
        <span class="asset-edit__prompt-label">
          形象提示词 visualPrompt
          <Button type="link" size="small" @click="refreshPrompt(true)">
            重新生成提示词
          </Button>
        </span>
        <Input.TextArea
          v-model:value="form.visualPrompt"
          :rows="4"
          @input="promptManual = true"
        />
      </label>

      <div class="asset-edit__actions">
        <Button :loading="saving" @click="save(false)">保存</Button>
        <Button
          v-if="assetType !== 'element'"
          type="primary"
          :loading="saving"
          @click="save(true)"
        >
          保存并生成形象
        </Button>
      </div>
      <p class="asset-edit__tip">
        标签用于跨镜头一致性校验；visualPrompt 用于形象与关键帧生成。
      </p>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.asset-edit {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow-y: auto;

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }

  &__anchor {
    padding-top: 10px;
    border-top: 1px dashed hsl(var(--border));
  }

  &__anchor-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
  }

  &__prompt-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px dashed hsl(var(--border));
  }

  &__tip {
    margin: 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
}
</style>
