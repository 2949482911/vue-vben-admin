<script lang="ts" setup name="SegmentReferenceModal">
/**
 * 段落/单镜视频参考素材：给万相 mediaRefs 显式按顺序传 reference_image /
 * reference_video / reference_audio，并允许覆盖 prompt。段落与单镜视频共用本选择器。
 * 不传参考素材时仍走原自动逻辑（段落自动首尾帧 / 单镜关键帧=首帧）；
 * 参考素材与首尾帧互斥，因此这里不提供首/尾帧。
 */
import type { MediaRef, MediaRole, SegmentItem } from "#/api/models/ai_asset";
import type { ModelCapabilities, ModelCapabilityCheck } from "#/api/models/ai_model";
import type { RefAsset } from "#/views/ai_asset/studio/constants";

import { computed, ref, watch } from "vue";

import { useVbenDrawer } from "@vben/common-ui";

import { Button, Input, message, Modal, Select, Tag } from "ant-design-vue";

import RefPickerDrawer from "../../studio/components/RefPickerDrawer.vue";

const props = defineProps<{
  capabilities?: ModelCapabilities | ModelCapabilityCheck;
  /** 单镜模式可预填原 videoPrompt */
  defaultPrompt?: string;
  modelId?: number | string;
  segment?: SegmentItem;
  /** 段落用「第 N 段」，单镜传「第 N 镜」 */
  subjectLabel?: string;
  submitting?: boolean;
}>();
const emit = defineEmits<{
  submit: [
    payload: { mediaRefs: MediaRef[]; promptOverride?: string },
  ];
}>();
const open = defineModel<boolean>("open", { default: false });

type ReferenceRole = "reference_audio" | "reference_image" | "reference_video";

interface ReferenceRow {
  key: string;
  materialId?: number | string;
  name?: string;
  role: ReferenceRole;
  url: string;
}

const rows = ref<ReferenceRow[]>([]);
const promptOverride = ref("");
const pickingIndex = ref<number>();
let rowSeed = 0;

const modalTitle = computed(() =>
  props.subjectLabel
    ? `参考素材 · ${props.subjectLabel}`
    : `参考素材 · 第 ${props.segment?.seq ?? "-"} 段`
);

const ROLE_OPTIONS = [
  { label: "参考图", value: "reference_image" },
  { label: "参考视频", value: "reference_video" },
  { label: "参考音频", value: "reference_audio" }
];

const LIMITS = computed(() => ({
  reference_audio: props.capabilities?.maxRefAudios ?? 5,
  reference_image: props.capabilities?.maxRefImages ?? 10,
  reference_video: props.capabilities?.maxRefVideos ?? 5
}));

const availableRoleOptions = computed(() =>
  ROLE_OPTIONS.filter((option) => {
    const capabilities = props.capabilities;
    if (!capabilities) {
      return true;
    }
    if (option.value === "reference_image") {
      return capabilities.supportsRefImage !== false;
    }
    if (option.value === "reference_video") {
      return capabilities.supportsRefVideo !== false;
    }
    return capabilities.supportsRefAudio !== false;
  })
);

const [MaterialDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: RefPickerDrawer
});

function roleCount(role: ReferenceRole) {
  return rows.value.filter((row) => row.role === role).length;
}

/** prompt 里的 图1/视频1/音频1 按同类型出现顺序编号 */
function roleOrderLabel(row: ReferenceRow) {
  const sameType = rows.value.filter((item) => item.role === row.role);
  const index = sameType.indexOf(row) + 1;
  if (row.role === "reference_image") {
    return `图${index}`;
  }
  if (row.role === "reference_video") {
    return `视频${index}`;
  }
  return `音频${index}`;
}

function addRow() {
  const firstRole = availableRoleOptions.value[0];
  if (!firstRole) {
    message.warning("当前模型不支持参考素材");
    return;
  }
  rows.value.push({
    key: `ref-${rowSeed++}`,
    role: firstRole.value as ReferenceRole,
    url: ""
  });
}

function removeRow(index: number) {
  rows.value.splice(index, 1);
}

function moveRow(index: number, delta: number) {
  const next = index + delta;
  if (next < 0 || next >= rows.value.length) {
    return;
  }
  const list = [...rows.value];
  const [row] = list.splice(index, 1);
  list.splice(next, 0, row!);
  rows.value = list;
}

function pickMaterial(index: number) {
  pickingIndex.value = index;
  const row = rows.value[index];
  drawerApi.setData({
    hint: "选择 1 个素材作为参考（顺序即 prompt 里的 图1/视频1/音频1）",
    max: 1,
    selected: row?.materialId
      ? [{ description: "", id: row.materialId, name: row.name || "", url: row.url }]
      : [],
    sources: ["workspace"],
    title: "选择参考素材"
  });
  drawerApi.open();
}

function onPicked(refs: RefAsset[]) {
  const index = pickingIndex.value;
  const picked = refs[0];
  if (index === undefined || !picked) {
    return;
  }
  const row = rows.value[index];
  if (!row) {
    return;
  }
  row.url = picked.url;
  row.materialId = picked.id;
  row.name = picked.name;
  pickingIndex.value = undefined;
}

function submit() {
  if (rows.value.length) {
    for (const row of rows.value) {
      if (!row.url) {
        message.warning("请先为每条参考素材选择素材或填写地址");
        return;
      }
      if (roleCount(row.role) > LIMITS.value[row.role]) {
        message.warning(
          `${ROLE_OPTIONS.find((item) => item.value === row.role)?.label} 最多 ${LIMITS.value[row.role]} 个`
        );
        return;
      }
    }
  }
  const prompt = promptOverride.value.trim();
  if (prompt.length > 20_000) {
    message.warning("prompt 最多 20000 字符");
    return;
  }
  emit("submit", {
    mediaRefs: rows.value.map((row) => ({
      materialId: row.materialId,
      role: row.role as MediaRole,
      url: row.url
    })),
    promptOverride: prompt || undefined
  });
}

watch(open, (value) => {
  if (value) {
    rows.value = [];
    promptOverride.value = props.defaultPrompt ?? "";
    pickingIndex.value = undefined;
  }
});
</script>

<template>
  <Modal
    v-model:open="open"
    :confirm-loading="submitting"
    :title="modalTitle"
    ok-text="提交生成"
    width="760px"
    @ok="submit"
  >
    <div class="segment-ref">
      <p class="nwb-tip">
        按顺序添加参考图/视频/音频；prompt 里用「图1/视频1/音频1」引用。传参考素材后，
        后端不再自动使用首尾帧（两者互斥）。
      </p>

      <div class="segment-ref__list">
        <div
          v-for="(row, index) in rows"
          :key="row.key"
          class="segment-ref__row"
        >
          <Tag :bordered="false" color="blue">{{ roleOrderLabel(row) }}</Tag>
          <Select
            v-model:value="row.role"
            :options="availableRoleOptions"
            size="small"
            style="width: 120px"
          />
          <span class="segment-ref__name">
            {{ row.name || row.url || "未选择素材" }}
          </span>
          <Button size="small" @click="pickMaterial(index)">选择素材</Button>
          <Button
            size="small"
            :disabled="index === 0"
            @click="moveRow(index, -1)"
          >
            ↑
          </Button>
          <Button
            size="small"
            :disabled="index === rows.length - 1"
            @click="moveRow(index, 1)"
          >
            ↓
          </Button>
          <Button danger size="small" @click="removeRow(index)">删除</Button>
        </div>
        <span v-if="!rows.length" class="nwb-tip">
          未添加参考素材时，沿用后端自动首尾帧逻辑。
        </span>
      </div>

      <div class="segment-ref__actions">
        <Button
          size="small"
          :disabled="!availableRoleOptions.length"
          @click="addRow"
        >
          + 添加参考素材
        </Button>
        <span class="nwb-tip">
          图片最多 {{ LIMITS.reference_image }}，视频 {{ LIMITS.reference_video }}，音频
          {{ LIMITS.reference_audio }}
        </span>
      </div>

      <label class="segment-ref__prompt">
        <span>promptOverride（可选，最多 20000 字符）</span>
        <Input.TextArea
          v-model:value="promptOverride"
          :maxlength="20000"
          :rows="5"
          placeholder="不填则使用后端段落模板；可显式写说话人 + 台词 + 语气"
          show-count
        />
      </label>
    </div>
  </Modal>

  <MaterialDrawer @confirm="onPicked" />
</template>

<style scoped lang="scss">
.segment-ref {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.segment-ref__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.segment-ref__row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 6px 8px;
  background: hsl(var(--accent));
  border-radius: 6px;
}

.segment-ref__name {
  flex: 1;
  min-width: 160px;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-ref__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.segment-ref__prompt {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}
</style>
