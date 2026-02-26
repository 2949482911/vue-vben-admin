<script setup lang="ts">
import { Card, Divider, Button } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import TitlePackageDrawer from './titlePackageDrawer.vue';

const [TitlePackageDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: TitlePackageDrawer,
});

function selectTitle(){
  drawerApi.open()
}
</script>

<template>
  <div>
    <Card class="projectCard">
      <div class="title">标题包</div>
      <Divider type="horizontal" />
      <div class="infoTop">
        <div class="title">分配方式：</div>
        <Button type="primary" danger>清空</Button>
      </div>
      <Card class="infoBody"></Card>
      <Divider type="horizontal" />
      <div class="btnCla">
        <Button type="text" @click="selectTitle()">添加标题</Button>
      </div>
    </Card>
    <TitlePackageDrawerModule/>
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
