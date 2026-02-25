<script setup lang="ts">
import { Card, Button, TypographyText, Divider } from "ant-design-vue"; 
import GenerateTable from "./generateTable.vue"

</script>

<template>
  <div>
    <div class="sum">
      <div style="margin: 0 20px 0 0;">项目总数：<span class="numColor">1</span></div>
      <div style="margin: 0 20px 0 0;">广告总数：<span class="numColor">2</span></div>
      <Button type="primary">提交审核</Button>
    </div>
    <Card>
      <div style="display: flex;align-items: center;">
        <div class="accountInfo">
          <div class="id-wrapper title-link">
            <TypographyText content="妙滋滋-甜甜微小-每付啦啦啦阿联每付啦啦啦阿联" 
                  :ellipsis="{ tooltip: true }" 
                />
          </div>
          <div class="id-wrapper">
            ID：<TypographyText  content="123456789012345678901234567890" 
                  :ellipsis="{ tooltip: true }" 
                />
          </div>
        </div>
        <Divider type="vertical" style="height: 60px;"/>
      </div>
    </Card>
    <div class="sum" style="margin: 20px 0 0;">
      <div style="margin: 0 20px 0 0;">在投广告配额：<span class="numColor">0 / 40</span></div>
      <div style="margin: 0 20px 0 0;">项目数：<span class="numColor">1</span></div>
      <div style="margin: 0 20px 0 0;">广告数：<span class="numColor">1</span></div>
      <Button type="primary" danger>批量删除</Button>
    </div>
    <GenerateTable></GenerateTable>
  </div>
</template>

<style scoped lang="scss">
.sum {
  display: flex;
  align-items: center;
  margin: 0 0 20px;

  .numColor { color: #006be6; }
}

.accountInfo {
  width: 15%;
  padding: 10px;
  margin: 0 20px 0 0;
  border: 1px solid #006be6;
  border-radius: 4px;

  .id-wrapper {
    display: flex;
    align-items: center; // 垂直居中
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;   /* 整个行鼠标浮上都显示小手指 */

    .label {
      flex-shrink: 0;  /* 确保 "ID：" 文字不被压缩 */
      color: #666;
    }
    
    // 穿透修改 Typography 的样式，确保它在 Flex 布局中正确缩放
    :deep(.ant-typography) {
      flex: 1;
      width: 0; 
      margin-bottom: 0;
      color: inherit; /* 继承父级的颜色 */
      cursor: pointer; /* 确保文字上也是小手指 */
    }
  }

  .title-link {
    margin-bottom: 4px; 
    font-weight: 500;
    color: #006be6;

    &:hover {
      opacity: 0.8; /* 悬浮时稍微变淡，增加交互感 */
    }
  }
}
</style>
