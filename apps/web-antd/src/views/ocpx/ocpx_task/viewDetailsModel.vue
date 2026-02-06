<script lang="ts" setup>
import { useVbenDrawer, JsonViewer } from '@vben/common-ui';
import {ocpxTaskApi} from "#/api/core/ocpx";
import { ref } from 'vue';
import type {CallbackInfo, ClickInfo } from './ocpxTask'

const props = defineProps<{
  detailsId: string;
}>();

const callbackDetails = ref<CallbackInfo>()
const clickDetails = ref<ClickInfo>()
const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if(isOpen){
      const res = await ocpxTaskApi.fetchOxpcTransmissionRecord(props.detailsId)
      callbackDetails.value = res.callbackInfo
      clickDetails.value = res.clickInfo
    }
  },
});
</script>
<template>
  <Drawer title="详情信息">
    <div class="detailClass">
      <div class="detTop">
        <h3>回调详情</h3>
        <JsonViewer :value="callbackDetails" />
      </div>
      <div class="line"></div>
      <div class="detBottom">
        <h3>点击详情</h3>
        <JsonViewer :value="clickDetails" />
      </div>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.detailClass{
  height: 100%;

  .detTop{
    height: 50%;
    // background: pink;
  }

  .line{
    margin: 0 0 10px;
    border: 0.5px solid hsl(var(--border));
  }

  .detBottom{
    height: 50%;
    // background: yellow;
  }
}
</style>
