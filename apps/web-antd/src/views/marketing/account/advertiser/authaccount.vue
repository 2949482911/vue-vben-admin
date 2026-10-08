<script setup lang="ts" name="AuthAccount">
import { onMounted, ref } from "vue";

import { useVbenModal } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { Alert } from "ant-design-vue";

import { useVbenForm } from "#/adapter/form";
import { advertiserApi, developerApi } from "#/api/core";
import { Platform } from "#/constants/enums";
import { AUTH_ACCOUNT_PLATFORM } from "#/constants/locales";

interface DeveloperOption {
  label: string;
  value: string;
}

/** 腾讯授权账号类型（account_type），后端原样拼进授权地址，默认 QQ */
const TENCENT_ACCOUNT_TYPE = {
  WECHAT: "ACCOUNT_TYPE_WECHAT",
  QQ: "ACCOUNT_TYPE_QQ"
};

const TENCENT_ACCOUNT_TYPE_OPTIONS = [
  {
    "label": `${$t("marketing.advertiser.accountTypeOptions.qq")}`,
    "value": TENCENT_ACCOUNT_TYPE.QQ
  },
  {
    "label": `${$t("marketing.advertiser.accountTypeOptions.wechat")}`,
    "value": TENCENT_ACCOUNT_TYPE.WECHAT
  }
];

/**
 * 腾讯实名认证令牌(user_token)授权的 subType 标识。
 * 后端拿到非空的 subType 时走腾讯 userToken 授权地址（ad.qq.com 账号中心），
 * 同时要求 advertiserId 指向腾讯 bm / unit / mdm 账户。
 */
const TENCENT_USER_TOKEN_SUBTYPE = "user_token";


/**
 * userToken 授权模式：从账户列表「更多 → userToken 授权」进入时带上被授权的账户，
 * 为 null 表示普通的账户授权
 */
const userTokenAuth = ref<null | { advertiserId: string }>(null);


const aGenerationOption = ref<DeveloperOption[]>([]);


/** 默认平台为华为商店，然后拿到一代主体的下拉事件 */
async function aGenerationOptions(platform: string) {
  aGenerationOption.value = [];

  if (!platform) return;

  const res = await developerApi.fetchDeveloperList({
    platform,
    page: 1,
    pageSize: 200
  });

  aGenerationOption.value = res.items.map((item) => ({
    label: item.name,
    value: item.id
  }));
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: "w-full"
    }
  },
  layout: "horizontal",
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: "Select",
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t("common.input")}`,
        options: AUTH_ACCOUNT_PLATFORM,
        onSelect: async (value: string) => {
          const formVal = await formApi.getValues();
          await handlerAuthUrl(value, "", formVal.accountType);
          await aGenerationOptions(value);
        }
      },
      // 字段名
      fieldName: "platform",
      defaultValue: Platform.VIVO,
      // userToken 授权固定走腾讯，且不需要用户选平台/开发者，直接隐藏
      dependencies: {
        show: () => !userTokenAuth.value,
        triggerFields: ["platform"]
      },
      // 界面显示的label
      label: `${$t("ocpx.platform.title")}`,
      rules: "required"
    },

    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.select")}`,
        options: TENCENT_ACCOUNT_TYPE_OPTIONS,
        onSelect: async (accountType: string) => {
          const formVal = await formApi.getValues();
          await handlerAuthUrl(
            formVal.platform,
            formVal.developerId,
            accountType
          );
        }
      },
      fieldName: "accountType",
      defaultValue: TENCENT_ACCOUNT_TYPE.QQ,
      // 界面显示的label
      label: `${$t("marketing.advertiser.accountType")}`,
      // 只有腾讯区分 QQ / 微信登录账号，其他媒体不展示；userToken 授权用不到
      dependencies: {
        show: value => {
          return value.platform === Platform.TENCENT && !userTokenAuth.value;
        },
        triggerFields: ["platform"]
      }
    },

    {
      component: "Select",
      componentProps: {
        placeholder: `${$t("common.select")}`,
        showSearch: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: aGenerationOption,
        onSelect: async (developerId: string) => {
          const formVal = await formApi.getValues();
          await handlerAuthUrl(
            formVal.platform,
            developerId,
            formVal.accountType
          );
        }
      },
      fieldName: "developerId",
      // userToken 授权不需要选一代主体，后端按平台取默认开发者
      dependencies: {
        show: () => !userTokenAuth.value,
        triggerFields: ["platform"]
      },
      // 界面显示的label
      label: `${$t("marketing.developer.title")}`
    },

    {
      component: "RadioGroup",
      defaultValue: 1,
      componentProps: {
        options: [
          {
            "label": "自主授权",
            "value": 1
          },
          {
            "label": "邀请他人授权",
            "value": 2
          }
        ]
      },
      fieldName: "field1",
      rules: "required",
      label: `${$t("marketing.advertiser.authType")}`
    },
    {
      component: "Textarea",
      componentProps: {
        readonly: true,
        rows: 12,
        disabled: true
      },
      fieldName: "authUrl",
      label: `${$t("marketing.advertiser.authUrl")}`,
      dependencies: {
        show: value => {
          return value.field1 === 2;
        },
        triggerFields: ["field1"]
      }
    }
  ]
});


/**
 * 获取授权url
 * @param platform
 * @param developerId
 * @param accountType 授权账号类型，仅腾讯需要（QQ / 微信）
 */
async function handlerAuthUrl(platform: string, developerId?: string, accountType?: string) {
  const url = await advertiserApi.fetchAuthUrl({
    platform,
    // userToken 授权不需要选开发者，走后端按平台取默认开发者
    developerId: userTokenAuth.value ? undefined : developerId,
    // 非腾讯媒体不需要该参数，带上会污染请求；userToken 授权也不看登录账号类型
    accountType:
      platform === Platform.TENCENT && !userTokenAuth.value
        ? accountType
        : undefined,
    // userToken 授权：带上 subType 与被授权账户，普通账户授权不带这两个参数
    subType: userTokenAuth.value ? TENCENT_USER_TOKEN_SUBTYPE : undefined,
    advertiserId: userTokenAuth.value?.advertiserId
  });
  await formApi.setFieldValue("authUrl", url);
}


onMounted(() => {
  handlerAuthUrl(Platform.VIVO);
});


const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
  },

  async onConfirm() {
    const authUrl = await formApi.getValues();
    if (authUrl.field1 === 1) {
      window.open(authUrl.authUrl, "_blank");
    }
    await modalApi.close();
  },

  async onOpenChange(isOpen: boolean) {
    if (!isOpen) return;
    // 从账户列表「更多 → userToken 授权」进入时带 subType + 被授权账户，固定走腾讯
    const data = modalApi.getData() as
      | undefined
      | { advertiserId?: string; subType?: string };
    userTokenAuth.value = data?.subType
      ? { advertiserId: data.advertiserId ?? "" }
      : null;

    const platform = userTokenAuth.value ? Platform.TENCENT : Platform.VIVO;
    await formApi.setFieldValue("platform", platform);
    // userToken 模式下开发者下拉已隐藏，不需要拉取列表
    if (!userTokenAuth.value) {
      await aGenerationOptions(platform);
    }
    await handlerAuthUrl(platform);
  }
});


</script>

<template>
  <Modal>
    <Form />

    <Alert type="warning" message="授权链接生成后，将于15分钟后失效，请尽快使用" />
  </Modal>
</template>

<style scoped>

</style>
