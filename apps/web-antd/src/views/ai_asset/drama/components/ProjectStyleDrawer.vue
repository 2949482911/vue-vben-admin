<script lang="ts" setup name="DramaProjectStyleDrawer">
/**
 * 项目画风抽屉（P2 契约）。
 *
 * 链路位置：短剧工作台顶栏「项目画风」→ 本抽屉 → v2/project/novels/{novelId}/visual-style。
 * 预设 code / 自定义 prompt / 清除空对象三条写入路径与后端冻结契约一一对应；
 * effectivePrompt 只读，保存后重新拉取，前端不自行拼接提示词。
 */
import type { ProjectVisualStyleView } from '#/api/models/ai_asset_project';

import { computed, ref, watch } from 'vue';

import { UploadOutlined } from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Image,
  Input,
  message,
  Popconfirm,
  Radio,
  Spin,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';
import { aiAssetProjectApi } from '#/api/core/ai_asset_project';

import { useAssetUpload } from '../../useAssetUpload';
import { formatApiError, parseApiError } from '../error';

const props = defineProps<{
  novelId?: number | string;
  open: boolean;
}>();

const emit = defineEmits<{
  saved: [view: ProjectVisualStyleView];
  'update:open': [value: boolean];
}>();

const loading = ref(false);
const notReady = ref(false);
const loadError = ref('');
const view = ref<ProjectVisualStyleView>();

const selectedCode = ref<string>();
const customPrompt = ref('');
const customNegative = ref('');

const referenceMaterialId = ref<number | string>();
const referenceUrl = ref('');
const referenceUploading = ref(false);
const referenceError = ref('');

const { upload: uploadAsset } = useAssetUpload();

const saving = ref(false);
const saveError = ref('');

const hasCustom = computed(() => customPrompt.value.trim().length > 0);
const canSave = computed(
  () => Boolean(selectedCode.value) || hasCustom.value,
);

const saveDisabledReason = computed(() => {
  if (saving.value) {
    return '保存中';
  }
  if (referenceUploading.value) {
    return '样图上传中';
  }
  if (!props.novelId) {
    return '先选择项目';
  }
  if (loading.value) {
    return '画风加载中';
  }
  if (notReady.value) {
    return '接口未就绪';
  }
  if (loadError.value) {
    return '画风加载失败';
  }
  if (canSave.value) {
    return '';
  }
  if (view.value && !view.value.presets.length) {
    return '暂无可用画风：请先补系统字典 ai_visual_style，或在下方填写自定义提示词';
  }
  return '请选择预设或填写自定义提示词';
});

/** 用后端当前画风回填表单：自定义走 textarea，预设走 code，无风格则全部清空 */
function applyCurrent(current: ProjectVisualStyleView['current']) {
  selectedCode.value = undefined;
  customPrompt.value = '';
  customNegative.value = '';
  referenceMaterialId.value = undefined;
  referenceUrl.value = '';
  referenceError.value = '';
  if (!current) {
    return;
  }
  referenceMaterialId.value = current.styleReferenceMaterialId ?? undefined;
  referenceUrl.value =
    current.styleReferenceThumbnailUrl ?? current.styleReferenceUrl ?? '';
  if (current.custom) {
    customPrompt.value = current.prompt ?? '';
    customNegative.value = current.negativePrompt ?? '';
    return;
  }
  selectedCode.value = current.code;
}

async function load() {
  view.value = undefined;
  notReady.value = false;
  loadError.value = '';
  saveError.value = '';
  if (!props.novelId) {
    return;
  }
  loading.value = true;
  try {
    view.value = await aiAssetProjectApi.fetchProjectVisualStyle(props.novelId);
    applyCurrent(view.value.current);
  } catch (error) {
    const info = parseApiError(error);
    notReady.value = info.notReady;
    loadError.value = info.notReady ? '' : info.message;
  } finally {
    loading.value = false;
  }
}

function choosePreset() {
  customPrompt.value = '';
  customNegative.value = '';
  saveError.value = '';
}

function editCustom() {
  selectedCode.value = undefined;
  saveError.value = '';
}

async function reloadAndNotify() {
  await load();
  if (view.value) {
    emit('saved', view.value);
  }
}

async function uploadReference(file: File) {
  if (referenceUploading.value) {
    return;
  }
  referenceUploading.value = true;
  referenceError.value = '';
  try {
    const storageUrl = await uploadAsset(file);
    const material = await aiAssetApi.uploadMaterial(
      {
        fileSize: file.size,
        materialType: 'image',
        name: file.name,
        remark: `项目画风样图：${file.name}`,
        storageUrl,
        thumbnailUrl: storageUrl,
      },
      true,
    );
    if (!material?.id) {
      throw new Error('素材登记未返回 materialId');
    }
    referenceMaterialId.value = material.id;
    referenceUrl.value = material.storageUrl ?? storageUrl;
    message.success('风格样图已上传，保存后生效');
  } catch (error) {
    referenceError.value = formatApiError(parseApiError(error));
  } finally {
    referenceUploading.value = false;
  }
}

function beforeReferenceUpload(file: File) {
  if (file.type && !file.type.startsWith('image/')) {
    message.warning('请选择图片文件');
    return false;
  }
  void uploadReference(file);
  return false;
}

async function save() {
  if (!props.novelId || saveDisabledReason.value) {
    return;
  }
  saving.value = true;
  saveError.value = '';
  try {
    if (selectedCode.value) {
      await aiAssetProjectApi.saveProjectVisualStyle(props.novelId, {
        code: selectedCode.value,
        styleReferenceMaterialId: referenceMaterialId.value,
      });
    } else {
      await aiAssetProjectApi.saveProjectVisualStyle(props.novelId, {
        negativePrompt: customNegative.value.trim() || undefined,
        prompt: customPrompt.value.trim(),
        styleReferenceMaterialId: referenceMaterialId.value,
      });
    }
    await reloadAndNotify();
    message.success('项目画风已保存');
  } catch (error) {
    saveError.value = parseApiError(error).message;
  } finally {
    saving.value = false;
  }
}

async function clearStyle() {
  if (!props.novelId) {
    return;
  }
  saving.value = true;
  saveError.value = '';
  try {
    await aiAssetProjectApi.saveProjectVisualStyle(props.novelId, {});
    await reloadAndNotify();
    message.success('已清除项目画风');
  } catch (error) {
    saveError.value = parseApiError(error).message;
  } finally {
    saving.value = false;
  }
}

watch(
  () => [props.open, props.novelId] as const,
  ([open]) => {
    if (open) {
      void load();
    }
  },
  { immediate: true },
);
</script>

<template>
  <Drawer
    :open="open"
    title="项目画风"
    width="640px"
    @close="emit('update:open', false)"
  >
    <Spin :spinning="loading">
      <div class="style">
        <Alert
          v-if="notReady"
          message="接口未就绪"
          description="后端 v2/project 画风契约尚未上线，暂不能读取或保存。"
          type="info"
          show-icon
        />
        <Alert
          v-else-if="loadError"
          :message="loadError"
          type="error"
          show-icon
        />
        <template v-else>
          <section class="style__section">
            <div class="style__label">预设</div>
            <div v-if="view && !view.presets.length" class="style__empty">
              <Empty
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                description="暂无可用画风"
              />
              <Alert
                message="系统字典还未配置项目画风"
                description="请先在「系统管理 → 字典管理」补齐 ai_visual_style；临时也可以直接在下方填写自定义提示词保存。"
                type="warning"
                show-icon
              />
            </div>
            <Radio.Group
              v-else
              v-model:value="selectedCode"
              class="style__presets"
              @change="choosePreset"
            >
              <Radio
                v-for="preset in view?.presets ?? []"
                :key="preset.code"
                :value="preset.code"
                class="preset"
              >
                <span class="preset__label">{{ preset.label }}</span>
                <span class="preset__prompt">{{ preset.prompt }}</span>
              </Radio>
            </Radio.Group>
          </section>

          <section class="style__section">
            <div class="style__label">自定义</div>
            <Input.TextArea
              v-model:value="customPrompt"
              :maxlength="500"
              :rows="4"
              placeholder="填写画面风格提示词（≤500 字）"
              show-count
              @input="editCustom"
            />
            <Input.TextArea
              v-model:value="customNegative"
              :maxlength="300"
              :rows="2"
              placeholder="负向提示词（可选，≤300 字）"
              show-count
              @input="editCustom"
            />
          </section>

          <section class="style__section">
            <div class="style__label">风格样图</div>
            <div v-if="referenceUrl" class="style__reference">
              <Image
                :src="referenceUrl"
                :preview="{ src: referenceUrl }"
                class="style__reference-image"
              />
              <div class="style__reference-meta">
                <div class="style__hint">仅用于画风，不绑定角色/场景</div>
                <Upload
                  accept="image/*"
                  :before-upload="beforeReferenceUpload"
                  :disabled="referenceUploading"
                  :show-upload-list="false"
                >
                  <Button
                    :loading="referenceUploading"
                    size="small"
                  >
                    <template #icon><UploadOutlined /></template>
                    更换样图
                  </Button>
                </Upload>
              </div>
            </div>
            <Upload
              v-else
              accept="image/*"
              :before-upload="beforeReferenceUpload"
              :disabled="referenceUploading"
              :show-upload-list="false"
            >
              <Button :loading="referenceUploading">
                <template #icon><UploadOutlined /></template>
                上传样图
              </Button>
            </Upload>
            <div class="style__hint">
              样图只用于统一画风，不参与实体图绑定；保存后生效。
            </div>
            <Alert
              v-if="referenceError"
              :message="referenceError"
              type="error"
              show-icon
            />
          </section>

          <section class="style__section">
            <div class="style__label">生效提示词（后端计算，只读）</div>
            <Input.TextArea
              :rows="2"
              :value="view?.effectivePrompt || ''"
              placeholder="当前无生效提示词"
              readonly
            />
            <div v-if="view?.current?.updatedAt" class="style__hint">
              更新于 {{ view.current.updatedAt }}
            </div>
          </section>

          <Alert
            v-if="saveError"
            :message="saveError"
            type="error"
            show-icon
          />
        </template>
      </div>
    </Spin>

    <template #footer>
      <Button @click="emit('update:open', false)">关闭</Button>
      <Popconfirm
        :disabled="notReady || Boolean(loadError) || saving"
        cancel-text="取消"
        ok-text="清除"
        title="清除项目画风？"
        @confirm="clearStyle"
      >
        <Button
          danger
          :disabled="notReady || Boolean(loadError) || saving"
        >
          清除风格
        </Button>
      </Popconfirm>
      <Tooltip :title="saveDisabledReason">
        <span>
          <Button
            :disabled="Boolean(saveDisabledReason)"
            :loading="saving"
            type="primary"
            @click="save"
          >
            保存
          </Button>
        </span>
      </Tooltip>
    </template>
  </Drawer>
</template>

<style scoped lang="scss">
.style {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__presets {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__hint {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  &__reference {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 8px;
    background: hsl(var(--accent));
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
  }

  &__reference-image {
    flex: none;
    width: 96px;
    height: 96px;
    overflow: hidden;
    border-radius: 6px;

    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__reference-meta {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
  }
}

.preset {
  display: flex;
  width: 100%;
  padding: 10px 12px;
  margin: 0;
  background-color: hsl(var(--accent));
  border: 1px solid transparent;
  border-radius: var(--radius);

  &__label {
    display: block;
    font-weight: 500;
    color: hsl(var(--foreground));
  }

  &__prompt {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
  }
}
</style>
