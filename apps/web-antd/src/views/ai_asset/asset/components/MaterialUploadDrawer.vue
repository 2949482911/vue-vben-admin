<script lang="ts" setup name="MaterialUploadDrawer">
/**
 * 素材库 — 新增素材（useVbenDrawer + useVbenForm）
 *
 * 队列式直传：选择文件 → OSS 直传（带进度）→ material/upload 登记。
 * 简单字段（素材类型/名称前缀/备注）走 useVbenForm；文件队列为自定义 UI。
 */
import type { MaterialType } from '#/api/models/ai_asset';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  FileImageOutlined,
  FileOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  UploadOutlined,
} from '@ant-design/icons-vue';
import {
  Progress,
  Tooltip,
  Upload,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { aiAssetApi } from '#/api';
import { uploadToOss } from '#/utils/uploadToOss';
import { useOssClient } from '#/views/marketing/asset/material/useOssClient';

import { MATERIAL_TYPE_MAP } from '../../constants';

const emit = defineEmits(['success']);

const OSS_BASE = 'https://proxy-ads.oss-cn-shenzhen.aliyuncs.com';
const TYPE_ICON: Record<string, any> = {
  audio: SoundOutlined,
  image: FileImageOutlined,
  text: FileOutlined,
  video: PlayCircleOutlined,
};

type QueueState = 'err' | 'ok' | 'pending' | 'registering' | 'uploading';
type QueueItem = {
  error?: string;
  file: File;
  /** 字节 */
  fileSize: number;
  /** 可读大小，如 "12.3 MB" */
  fileSizeStr: string;
  height?: number;
  name: string;
  percent: number;
  state: QueueState;
  storageUrl?: string;
  type: MaterialType;
  uid: string;
  /** 视频时长（秒）/ 可读 "00:15" */
  videoDuration?: string;
  videoDurationSecond?: number;
  width?: number;
};

const queue = ref<QueueItem[]>([]);
const uploading = ref(false);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: [
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '自动识别', value: 'auto' },
          { label: '图片', value: 'image' },
          { label: '视频', value: 'video' },
          { label: '音频', value: 'audio' },
        ],
      },
      defaultValue: 'auto',
      fieldName: 'uploadType',
      label: '素材类型',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '可选，留空用文件名' },
      fieldName: 'namePrefix',
      label: '名称前缀',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '可选' },
      fieldName: 'remark',
      label: '备注',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

function detectType(file: File): MaterialType {
  if (file.type.startsWith('video')) {
    return 'video';
  }
  if (file.type.startsWith('audio')) {
    return 'audio';
  }
  if (file.type.startsWith('image')) {
    return 'image';
  }
  return 'text';
}

function humanSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${bytes} B`;
}

/** 秒 → "00:15" */
function humanDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/** 取图片宽高（自然尺寸） */
function probeImage(file: File): Promise<{ height: number; width: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ height: image.naturalHeight, width: image.naturalWidth });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片解码失败，取不到尺寸'));
    };
    image.src = url;
  });
}

/** 取视频宽高与时长 */
function probeVideo(
  file: File,
): Promise<{ duration: number; height: number; width: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const result = {
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        height: video.videoHeight,
        width: video.videoWidth,
      };
      URL.revokeObjectURL(url);
      resolve(result);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('视频元数据读取失败'));
    };
    video.src = url;
  });
}

/**
 * 上传前把媒体信息算好（后端 material/upload 需要）：
 * 图片取自然宽高、视频取宽高 + 时长、大小取字节（另给可读串）
 */
async function buildQueueItem(file: File, type: MaterialType): Promise<QueueItem> {
  const item: QueueItem = {
    file,
    fileSize: file.size,
    fileSizeStr: humanSize(file.size),
    name: file.name,
    percent: 0,
    state: 'pending',
    type,
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  try {
    if (type === 'image') {
      const { height, width } = await probeImage(file);
      item.height = height;
      item.width = width;
    } else if (type === 'video') {
      const { duration, height, width } = await probeVideo(file);
      item.height = height;
      item.width = width;
      if (duration > 0) {
        item.videoDuration = humanDuration(duration);
        item.videoDurationSecond = Math.round(duration);
      }
    }
  } catch {
    // 取不到尺寸/时长不阻塞上传，后端可自行按文件推断
  }
  return item;
}

/** 选择文件：阻断 antd 自动上传，纳入自有队列 */
async function beforeUpload(file: File) {
  const values = await formApi.getValues();
  const t = (values.uploadType ?? 'auto') as 'auto' | MaterialType;
  const type = t === 'auto' ? detectType(file) : t;
  queue.value.push(await buildQueueItem(file, type));
  return false;
}

async function submit() {
  if (queue.value.length === 0) {
    return false;
  }
  const values = await formApi.getValues();
  uploading.value = true;
  let ok = 0;
  try {
    const client = await useOssClient();
    for (const item of queue.value) {
      if (item.state === 'ok') {
        continue;
      }
      try {
        item.state = 'uploading';
        const safe = item.name.replaceAll(/[^\w.-]/g, '_');
        const objectKey = `ai-asset/upload/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}-${safe}`;
        await uploadToOss(client, item.file, objectKey, (p) => {
          item.percent = p;
        });
        item.storageUrl = `${OSS_BASE}/${objectKey}`;
        item.state = 'registering';
        await aiAssetApi.uploadMaterial({
          // 媒体字段（后端按这些入库；format 后端也会按宽高推断，这里直接给准确值）
          fileSize: item.fileSize,
          fileSizeStr: item.fileSizeStr,
          format:
            item.height && item.width
              ? item.width >= item.height
                ? 1
                : 2
              : undefined,
          height: item.height,
          materialType: item.type,
          name: values.namePrefix
            ? `${values.namePrefix}${item.name}`
            : item.name,
          remark: values.remark || undefined,
          storageUrl: item.storageUrl,
          thumbnailUrl: item.storageUrl,
          videoDuration: item.videoDuration,
          videoDurationSecond: item.videoDurationSecond,
          width: item.width,
        });
        item.state = 'ok';
        ok += 1;
      } catch (error: any) {
        item.state = 'err';
        // 直传成功后失败基本是登记环节（后端已实现 material/upload，失败按真实原因提示）
        item.error = item.storageUrl
          ? `登记失败：${String(error?.message ?? error)}`
          : String(error?.message ?? error);
      }
    }
  } finally {
    uploading.value = false;
  }
  if (ok > 0) {
    emit('success');
    await drawerApi.close();
  }
  return false;
}

const [Drawer, drawerApi] = useVbenDrawer({
  class: 'w-[560px]',
  closeOnPressEscape: true,
  async onConfirm() {
    await submit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      queue.value = [];
      formApi.resetForm();
    }
  },
});
</script>

<template>
  <Drawer title="新增素材">
    <Upload.Dragger
      class="dropzone"
      :before-upload="beforeUpload"
      :show-upload-list="false"
      multiple
    >
      <p class="ant-upload-drag-icon"><UploadOutlined /></p>
      <p class="dz-title">拖拽文件到此处，或点击选择</p>
      <p class="dz-hint">支持 jpg / png / webp / mp4 / mov / mp3，单文件 ≤ 200MB</p>
    </Upload.Dragger>

    <Form />

    <div class="filelist">
      <div v-for="f in queue" :key="f.uid" class="file-row">
        <component
          :is="TYPE_ICON[f.type]"
          class="file-ic"
          :class="`file-ic--${f.type}`"
        />
        <div class="file-main">
          <div class="file-name">{{ f.name }}</div>
          <div class="file-meta">
            {{ MATERIAL_TYPE_MAP[f.type] || f.type }} · {{ f.fileSizeStr }}
            <template v-if="f.width && f.height">
              · {{ f.width }}×{{ f.height }}
            </template>
            <template v-if="f.videoDuration"> · {{ f.videoDuration }}</template>
          </div>
          <Progress
            :percent="f.percent"
            :show-info="false"
            :status="f.state === 'err' ? 'exception' : 'normal'"
            size="small"
          />
        </div>
        <span
          class="file-state"
          :class="{ 'is-err': f.state === 'err', 'is-ok': f.state === 'ok' }"
        >
          <Tooltip v-if="f.error" :title="f.error">{{ f.error }}</Tooltip>
          <template v-else>
            {{
              f.state === 'ok'
                ? '已完成'
                : f.state === 'registering'
                  ? '登记中'
                  : `${f.percent}%`
            }}
          </template>
        </span>
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.dropzone {
  :deep(.ant-upload-drag) {
    border-radius: calc(var(--radius, 0.75rem) - 4px);
  }
}

.dz-title {
  margin: 8px 0 2px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.dz-hint {
  margin: 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.filelist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.file-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius, 0.75rem) - 4px);
}

.file-ic {
  flex: none;
  font-size: 18px;
  color: hsl(var(--primary));
}

.file-ic--video {
  color: hsl(258 84% 62%);
}

.file-ic--audio {
  color: hsl(187 78% 38%);
}

.file-main {
  flex: 1;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
}

.file-state {
  flex: none;
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
}

.file-state.is-err {
  color: hsl(var(--destructive));
}

.file-state.is-ok {
  color: hsl(var(--success));
}
</style>
