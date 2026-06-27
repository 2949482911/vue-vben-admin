<script lang="ts" setup>
import { mainBodyComboApi } from "#/api";
import { useVbenDrawer, useVbenForm } from "@vben/common-ui";
import {
  Button,
  Card,
  Divider,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Table
} from "ant-design-vue";
import { ref } from "vue";
import type { ComboPrivilegeCreateRequest } from "#/api/models/main-body";

const emit = defineEmits(["pageReload"]);

// 权益列表
const privileges = ref<ComboPrivilegeCreateRequest[]>([]);

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

const [comboDrawer, drawerApi] = useVbenDrawer({
  async onCancel() {
    await formApi.resetForm();
    privileges.value = [];
    await drawerApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    const formValue = await formApi.getValues();
    const params = {
      ...formValue,
      days: Number(formValue.days),
      price: Number(formValue.price),
      isDefault: formValue.isDefault || false,
      privileges: privileges.value
    };

    // 获取drawer传递的数据
    const drawerData = drawerApi.getData();

    try {
      if (drawerData && drawerData.id) {
        // @ts-ignore
        await mainBodyComboApi.fetchMainBodyComboUpdate({
          id: drawerData.id,
          ...params
        });
        message.success("修改成功！");
      } else {
        // @ts-ignore
        await mainBodyComboApi.fetchMainBodyComboCreate(params);
        message.success("添加成功！");
      }
      await formApi.resetForm();
      privileges.value = [];
      await drawerApi.close();
      emit("pageReload");
    } catch (err) {
      console.error("保存失败:", err);
    }
  },
  async onOpened() {
    // 获取drawer传递的数据
    const drawerData = drawerApi.getData();

    if (drawerData && drawerData.id) {
      const data = drawerData;
      formApi.setValues({
        name: data.name,
        type: data.type,
        days: data.days,
        price: data.price,
        isDefault: data.isDefault,
        version: data.version
      });
      // 回显权益列表
      if (data.privileges && data.privileges.length > 0) {
        // @ts-ignore
        privileges.value = data.privileges.map(item => ({
          id: item.id || "",
          privilegeCode: item.privilegeCode,
          privilegeName: item.privilegeName,
          quota: item.quota,
          unit: item.unit
        }));
      }
    } else {
      await formApi.resetForm();
      privileges.value = [];
    }
  }
});

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
    }
  ]
});

// 添加权益项
function addPrivilege() {
  privileges.value.push({
    id: "",
    privilegeCode: "",
    privilegeName: "",
    quota: 0,
    unit: "gb"
  });
}

// 删除权益项
function removePrivilege(index: number) {
  privileges.value.splice(index, 1);
}

// 权益代码变更时自动填充权益名称
function handlePrivilegeCodeChange(value: string, index: number) {
  const option = privilegeCodeOptions.find(opt => opt.value === value);
  if (option) {
    // @ts-ignore
    privileges.value[index].privilegeName = option.label;
  }
}

// 权益表格列定义
const privilegeColumns = [
  {
    title: "权益代码",
    dataIndex: "privilegeCode",
    key: "privilegeCode",
    width: 150
  },
  {
    title: "权益名称",
    dataIndex: "privilegeName",
    key: "privilegeName",
    width: 150
  },
  {
    title: "配额",
    dataIndex: "quota",
    key: "quota",
    width: 100
  },
  {
    title: "单位",
    dataIndex: "unit",
    key: "unit",
    width: 80
  },
  {
    title: "操作",
    key: "action",
    width: 80
  }
];
</script>

<template>
  <div>
    <comboDrawer
      :title="drawerApi.getData()?.id ? '修改套餐' : '添加套餐'"
    >
      <Form />

      <Divider>权益配置</Divider>

      <Card size="small">
        <div class="mb-3">
          <Button type="primary" size="small" @click="addPrivilege">
            添加权益
          </Button>
        </div>

        <Table
          :columns="privilegeColumns"
          :data-source="privileges"
          :pagination="false"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'privilegeCode'">
              <Select
                v-model:value="record.privilegeCode"
                :options="privilegeCodeOptions"
                size="small"
                style="width: 100%"
                @change="(val: string) => handlePrivilegeCodeChange(val, index)"
              />
            </template>
            <template v-if="column.key === 'privilegeName'">
              {{ record.privilegeName }}
            </template>
            <template v-if="column.key === 'quota'">
              <InputNumber
                v-model:value="record.quota"
                :min="0"
                size="small"
                style="width: 100%"
              />
            </template>
            <template v-if="column.key === 'unit'">
              <Select
                v-model:value="record.unit"
                :options="unitOptions"
                size="small"
                style="width: 100%"
              />
            </template>
            <template v-if="column.key === 'action'">
              <Popconfirm
                title="确定删除该权益吗？"
                @confirm="removePrivilege(index)"
              >
                <Button type="link" danger size="small">删除</Button>
              </Popconfirm>
            </template>
          </template>
        </Table>
      </Card>
    </comboDrawer>
  </div>
</template>

<style lang="scss" scoped></style>
