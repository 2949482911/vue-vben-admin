<script lang="ts" setup name="EpisodeDrawer">
/**
 * 资产 — 分集 新增/编辑（useVbenDrawer + useVbenForm）
 *
 * 「归属小说」为必选：抽屉打开时拉 novel/list 填充下拉，外部也可用 setData({ novelId }) 预置。
 */
import type { EpisodeItem, NovelItem } from '#/api/models/ai_asset';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { aiAssetApi } from '#/api';

import { PICKER_PAGE_SIZE } from '../../../constants';

const emit = defineEmits(['success']);

const isUpdate = ref(false);
const novels = ref<NovelItem[]>([]);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleSubmit: async (values: Record<string, any>) => {
    await aiAssetApi.saveEpisode({
      id: values.id || undefined,
      novelId: values.novelId,
      script: values.script || undefined,
      seq: values.seq,
      title: values.title,
    });
    await drawerApi.close();
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      dependencies: { show: false, triggerFields: ['*'] },
      fieldName: 'id',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '可选，未选择则先作为独立分集',
      },
      fieldName: 'novelId',
      label: '归属小说',
    },
    {
      component: 'InputNumber',
      componentProps: { class: 'w-full', min: 1 },
      fieldName: 'seq',
      label: '集数',
    },
    {
      component: 'Input',
      componentProps: { placeholder: '如 开篇：痛点引入' },
      fieldName: 'title',
      label: '标题',
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: '分集剧本 / 分镜文本（可选）', rows: 4 },
      fieldName: 'script',
      label: '剧本 / 分镜',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

async function loadNovels() {
  try {
    // 下拉需要全量引用，用大页长一次取回
    const res = await aiAssetApi.fetchNovelList({
      page: 1,
      pageSize: PICKER_PAGE_SIZE,
    });
    novels.value = res?.items ?? [];
  } catch {
    novels.value = [];
  }
  await formApi.updateSchema([
    {
      componentProps: {
        options: novels.value.map((novel) => ({
          label: novel.name ?? `小说 #${novel.id}`,
          value: novel.id,
        })),
      },
      fieldName: 'novelId',
    },
  ]);
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    emit('success');
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    formApi.resetForm();
    await loadNovels();
    const data = drawerApi.getData() as {
      nextSeq?: number;
      novelId?: number | string;
      row?: EpisodeItem;
    };
    if (data?.row?.id) {
      isUpdate.value = true;
      formApi.setValues({
        ...data.row,
        novelId: data.row.novelId ?? data.novelId,
      });
    } else {
      isUpdate.value = false;
      formApi.setValues({ novelId: data?.novelId, seq: data?.nextSeq ?? 1 });
    }
  },
});

const title = computed(() => (isUpdate.value ? '编辑分集' : '新增分集'));
</script>

<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
