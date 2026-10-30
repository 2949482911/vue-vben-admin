import type { Ref } from 'vue';

import type {
  EpisodeItem,
  EpisodeScriptIssue,
  EpisodeScriptValidateResult,
} from '#/api/models/ai_asset';

import { computed, ref, watch } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { apiErrorText } from './apiError';
import { SCRIPT_STATUS, SCRIPT_STATUS_META } from './status';

function collectIssues(result?: EpisodeScriptValidateResult) {
  // 后端 AiAssetScriptIssue 本身不带 level，结论在返回体顶层；统一补齐后再分流
  const resultLevel = String(result?.level ?? '').toLowerCase();
  const defaultLevel = resultLevel === 'error' ? 'error' : 'warning';
  const issues: EpisodeScriptIssue[] = [
    ...(result?.errors ?? []),
    ...(result?.warnings ?? []),
    ...(result?.issues ?? []),
  ].map((item) => ({
    ...item,
    level: String(item.level ?? defaultLevel).toLowerCase(),
  }));
  const seen = new Set<string>();
  return issues.filter((item) => {
    const key = `${item.level}-${item.sceneSeq ?? item.seq ?? ''}-${item.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function sceneText(issue: EpisodeScriptIssue) {
  return `第 ${issue.sceneSeq ?? issue.seq ?? '?'} 场`;
}

function hasScriptContent(item?: EpisodeItem) {
  return Boolean(item?.script || item?.scenes?.length);
}

/**
 * 剧本状态 / 校验 / 定稿编排。
 * 状态唯一来源是 episode.scriptStatus（列表与详情返回），校验结果只做生成分镜前的拦截；
 * 校验接口未就绪时不阻断，交给生成分镜接口 400 兜底。
 */
export function useEpisodeScript(options: {
  episode: Ref<EpisodeItem | undefined>;
  modelId: () => number | string | undefined;
  updateEpisodeRow: (item: EpisodeItem) => void;
}) {
  const validationOpen = ref(false);
  const validatingCount = ref(0);
  const validating = computed(() => validatingCount.value > 0);
  const finalizing = ref(false);
  const validationResult = ref<EpisodeScriptValidateResult>();
  /** 静默校验失败也要留痕，定稿前再展示后端原文 */
  const validationError = ref<{ code: number; message: string }>();

  const scriptStatus = computed(() =>
    Number(options.episode.value?.scriptStatus ?? SCRIPT_STATUS.NONE),
  );
  const scriptStatusMeta = computed(
    () =>
      SCRIPT_STATUS_META[scriptStatus.value] ??
      SCRIPT_STATUS_META[SCRIPT_STATUS.NONE]!,
  );
  const scriptIssues = computed(() => collectIssues(validationResult.value));
  const scriptErrors = computed(() =>
    scriptIssues.value.filter(
      (item) => String(item.level).toLowerCase() === 'error',
    ),
  );
  const scriptWarnings = computed(() =>
    scriptIssues.value.filter(
      (item) => String(item.level).toLowerCase() !== 'error',
    ),
  );

  const scriptGateReason = computed(() => {
    if (!hasScriptContent(options.episode.value)) {
      return '请先生成剧本并定稿，再生成分镜';
    }
    if (scriptStatus.value === SCRIPT_STATUS.EXPIRED) {
      return '剧本已过期，请重新校验并定稿';
    }
    if (scriptStatus.value !== SCRIPT_STATUS.FINALIZED) {
      return '剧本未定稿，请先在剧本页校验并定稿';
    }
    if (scriptErrors.value.length) {
      const list = scriptErrors.value
        .slice(0, 3)
        .map((item) => `${sceneText(item)}：${item.message}`)
        .join('；');
      return `剧本校验有误：${list}`;
    }
    return '';
  });
  const canGenerateStoryboard = computed(
    () =>
      scriptStatus.value === SCRIPT_STATUS.FINALIZED &&
      scriptErrors.value.length === 0,
  );

  function resetScriptValidation() {
    validationResult.value = undefined;
    validationError.value = undefined;
    validationOpen.value = false;
  }

  async function validateScript(openModal = true, silent = false) {
    const current = options.episode.value;
    if (!current || !hasScriptContent(current)) {
      return undefined;
    }
    validatingCount.value += 1;
    try {
      const res = await aiAssetApi.validateEpisodeScript(current.id);
      validationResult.value = res;
      validationError.value = undefined;
      if (
        res?.scriptStatus !== undefined &&
        res?.scriptStatus !== null &&
        String(options.episode.value?.id) === String(current.id)
      ) {
        options.episode.value = {
          ...options.episode.value!,
          scriptStatus: res.scriptStatus,
        };
        options.updateEpisodeRow(options.episode.value);
      }
      const issues = collectIssues(res);
      const resultLevel = String(res?.level ?? '').toLowerCase();
      if (
        openModal &&
        (issues.length > 0 ||
          resultLevel === 'error' ||
          resultLevel === 'warning')
      ) {
        validationOpen.value = true;
        if (!issues.length) {
          message.warning('校验未通过，但后端未返回问题明细');
        }
      } else if (openModal && !silent) {
        message.success('剧本校验通过');
      }
      return res;
    } catch (error: any) {
      const code = Number(
        error?.response?.status ?? error?.code ?? error?.data?.code,
      );
      const text =
        code === 404
          ? '功能未开放：剧本校验接口未就绪，待后端上线后重试'
          : apiErrorText(error, '剧本校验失败，请稍后重试');
      validationError.value = { code, message: text };
      if (!silent) {
        message.error(text);
      }
      return undefined;
    } finally {
      validatingCount.value = Math.max(0, validatingCount.value - 1);
    }
  }

  /** 进集校准：不弹窗，只刷新 scriptStatus 和校验结果，供生成分镜门禁用 */
  async function refreshCurrentEpisodeScriptStatus() {
    await validateScript(false, true);
  }

  async function finalizeScript() {
    const current = options.episode.value;
    if (!current || finalizing.value) {
      return false;
    }
    // 已定稿是持久状态，刷新后不再重复提交
    if (scriptStatus.value === SCRIPT_STATUS.FINALIZED) {
      return true;
    }
    if (!hasScriptContent(current)) {
      message.warning('请先生成剧本再定稿');
      return false;
    }
    // 定稿前先静默校验；校验接口 404 时继续由定稿接口兜底，其他失败原样展示
    const validation = await validateScript(false, true);
    if (!validation && validationError.value) {
      if (validationError.value.code === 404) {
        message.info('剧本校验接口未就绪，继续尝试定稿');
      } else {
        Modal.error({
          title: '剧本校验失败',
          content: validationError.value.message,
        });
        return false;
      }
    }
    const blockingErrors = collectIssues(validation).filter(
      (item) => String(item.level).toLowerCase() === 'error',
    );
    if (blockingErrors.length) {
      validationOpen.value = true;
      message.warning(
        `请先修复校验错误：${blockingErrors
          .slice(0, 3)
          .map((item) => `${sceneText(item)} ${item.message}`)
          .join('；')}`,
      );
      return false;
    }
    if (String(options.episode.value?.id) !== String(current.id)) {
      return false;
    }
    finalizing.value = true;
    try {
      const updated = await aiAssetApi.finalizeEpisodeScript({
        episodeId: current.id,
        modelId: options.modelId(),
      });
      options.episode.value = {
        ...current,
        ...updated,
        scriptStatus: updated?.scriptStatus ?? SCRIPT_STATUS.FINALIZED,
      };
      options.updateEpisodeRow(options.episode.value);
      resetScriptValidation();
      message.success('剧本已定稿，可以生成分镜了');
      return true;
    } catch (error: any) {
      const code = Number(
        error?.response?.status ?? error?.code ?? error?.data?.code,
      );
      if (code === 404) {
        message.error('功能未开放：剧本定稿接口未就绪，待后端上线后重试');
      } else {
        // 400 的场次校验清单在 message 里，必须原样展示
        Modal.error({
          title: '剧本定稿失败',
          content: apiErrorText(error, '剧本定稿失败，请稍后重试'),
        });
      }
      return false;
    } finally {
      finalizing.value = false;
    }
  }

  /** 生成分镜前：未定稿直接拦；已定稿再跑一次校验，按场次给出原因 */
  async function ensureReadyForStoryboard() {
    if (!options.episode.value) {
      return false;
    }
    if (!hasScriptContent(options.episode.value)) {
      message.warning('剧本未生成，请先生成剧本并定稿');
      return false;
    }
    if (scriptStatus.value !== SCRIPT_STATUS.FINALIZED) {
      await validateScript(true, true);
      message.warning(scriptGateReason.value);
      return false;
    }
    const result = await validateScript(true);
    // 校验接口未就绪时不阻断，后端生成分镜会再次校验并返回 400
    if (!result) {
      return true;
    }
    const issues = collectIssues(result);
    const errors = issues.filter(
      (item) => String(item.level).toLowerCase() === 'error',
    );
    if (errors.length) {
      validationOpen.value = true;
      message.warning(
        `剧本校验未通过：${errors
          .slice(0, 3)
          .map((item) => `${sceneText(item)} ${item.message}`)
          .join('；')}`,
      );
      return false;
    }
    return true;
  }

  watch(
    () => options.episode.value?.id,
    () => resetScriptValidation(),
  );

  return {
    canGenerateStoryboard,
    ensureReadyForStoryboard,
    finalizeScript,
    refreshCurrentEpisodeScriptStatus,
    resetScriptValidation,
    scriptErrors,
    scriptFinalizing: finalizing,
    scriptGateReason,
    scriptStatus,
    scriptStatusMeta,
    scriptValidating: validating,
    scriptValidationOpen: validationOpen,
    scriptWarnings,
    validateScript,
  };
}
