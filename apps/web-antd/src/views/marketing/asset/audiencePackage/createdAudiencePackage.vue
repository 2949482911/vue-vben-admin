<script lang="ts" setup>
import { advertiserApi, targetedPackageApi } from '#/api';
import { useVbenForm, useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { ACTIVE_PLATFORM } from '#/constants/locales';
import type { AdOppoConfig, AdVivoConfig } from './audiencePackageType';
import { trimObject } from '#/utils/trim';
import Vivo_audienceForm from './vivoAudience/vivo_audienceForm.vue';
import Oppo_audienceForm from './oppoAudience/oppo_audienceForm.vue';

const props = defineProps<{
  displayValue?: AdVivoConfig | AdOppoConfig;
}>();

const emit = defineEmits(['pageReload']);
const vivoAudienceRef = ref();
const oppoAudienceRef = ref();
const localAdId = ref<string>();
const platformConfig = ref<string | undefined>();
//传给oppo的广告主，因为oppo的地域需要广告主才能查询
const platformAdId = ref<string | undefined>();

const [titlePackageModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await popUpCancel();
    platformConfig.value = '';
    await modalApi.close();
  },
  async onConfirm() {
    let configData = {};
    if (platformConfig.value === 'vivo') {
      configData = await vivoAudienceRef.value.submitVivoConfig();
    } else if (platformConfig.value === 'oppo') {
      configData = await oppoAudienceRef.value.submitOppoConfig();
    }
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const formValue = await formApi.getValues();
    const formValueAll = {
      id: '',
      localAdvertiserId: localAdId.value,
      name: formValue.name,
      platform: formValue.platform,
      platformAdvertiserId: formValue.platformAdvertiserId,
      remark: formValue.remark,
      config: { ...configData },
    };
    try {
      if (props.displayValue && props.displayValue.id) {
        formValueAll.id = props.displayValue.id;
        const params = trimObject(formValueAll);
        await targetedPackageApi.fetchModifyTargetedPackage(params);
        message.success('修改成功！');
      } else {
        const params = trimObject(formValueAll);
        await targetedPackageApi.fetchNewTargetedPackage(params);
        message.success('添加成功！');
      }
      await popUpCancel();
      await modalApi.close();
      emit('pageReload');
    } catch (err) {
      console.error('保存失败:', err);
    }
  },
  async onOpened() {
    if (props.displayValue && props.displayValue.id) {
      const data = props.displayValue;
      formApi.setValues({
        platform: data.platform,
        name: data.name,
        platformAdvertiserId: data.platformAdvertiserId,
        remark: data.remark,
      });
      localAdId.value = data.localAdvertiserId;
      await loadAdvertiserOptions(data.platform);
      if (platformConfig.value === 'vivo') {
        await vivoAudienceRef.value.echoVivoConfig(data);
      } else if (platformConfig.value === 'oppo') {
        await oppoAudienceRef.value.echoOppoConfig(data);
      }
    } else {
      await popUpCancel();
      platformConfig.value = '';
    }
  },
});

/**弹框取消 */
async function popUpCancel() {
  await formApi.resetForm();
  localAdId.value = '';
  if (platformConfig.value === 'vivo') {
    await vivoAudienceRef.value.popUpVivoCancel();
  } else if (platformConfig.value === 'oppo') {
    await oppoAudienceRef.value.popUpOppoCancel();
  }
}

interface DeveloperOption {
  id: string;
  label: string;
  value: string;
}
const advertiserOption = ref<DeveloperOption[]>([]);
async function loadAdvertiserOptions(platform?: string) {
  platformConfig.value = platform;
  advertiserOption.value = [];
  const res = await advertiserApi.fetchAdvertiserList({
    platform,
    putStatue: 1,
    page: 1,
    pageSize: 100000,
  });

  advertiserOption.value = res.items.map((item) => ({
    id: item.id,
    label: item.advertiserName,
    value: item.advertiserId,
  }));
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        placeholder: '请选择',
        onChange: async (val: string) => {
          await loadAdvertiserOptions(val);
        },
      },
      fieldName: 'platform',
      label: '平台',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        placeholder: '请选择',
        options: advertiserOption,
        onChange: (_val: string, item: DeveloperOption) => {
          platformAdId.value = item.id;
          localAdId.value = item.id;
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
      },
      fieldName: 'platformAdvertiserId',
      label: '广告主名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'name',
      label: '定向包名称',
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '定向包描述',
      rules: computed(() => {
        return platformConfig.value === 'oppo' ? 'required' : '';
      }) as any,
    },
  ],
});
</script>

<template>
  <div>
    <titlePackageModal
      class="w-[40%]"
      :title="props.displayValue?.id ? '修改定向包' : '添加定向包'"
    >
      <Form />
      <Vivo_audienceForm v-if="platformConfig === 'vivo'" ref="vivoAudienceRef" />
      <Oppo_audienceForm
        v-if="platformConfig === 'oppo'"
        ref="oppoAudienceRef"
        :advertiser-id="platformAdId"
      />
    </titlePackageModal>
  </div>
</template>

<style lang="scss" scoped></style>
