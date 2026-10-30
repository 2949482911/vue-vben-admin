import type { Ref } from 'vue';

import type { NovelDetailItem } from '#/api/models/ai_asset';

import { computed, ref, watch } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { apiErrorText } from './apiError';
import { downloadErrorText, downloadExportUrl } from './download';
import { FINISHED_FLAG } from './status';

export const ASPECT_RATIO_OPTIONS = [
  { label: '9:16 竖屏', value: '9:16' },
  { label: '16:9 横屏', value: '16:9' },
  { label: '1:1 方形', value: '1:1' },
  { label: '3:4 竖屏', value: '3:4' },
];

const ASPECT_RATIO_RESOLUTIONS: Record<string, string> = {
  '9:16': '1080x1920',
  '16:9': '1920x1080',
  '1:1': '1080x1080',
  '3:4': '1080x1440',
};

/** 当前覆盖比例换算成成片输出分辨率；后端 compose 请求只收 resolution */
export function resolutionForAspectRatio(ratio?: string) {
  return ASPECT_RATIO_RESOLUTIONS[ratio || ''] ?? '1080x1920';
}

/**
 * 小说生命周期：完结、txt 导出、预设比例设置。
 * 上游是创作台头部操作，下游写 novel.finished / novel.aspect_ratio；
 * 当前比例覆盖只在 workbench 内使用，不写回小说默认值。
 */
export function useNovelLifecycle(options: {
  book: Ref<NovelDetailItem | undefined>;
  novelId: () => number | string | undefined;
}) {
  const finishing = ref(false);
  const exporting = ref(false);
  const settingsOpen = ref(false);
  const settingsSaving = ref(false);
  const settingsAspectRatio = ref('9:16');
  const presetAspectRatio = computed(
    () => options.book.value?.aspectRatio || '9:16',
  );
  const activeAspectRatio = ref(presetAspectRatio.value);
  const isFinished = computed(
    () =>
      Number(options.book.value?.finished ?? FINISHED_FLAG.NO) ===
        FINISHED_FLAG.YES || Boolean(options.book.value?.finishedAt),
  );

  watch(
    presetAspectRatio,
    (value) => {
      activeAspectRatio.value = value;
      settingsAspectRatio.value = value;
    },
    { immediate: true },
  );

  function openSettings() {
    settingsAspectRatio.value = presetAspectRatio.value;
    settingsOpen.value = true;
  }

  /** 完结后统一拦截续写/新分集入口；后端仍会 400 兜底 */
  function ensureNotFinished(action: string) {
    if (!isFinished.value) {
      return true;
    }
    message.warning(`全书已完结，不能${action}`);
    return false;
  }

  function finishNovel() {
    const novelId = options.novelId();
    if (!novelId || isFinished.value || finishing.value) {
      return;
    }
    Modal.confirm({
      title: '确认全书完结？',
      content: '完结后不能继续续写或生成新分集，但仍可修改、校验与导出。',
      okText: '确认完结',
      cancelText: '再想想',
      async onOk() {
        finishing.value = true;
        try {
          const res = await aiAssetApi.finishNovel({ force: false, novelId });
          // 以响应为准：完结状态、时间和章节统计均以后端返回为准
          options.book.value = { ...options.book.value!, ...res };
          const finishedAt = options.book.value?.finishedAt;
          message.success(
            finishedAt ? `已完结 · ${finishedAt}` : '全书已完结',
          );
        } catch (error: any) {
          const code = Number(
            error?.response?.status ?? error?.code ?? error?.data?.code,
          );
          if (code === 404) {
            message.error('功能未开放：完结接口未就绪，待后端上线后重试');
          } else {
            // 400 会带未定稿章节清单，必须完整展示而不是替换成通用文案
            Modal.warning({
              title: '全书完结未通过',
              content: apiErrorText(error, '完结失败，请稍后重试'),
            });
          }
        } finally {
          finishing.value = false;
        }
      },
    });
  }

  async function saveSettings() {
    const novelId = options.novelId();
    if (!novelId || settingsSaving.value) {
      return;
    }
    settingsSaving.value = true;
    try {
      await aiAssetApi.saveNovel({
        aspectRatio: settingsAspectRatio.value,
        id: novelId,
        name: options.book.value?.name,
        synopsis: options.book.value?.synopsis,
      });
      if (options.book.value) {
        options.book.value = {
          ...options.book.value,
          aspectRatio: settingsAspectRatio.value,
        };
      }
      activeAspectRatio.value = settingsAspectRatio.value;
      settingsOpen.value = false;
      message.success('小说设置已保存');
    } catch (error: any) {
      const code = Number(
        error?.response?.status ?? error?.code ?? error?.data?.code,
      );
      message.error(
        code === 404
          ? '功能未开放：小说设置保存接口未就绪，待后端上线后重试'
          : `${apiErrorText(error, '保存小说设置失败')}${
              code === 400 ? '（请检查比例取值）' : ''
            }`,
      );
    } finally {
      settingsSaving.value = false;
    }
  }

  async function exportNovel() {
    const novelId = options.novelId();
    if (!novelId || exporting.value) {
      return;
    }
    exporting.value = true;
    try {
      const res = await aiAssetApi.exportNovel(novelId);
      downloadExportUrl(
        res?.url,
        res?.fileName || `${options.book.value?.name || '小说'}.txt`,
      );
      message.success('已开始下载全书 TXT');
    } catch (error: any) {
      message.error(
        downloadErrorText(
          error,
          '导出失败，请稍后重试',
          '请确认全书正文已保存后再导出',
        ),
      );
    } finally {
      exporting.value = false;
    }
  }

  return {
    activeAspectRatio,
    ensureNotFinished,
    exportNovel,
    exporting,
    finishNovel,
    finishing,
    isFinished,
    openSettings,
    presetAspectRatio,
    saveSettings,
    settingsAspectRatio,
    settingsOpen,
    settingsSaving,
  };
}
