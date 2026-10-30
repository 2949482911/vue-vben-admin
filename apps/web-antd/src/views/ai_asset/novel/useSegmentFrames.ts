import type { Ref } from 'vue';

import type { SegmentItem, ShotItem } from '#/api/models/ai_asset';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import { SHOT_GENERATION_STATUS } from './status';

type FramePosition = 'first' | 'last';

/**
 * 段落首/尾帧编排。
 * 上游是分镜页段落卡；下游复用 shot/image/generate 生图，再把素材 ID 写回 segment 首/尾帧。
 * 后端语义：首帧取本段第一镜关键帧；尾帧取同场下一段首帧，否则取本段末镜关键帧。
 */
export function useSegmentFrames(options: {
  reload: () => Promise<void>;
  segments: Ref<SegmentItem[]>;
  shotsOfSegment: (segment: SegmentItem) => ShotItem[];
  submitShotKeyframe: (shot: ShotItem) => Promise<ShotItem | undefined>;
  videoModelId: () => number | string | undefined;
}) {
  const loadingKey = ref<string>();

  function nextSegmentOf(segment: SegmentItem) {
    const ordered = [...options.segments.value].sort(
      (a, b) => Number(a.seq) - Number(b.seq),
    );
    const index = ordered.findIndex(
      (item) => String(item.id) === String(segment.id),
    );
    return index >= 0 ? ordered[index + 1] : undefined;
  }

  function tailShot(segment: SegmentItem) {
    const list = options.shotsOfSegment(segment);
    if (!list.length) {
      return undefined;
    }
    const next = nextSegmentOf(segment);
    if (next && Number(next.sceneSeq) === Number(segment.sceneSeq)) {
      const nextShots = options.shotsOfSegment(next);
      if (nextShots.length) {
        return nextShots[0];
      }
    }
    return list[list.length - 1];
  }

  function tailHint(segment: SegmentItem) {
    const next = nextSegmentOf(segment);
    if (
      next &&
      Number(next.sceneSeq) === Number(segment.sceneSeq) &&
      options.shotsOfSegment(next).length
    ) {
      return '尾帧沿用同场下一段首帧';
    }
    return '尾帧取本段最后一镜关键帧';
  }

  async function ensureShotKeyframe(shot: ShotItem) {
    if (shot.imageMaterialId) {
      return shot;
    }
    const updated = await options.submitShotKeyframe(shot);
    if (updated?.imageMaterialId) {
      return updated;
    }
    const startedAt = Date.now();
    while (Date.now() - startedAt < 180_000) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const detail = await aiAssetApi.fetchShotDetail(shot.id);
      if (detail?.imageMaterialId) {
        return detail;
      }
      if (
        Number(detail?.generationStatus) === SHOT_GENERATION_STATUS.FAILED
      ) {
        throw new Error('关键帧生成失败，请查看镜头提示词后重试');
      }
    }
    throw new Error('关键帧生成超时，请稍后刷新后重试');
  }

  async function generate(segment: SegmentItem, position: FramePosition) {
    if (loadingKey.value) {
      return;
    }
    const shots = options.shotsOfSegment(segment);
    if (!shots.length) {
      message.warning('本段没有镜头，无法生成首/尾帧');
      return;
    }
    const next = position === 'last' ? nextSegmentOf(segment) : undefined;
    const nextSameScene =
      next && Number(next.sceneSeq) === Number(segment.sceneSeq);
    let target: ShotItem | undefined;
    let materialId: number | string | undefined;
    let nextSegmentId: number | string | undefined;
    if (position === 'first') {
      target = shots[0];
    } else if (nextSameScene) {
      // 与后端 lastFrameId 优先级一致：下一段首镜关键帧 > 下一段首帧 > 生图
      const nextShots = options.shotsOfSegment(next!);
      const nextShotImage = nextShots[0]?.imageMaterialId;
      if (nextShotImage) {
        materialId = nextShotImage;
      } else if (next?.firstFrameMaterialId) {
        materialId = next.firstFrameMaterialId;
      } else {
        target = nextShots[0];
        nextSegmentId = next!.id;
      }
    }
    target = target ?? (position === 'last' ? tailShot(segment) : shots[0]);
    if (!target && !materialId) {
      message.warning('本段没有可用镜头，无法生成尾帧');
      return;
    }
    loadingKey.value = `${segment.id}-${position}`;
    try {
      if (!materialId && target) {
        const result = await ensureShotKeyframe(target);
        materialId = result.imageMaterialId;
      }
      if (!materialId) {
        throw new Error('关键帧未返回素材地址，请重试');
      }
      await aiAssetApi.saveSegment({
        id: segment.id,
        ...(position === 'first'
          ? { firstFrameMaterialId: materialId }
          : { lastFrameMaterialId: materialId }),
        modelId: options.videoModelId(),
      });
      if (nextSegmentId) {
        await aiAssetApi.saveSegment({
          id: nextSegmentId,
          firstFrameMaterialId: materialId,
          modelId: options.videoModelId(),
        });
      }
      message.success(position === 'first' ? '首帧已生成' : '尾帧已生成');
      await options.reload();
    } catch (error: any) {
      message.error(error?.message || '生成段落首/尾帧失败');
    } finally {
      loadingKey.value = undefined;
    }
  }

  return { generate, loadingKey, tailHint };
}