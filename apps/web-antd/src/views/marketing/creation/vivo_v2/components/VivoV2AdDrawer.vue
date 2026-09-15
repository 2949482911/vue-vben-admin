<script setup lang="ts" name="VivoV2AdDrawer">
import type {
  VivoV2AdData,
  VivoV2AdTitle,
  VivoV2AdVideo,
} from '#/views/marketing/creation/vivo_v2/vivo_v2';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Input, Select } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { VIVO_V2_STORE_FIRST_OPTIONS } from '#/views/marketing/creation/vivo_v2/enums';
import { defaultVivoV2ConfigData } from '#/views/marketing/creation/vivo_v2/vivo_v2';

/**
 * formFields 广告表单字段配置（由 VivoV2Ad 按接口文档分组下发）
 */
const { formFields } = defineProps({
  formFields: {
    type: Array as () => any[],
    default: () => [],
  },
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    labelClass: 'w-[200px]',
    componentProps: {
      class: 'w-[300px]',
    },
  },
});

/** 广告默认值：保证平铺回显时每个字段都有值 */
const defaultAd = defaultVivoV2ConfigData().ad;

/** 标题列表（动态增减行，确认时回写到 ad.titleList） */
const titleList = ref<VivoV2AdTitle[]>([]);

/** 视频素材列表（动态增减行，确认时回写到 ad.videoList） */
const videoList = ref<VivoV2AdVideo[]>([]);

function createTitle(): VivoV2AdTitle {
  return { title: '', isStoreFirst: 0 };
}

function createVideo(): VivoV2AdVideo {
  return { videoCode: '', previewImgCode: '' };
}

function addTitle() {
  titleList.value.push(createTitle());
}

function removeTitle(index: number) {
  titleList.value.splice(index, 1);
}

function addVideo() {
  videoList.value.push(createVideo());
}

function removeVideo(index: number) {
  videoList.value.splice(index, 1);
}

/**
 * 广告数据（接口嵌套结构）-> 表单平铺值
 */
function toFormValues(ad?: Partial<VivoV2AdData>) {
  const data: VivoV2AdData = {
    ...defaultAd,
    ...ad,
    landingPage: {
      ...defaultAd.landingPage,
      ...ad?.landingPage,
    },
  };

  const { landingPage } = data;

  return {
    name: data.name,
    promotionContent: data.promotionContent,
    creativeSupplyType: data.creativeSupplyType,
    avatarCode: data.avatarCode,
    pageUrl: landingPage.pageUrl,
    h5Type: landingPage.h5Type,
    h5Code: landingPage.h5Code,
    deepLink: data.deepLink,
    viewMonitorUrl: data.viewMonitorUrl,
    clickMonitorUrl: data.clickMonitorUrl,
    wakeupMonitorUrl: data.wakeupMonitorUrl,
    imgsCodeList: data.imgsCodeList,
  };
}

/**
 * 表单平铺值 -> 广告数据（还原接口的嵌套结构）
 */
function toAdData(values: Record<string, any>): Partial<VivoV2AdData> {
  return {
    name: values.name ?? '',
    promotionContent: values.promotionContent ?? '',
    avatarCode: values.avatarCode ?? '',
    landingPage: {
      pageUrl: values.pageUrl ?? '',
      h5Code: values.h5Code ?? '',
      h5Type: values.h5Type ?? null,
    },
    deepLink: values.deepLink ?? '',
    viewMonitorUrl: values.viewMonitorUrl ?? '',
    clickMonitorUrl: values.clickMonitorUrl ?? '',
    wakeupMonitorUrl: values.wakeupMonitorUrl ?? '',
    creativeSupplyType: values.creativeSupplyType ?? 0,
    // 过滤掉未填写标题 / 视频代码的空行
    titleList: titleList.value.filter((item) => Boolean(item.title)).map((item) => ({ ...item })),
    imgsCodeList: values.imgsCodeList ?? [],
    videoList: videoList.value
      .filter((item) => Boolean(item.videoCode))
      .map((item) => ({ ...item })),
  };
}

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[40vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const ad = drawerApi.getData() as Partial<VivoV2AdData> | undefined;
      formApi.setState({
        schema: formFields,
      });

      // 回显表单数据（嵌套结构平铺后写入）
      await formApi.setValues(toFormValues(ad));

      // 回显标题、视频列表，无数据时给出一个空行方便填写
      const titles: VivoV2AdTitle[] = ad?.titleList || [];
      titleList.value =
        titles.length > 0 ? titles.map((item) => ({ ...item })) : [createTitle()];

      const videos: VivoV2AdVideo[] = ad?.videoList || [];
      videoList.value =
        videos.length > 0 ? videos.map((item) => ({ ...item })) : [createVideo()];
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    drawerApi.setData({
      adData: toAdData(currentValues),
      _isConfirmed: true,
    });
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    titleList.value = [];
    videoList.value = [];
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    titleList.value = [];
    videoList.value = [];
    drawerApi.close();
  },
});
</script>

<template>
  <div>
    <Drawer title="编辑广告信息">
      <Form>
        <!-- 标题列表：动态增减行，确认时回写到 titleList -->
        <template #titleList>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in titleList"
              :key="index"
              class="flex items-center gap-2"
            >
              <Input v-model:value="item.title" placeholder="标题" />
              <Select
                v-model:value="item.isStoreFirst"
                :options="VIVO_V2_STORE_FIRST_OPTIONS"
                placeholder="是否商店优先"
              />
              <Button danger type="link" @click="removeTitle(index)">删除</Button>
            </div>
            <Button type="dashed" @click="addTitle">添加标题</Button>
          </div>
        </template>

        <!-- 视频素材：动态增减行，确认时回写到 videoList -->
        <template #videoList>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in videoList"
              :key="index"
              class="flex items-center gap-2"
            >
              <Input
                v-model:value="item.videoCode"
                placeholder="视频code（待接素材查询接口）"
              />
              <Input
                v-model:value="item.previewImgCode"
                placeholder="预览图code（待接素材查询接口）"
              />
              <Button danger type="link" @click="removeVideo(index)">删除</Button>
            </div>
            <Button type="dashed" @click="addVideo">添加视频</Button>
          </div>
        </template>
      </Form>
    </Drawer>
  </div>
</template>
