<script lang="ts" setup>
import { mainBodyComboApi } from "#/api";
import type {
  ComboPrivilegeCreateRequest,
  MainBodyComboCreateRequest,
  MainBodyComboPageItem
} from "#/api/models/main-body";
import { useVbenDrawer, useVbenForm } from "@vben/common-ui";
import { message } from "ant-design-vue";

const emit = defineEmits(["pageReload"]);

// 权益单位选项
const unitOptions = [
  { label: "GB", value: "gb" },
  { label: "次", value: "count" },
  { label: "个", value: "unit" }
];

// 权益代码选项（示例）
const privilegeCodeOptions = [
  { label: "存储空间", value: "storage" },
  { label: "API调用次数", value: "api_calls" },
  { label: "用户数量", value: "users" },
  { label: "项目数量", value: "projects" },
  { label: "报表导出次数", value: "report_export" }
];

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: "w-full"
    }
  },
  layout: "horizontal",
  schema: [
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: "请输入套餐名称"
      },
      fieldName: "name",
      label: "套餐名称",
      rules: "required"
    },
    {
      component: "Select",
      componentProps: {
        allowClear: true,
        placeholder: "请选择套餐类型",
        options: [
          { label: "试用套餐", value: "trial" },
          { label: "标准套餐", value: "standard" },
          { label: "高级套餐", value: "premium" },
          { label: "企业套餐", value: "enterprise" }
        ]
      },
      fieldName: "type",
      label: "套餐类型",
      rules: "required"
    },
    {
      component: "InputNumber",
      componentProps: {
        min: 1,
        placeholder: "请输入有效天数"
      },
      fieldName: "days",
      label: "有效天数",
      rules: "required"
    },
    {
      component: "InputNumber",
      componentProps: {
        min: 0,
        precision: 2,
        placeholder: "请输入价格"
      },
      fieldName: "price",
      label: "价格",
      rules: "required"
    },
    {
      component: "Switch",
      fieldName: "isDefault",
      formItemClass: "w-[150px]",
      label: "是否默认",
      defaultValue: false,
      componentProps: {
        checked: false
      }
    },
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: "请输入版本号"
      },
      fieldName: "version",
      label: "版本"
    },
    {
      type: "array",
      fieldName: "privileges",
      label: "权益配置",
      hideLabel: true,
      defaultValue: [],
      arrayProps: {
        addButtonText: "添加权益",
        createRow: () => ({
          id: "",
          privilegeCode: undefined,
          privilegeName: "",
          quota: 0,
          unit: "gb"
        }),
        showIndex: true
      },
      children: [
        {
          component: "Select",
          fieldName: "privilegeCode",
          label: "权益代码",
          componentProps: ({ rowPath }) => ({
            allowClear: true,
            options: privilegeCodeOptions,
            placeholder: "请选择权益代码",
            onChange: (value: string) => {
              const option = privilegeCodeOptions.find(
                (opt) => opt.value === value
              );
              formApi.setFieldValue(
                `${rowPath}.privilegeName`,
                option?.label ?? ""
              );
            }
          })
        },
        {
          component: "Input",
          fieldName: "privilegeName",
          label: "权益名称",
          componentProps: {
            disabled: true,
            placeholder: "选择权益代码后自动填充"
          }
        },
        {
          component: "InputNumber",
          fieldName: "quota",
          label: "配额",
          componentProps: {
            min: 0,
            placeholder: "请输入配额"
          }
        },
        {
          component: "Select",
          fieldName: "unit",
          label: "单位",
          componentProps: {
            allowClear: true,
            options: unitOptions,
            placeholder: "请选择单位"
          }
        }
      ]
    }
  ]
});

const [comboDrawer, drawerApi] = useVbenDrawer({
  closeOnPressEscape: true,
  async onCancel() {
    await drawerApi.close();
  },
  class:"w-[75%]",
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const formValue = await formApi.getValues();
    const drawerData = getDrawerData();

    const privileges: ComboPrivilegeCreateRequest[] = (
      formValue.privileges ?? []
    ).map((item: any) => ({
      id: item.id ?? "",
      privilegeCode: item.privilegeCode,
      privilegeName:
        item.privilegeName ||
        privilegeCodeOptions.find((opt) => opt.value === item.privilegeCode)
          ?.label ||
        "",
      quota: Number(item.quota ?? 0),
      unit: item.unit
    }));

    const params: MainBodyComboCreateRequest = {
      name: formValue.name,
      type: formValue.type,
      days: Number(formValue.days),
      price: Number(formValue.price),
      isDefault: formValue.isDefault || false,
      version: formValue.version,
      privileges
    };

    try {
      if (drawerData?.id) {
        await mainBodyComboApi.fetchMainBodyComboUpdate({
          id: drawerData.id,
          ...params
        });
        message.success("修改成功！");
      } else {
        await mainBodyComboApi.fetchMainBodyComboCreate(params);
        message.success("添加成功！");
      }
      await drawerApi.close();
      emit("pageReload");
    } catch (err) {
      console.error("保存失败:", err);
    }
  },
  async onClosed() {
    await formApi.resetForm();
  },
  async onOpened() {
    const drawerData = getDrawerData();

    if (drawerData?.id) {
      await formApi.setValues({
        name: drawerData.name,
        type: drawerData.type,
        days: drawerData.days,
        price: drawerData.price,
        isDefault: drawerData.isDefault,
        version: drawerData.version,
        privileges: (drawerData.privileges ?? []).map((item) => ({
          id: item.id ?? "",
          privilegeCode: item.privilegeCode,
          privilegeName: item.privilegeName,
          quota: item.quota,
          unit: item.unit
        }))
      });
    } else {
      await formApi.resetForm();
    }
  }
});

function getDrawerData(): MainBodyComboPageItem | undefined {
  return drawerApi.getData() as MainBodyComboPageItem | undefined;
}
</script>

<template>
  <comboDrawer :title="getDrawerData()?.id ? '修改套餐' : '添加套餐'">
    <Form />
  </comboDrawer>
</template>

<style lang="scss" scoped></style>
