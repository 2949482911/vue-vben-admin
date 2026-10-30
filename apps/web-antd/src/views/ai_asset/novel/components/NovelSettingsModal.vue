<script lang="ts" setup name="NovelSettingsModal">
/**
 * 小说设置弹窗：当前仅承载预设画面比例（默认 9:16）。
 * 上游是创作台头部「小说设置」，保存后写回 novel.aspectRatio；
 * 分镜页的临时覆盖不经过这里，避免把单次选择误存为全书默认。
 */
import { Modal, Select } from 'ant-design-vue';

import { ASPECT_RATIO_OPTIONS } from '../useNovelLifecycle';

defineProps<{ saving?: boolean }>();
const emit = defineEmits<{ save: [] }>();
const open = defineModel<boolean>('open', { default: false });
const aspectRatio = defineModel<string>('aspectRatio', { default: '9:16' });
</script>

<template>
  <Modal
    v-model:open="open"
    :confirm-loading="saving"
    ok-text="保存"
    title="小说设置"
    @ok="emit('save')"
  >
    <div class="novel-settings">
      <label>
        <span>预设画面比例</span>
        <Select
          v-model:value="aspectRatio"
          :options="ASPECT_RATIO_OPTIONS"
          style="width: 180px"
        />
      </label>
      <p class="novel-settings__tip">
        关键帧、镜头与成片默认使用该比例；分镜页可临时切换，单次选择不会写回这里。
      </p>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.novel-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
  }
}

.novel-settings__tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}
</style>
