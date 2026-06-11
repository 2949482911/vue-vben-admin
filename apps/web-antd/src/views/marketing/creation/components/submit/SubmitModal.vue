<script setup lang="ts" name="SubmitModal">
// 提交批投任务弹窗
import { useVbenModal } from "@vben/common-ui";
import { useVbenForm } from "#/adapter/form";
import { message } from "ant-design-vue";
import { uploadToOss } from "#/utils/uploadToOss";
import { useOssClient } from "#/views/marketing/asset/material/useOssClient";
import { useUserStore } from "@vben/stores";
import { creationTaskApi } from "#/api";


// 传入的子组件数据
const props = defineProps<{
  creationInfo: any,
  adList: Array<any>,
}>();


// result:getCreationTask 获取创编任务执行结果
const emit = defineEmits(["result:getCreationTask"]);


// // 上传json
const uploadJson = async (data: any, subName: string) => {
  const client = await useOssClient();
  const timestamp = Date.now();
  const userStore = useUserStore();
  const mainId = userStore.userInfo?.mainId;

  // 深拷贝一份数据，避免修改原始响应对象
  const cloneData = JSON.parse(
    JSON.stringify(data, (_, value) => {
      // 关键逻辑：如果遇到 Map 类型，将其转换为普通对象
      if (value instanceof Map) {
        return Object.fromEntries(value.entries());
      }
      return value;
    })
  );

  const jsonString = JSON.stringify(cloneData, null, 2);
  const fileName = `${timestamp}_${subName}.json`;
  const objectKey = `${mainId}/json/batchInvestment/${fileName}`;
  const file = new File([jsonString], fileName, { type: "application/json" });

  const result = await uploadToOss(client, file, objectKey);
  return result.url; // 返回 OSS 路径
};


//  modal
const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  onCancel() {
    formApi.resetForm();
    modalApi.close();
  },
  async onConfirm() {
    if (props.adList.length < 0) {
      message.error("请先预览广告");
      return;
    }
    const validate = await formApi.validate();
    if (!validate.valid) {
      return;
    }
    const values = await formApi.getValues();
    const [creationUrl, tableUrl] = await Promise.all([
      uploadJson(props.creationInfo, "creation"),
      uploadJson(props.adList, "table")
    ]);
    // 提交的参数
    const submitVals = {
      name: values.name,
      platform: props.creationInfo?.platform || "",
      projectId: props.creationInfo?.project.projectId || "",
      version: props.creationInfo?.version,
      ruleType: values.ruleType,
      configArea: creationUrl, //本地数据
      fullParamsData: tableUrl, //上传表格
      extraParams: props.creationInfo.configData.promotionType || {} // 附加参数
    };
    // 获取请求结果
    const res = await creationTaskApi.fetchVivoSubmitReview(
      submitVals
    );

    // 结果响应数据
    if (res.taskId) {
      emit("result:getCreationTask", res.taskId);
    }
    // 上茶
    modalApi.close();
  }
});

// formApi
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      allowClear: true
    },
    labelWidth: 70
  },
  // layout: "inline",
  schema: [
    {
      component: "Input",
      fieldName: "name",
      label: "任务名字",
      rules: "required"
    },

    {
      component: "Select",
      fieldName: "ruleType",
      componentProps: {
        options: [
          {
            "label": "立即提交",
            "value": "immediately"
          },
          {
            "label": "定时提交",
            "value": "timer"
          }
        ]
      },
      defaultValue: "immediately",
      label: "提交规则"
    }
  ]
});

</script>

<template>
  <div>
    <Modal>
      <Form>

      </Form>
    </Modal>
  </div>
</template>

<style scoped lang="scss">

</style>
