<script setup lang="ts">
import {
  Space,
  Button
} from "ant-design-vue"
import LogicFlow from "@logicflow/core";
defineOptions({
  name:"Control",
})

function download(filename: string, text: string) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

const prop = defineProps({
  lf: LogicFlow
})


// 下载图片
function downloadImage() {
  prop.lf.getSnapshot()
}

// 下载xml文件
function downloadXml() {
  const data = prop.lf.getGraphData()
  download("logic-flow.xml", data);
}

</script>

<template>
<div class="data-panel">
  <Space >
    <Button @click="downloadImage">下载图片</Button>
    <Button @click="downloadXml">下载xml</Button>
    <Button >查看数据</Button>
  </Space>
</div>
</template>

<style scoped>
.data-panel {
  position: absolute;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  text-align: center;
  z-index: 101;
}
</style>
