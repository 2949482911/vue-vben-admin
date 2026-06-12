<script setup lang="ts" name="TencentAudienceForm">
import { useVbenForm } from "@vben/common-ui";
import { Gender } from "#/views/marketing/asset/audiencePackage/tencent/tencentTagData";

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
      component: "Select",
      fieldName: "gender",
      componentProps: {
        options: Gender
      },
      label: "用户性别",
      defaultValue: []
    }
  ]
});
</script>

<template>
  <div>
    <Form>

    </Form>
  </div>
</template>

<style scoped lang="scss">

</style>
