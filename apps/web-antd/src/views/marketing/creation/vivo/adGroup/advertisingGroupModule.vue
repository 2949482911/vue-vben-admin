<script setup lang="ts">
import { Card, Divider, Button } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import AdGroupDrawer from './adGroupDrawer.vue';

const [AdGroupDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: AdGroupDrawer,
});

function newAdGroup(){
  drawerApi.open()
}
</script>

<template>
  <div>
    <Card class="projectCard">
      <div class="title">广告组</div>
      <Divider type="horizontal" />
      <div class="infoTop">
        <div class="title">基本信息：</div>
        <Button type="primary" @click="newAdGroup()">新增</Button>
      </div>
      <Card class="adInfoBody"></Card>
      <div class="infoTop" style="margin: 10px 0 0;">
        <div class="title">定向包：</div>
        <Button type="primary" danger>清空</Button>
      </div>
      <Card class="targetedInfoBody"></Card>
      <Divider type="horizontal" />
      <div class="btnCla">
        <Button type="text">添加定向包</Button>
      </div>
    </Card>
    <AdGroupDrawerModule/>
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

  .adInfoBody{
    height: 223px;
    margin: 10px 0 0;
  }

  .targetedInfoBody{
    height: 223px;
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
