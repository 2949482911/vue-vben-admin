<script setup lang="ts">
import { Button } from 'ant-design-vue';
import { ref } from 'vue';
import { useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { Input } from 'ant-design-vue';

//媒体账户选择弹框
const [Modal, modalApi] = useVbenModal({
  contentClass:'modalStyle',
  async onConfirm(){
    modalApi.close()
  }
});

function ruleConfigurationEvent(){
  modalApi.open()
}

const value1 = ref()


</script>

<template>
  <div style="display: flex;align-items: center;">
    <div style="margin: 0 10px 0 0;font-size: 14px;">广告：<span style="color: #006be6;">指定项目4</span></div>
    <Button type="primary" @click="ruleConfigurationEvent()">规则配置</Button>
  </div>
  <Modal class="w-[400px]" title="规则配置">
    <div class="projectNumber">
      <div>每个账户指定项目数：</div>
      <Input v-model:value="value1" style="width: 120px"></Input>
    </div>
    <div class="projectNumber" style="margin: 10px 0 0;">
      <div>每个项目指定广告数：</div>
      <Input v-model:value="value1" style="width: 120px"></Input>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.projectNumber{
  display: flex;
  align-items: center;

  :global(.z-popup .modalStyle) {
    min-height: 50px !important;
  }
}

</style>
