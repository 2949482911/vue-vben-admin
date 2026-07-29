<script setup lang="ts" name="SubmitModal">
// 提交批投任务弹窗
import { useVbenModal } from "@vben/common-ui";
import { useVbenForm } from "#/adapter/form";
import { message } from "ant-design-vue";
import { uploadToOss } from "#/utils/uploadToOss";
import { useOssClient } from "#/views/marketing/asset/material/useOssClient";
import { useUserStore } from "@vben/stores";
import { creationTaskApi } from "#/api";
import { ref } from "vue";
import { renderProjectTitle } from "#/utils/customName";

// 传入的子组件数据
const props = defineProps<{
  creationInfo: any,
  adList: Array<any>,
}>();


// result:getCreationTask 获取创编任务执行结果
// result:error 提交异常
const emit = defineEmits(["result:getCreationTask", "result:error"]);

// 提交loading状态
const submitting = ref(false);

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
  closeOnPressEscape: true,
  onCancel() {
    if (submitting.value) return;
    formApi.resetForm();
    modalApi.close();
  },
  async onConfirm() {
    if (submitting.value) return;

    if (props.adList.length === 0) {
      message.error("请先预览广告");
      return;
    }
    const validate = await formApi.validate();
    if (!validate.valid) {
      return;
    }

    submitting.value = true;

    try {
      const values = await formApi.getValues();
      const [creationUrl, tableUrl] = await Promise.all([
        uploadJson(props.creationInfo, "creation"),
        uploadJson(props.adList, "table")
      ]);
      // 提交的参数
      const name = renderProjectTitle(values.name, 0,props.creationInfo.project.projectName || '');
      const platform = props.creationInfo?.platform || '';

      // 智擎版通过 extraParams.taskType=bytedance_std 区分提交接口
      const extraParams: Record<string, any> = {};
      if (platform === 'bytedance_std') {
        extraParams.taskType = 'bytedance_std';
      }

      const submitVals = {
        name:name,
        platform,
        projectId: props.creationInfo?.project.projectId || "",
        version: props.creationInfo?.version,
        ruleType: values.ruleType,
        configArea: creationUrl, //本地数据
        fullParamsData: tableUrl, //上传表格
        extraParams // 附加参数
      };
      // 获取请求结果
      const res = await creationTaskApi.fetchVivoSubmitReview(
        submitVals
      );

      // 结果响应数据
      if (res && res.taskId) {
        message.success(`批投任务已提交成功，任务ID: ${res.taskId}`);
        emit("result:getCreationTask", { taskId: res.taskId, taskName: name });
        modalApi.close();
      } else {
        message.warning("任务已提交，但未获取到任务ID，请检查任务列表");
        emit("result:error", "提交响应缺少taskId");
        modalApi.close();
      }
    } catch (error: any) {
      const errMsg = error?.message || error?.msg || "批投任务提交失败，请稍后重试";
      message.error(errMsg);
      emit("result:error", error);
    } finally {
      submitting.value = false;
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      submitting.value = false;
    }
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
      component: "AdNameGen",
      fieldName: "name",
      label: "任务名字",
      rules: "required",
      defaultValue: "<产品名称>,<日期>",
      componentProps: {
        placeholderTags: [
          '<产品名称>',
          '<日期>',
          '<时间>',
          '<时分秒>',
        ]
      }
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
