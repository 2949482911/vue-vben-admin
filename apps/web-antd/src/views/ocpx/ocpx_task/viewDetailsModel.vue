<script lang="ts" setup>
import { useVbenDrawer, JsonViewer } from '@vben/common-ui';
import {ocpxTaskApi} from "#/api/core/ocpx";
import { ref } from 'vue';
import type {CallbackInfo, ClickInfo } from './ocpxTask'
import type {OcpxBehavioracallbackRecordItem} from "#/api/models";

const props = defineProps<{
  detailsId: string;
}>();

function colseEvent(){
  callbackDetails.value = null
  clickDetails.value = null
  drawerApi.close()
}

const callbackDetails = ref<CallbackInfo | null>()
const clickDetails = ref<ClickInfo | null>()
const [Drawer, drawerApi] = useVbenDrawer({
  zIndex: 2000, 
  // 2. 明确开启 ESC 监听
  closeOnPressEscape: true,
  destroyOnClose: true,
  async onOpenChange(isOpen) {
    if(isOpen){
      const data = await drawerApi.getData<OcpxBehavioracallbackRecordItem>()
      const { taskId, platformCallbackId, behaviorPlatformId, requestId } = data
      const res = await ocpxTaskApi.fetchOxpcTransmissionRecord({
        taskId,
        platformCallbackId,
        behaviorPlatformId,
        requestId
      })
      callbackDetails.value = res.callbackInfo
      clickDetails.value = res.clickInfo
    }else{
      colseEvent()
    }
  },
  async onConfirm() {
    colseEvent()
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
