<script setup lang="ts">
import { Card, Divider, Button } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import CreativeMaterialsDrawer from './creativeMaterialsDrawer.vue';

const [CreativeMaterialsDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: CreativeMaterialsDrawer,
});

function selectCreative(){
  drawerApi.open()
}
</script>

<template>
  <div>
    <Card class="projectCard">
      <div class="title">广告创意素材组</div>
      <Divider type="horizontal" />
      <div class="infoTop">
        <div class="title">分配方式：</div>
        <Button type="primary" danger>清空</Button>
      </div>
      <Card class="infoBody"></Card>
      <Divider type="horizontal" />
      <div class="btnCla">
        <Button type="text" @click="selectCreative()">编辑</Button>
      </div>
    </Card>
    <CreativeMaterialsDrawerModule/>
  </div>
</template>

<style scoped lang="scss">
.projectCard{
  .title{
    font-size: 14px;
    font-weight: 600;
  }

  .infoTop{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .infoBody{
    height: 500px;
    margin: 10px 0 0;
  }

  .btnCla{
    display: flex;
    justify-content: center;
    // align-items: center;
    width: 100%;
  }
}
</style>
