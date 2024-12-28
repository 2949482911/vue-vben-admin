<script setup lang="ts">
import {onMounted} from 'vue'
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import BpmnColorPickerModule from 'bpmn-js-color-picker';
import customTranslate from "#/views/bpm/process/translation";
import camundaModuleDescriptor from 'camunda-bpmn-moddle/resources/camunda'

defineOptions({
  name: "ProcessDesign"
})

const customTranslateModule = {
  translate: ['value', customTranslate]
}


onMounted(() => {
  // the diagram you are going to display
  const bpmnXML: string = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="diagram_Process_1706756685602" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd"><bpmn2:process id="Process_1706756685602" name="业务流程_1706756685602" isExecutable="true"><bpmn2:startEvent id="Event_1smj9ot"><bpmn2:outgoing>Flow_0jdcl54</bpmn2:outgoing></bpmn2:startEvent><bpmn2:intermediateThrowEvent id="Event_0jfhfba"><bpmn2:incoming>Flow_0jdcl54</bpmn2:incoming><bpmn2:outgoing>Flow_1ol0ntk</bpmn2:outgoing></bpmn2:intermediateThrowEvent><bpmn2:sequenceFlow id="Flow_0jdcl54" sourceRef="Event_1smj9ot" targetRef="Event_0jfhfba" /><bpmn2:endEvent id="Event_0a5hgl0"><bpmn2:incoming>Flow_1ol0ntk</bpmn2:incoming></bpmn2:endEvent><bpmn2:sequenceFlow id="Flow_1ol0ntk" sourceRef="Event_0jfhfba" targetRef="Event_0a5hgl0" /></bpmn2:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1706756685602"><bpmndi:BPMNEdge id="Flow_0jdcl54_di" bpmnElement="Flow_0jdcl54"><di:waypoint x="448" y="180" /><di:waypoint x="572" y="180" /></bpmndi:BPMNEdge><bpmndi:BPMNEdge id="Flow_1ol0ntk_di" bpmnElement="Flow_1ol0ntk"><di:waypoint x="608" y="180" /><di:waypoint x="732" y="180" /></bpmndi:BPMNEdge><bpmndi:BPMNShape id="Event_1smj9ot_di" bpmnElement="Event_1smj9ot"><dc:Bounds x="412" y="162" width="36" height="36" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="Event_0jfhfba_di" bpmnElement="Event_0jfhfba"><dc:Bounds x="572" y="162" width="36" height="36" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="Event_0a5hgl0_di" bpmnElement="Event_0a5hgl0"><dc:Bounds x="732" y="162" width="36" height="36" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn2:definitions>
`
  const modeler = new BpmnModeler({
    container: '#container',
    propertiesPanel: {
      parent: '#js-properties-panel'
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      BpmnColorPickerModule,
      customTranslateModule
    ],
    moddleExtensions: {
      camunda: camundaModuleDescriptor,
    },
  });
  modeler.importXML(bpmnXML)
})

</script>

<template>
  <div class="containerBox" style="position: relative;">
    <div id="container" style="width: 75%; height: 70vh"></div>
    <div id="js-properties-panel" class="panel"></div>
  </div>
</template>

<style lang="less">
// 左边工具栏以及编辑节点的样式
@import 'bpmn-js/dist/assets/diagram-js.css';
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
@import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
@import "bpmn-js-color-picker/colors/color-picker.css";
// 颜色
@import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
// 线条
// bpmn-js-properties-panel相关
@import url('https://unpkg.com/@bpmn-io/properties-panel/dist/assets/properties-panel.css');

.containerBox {
  height: calc(100vh - 100px);
  margin-top: 30px;
}

.containerBox #container {
  height: calc(100vh - 100px);
  border: 1px solid rgb(121, 121, 121);
}

.bpp-properties-panel [type=text] {
  box-sizing: border-box;
}

.panel {
  width: 400px;
  position: absolute;
  top: 1px;
  right: 1px;
  height: 100%;
  overflow: auto;
}

/* 右下角logo */
.bjs-powered-by {
  display: none;
}
</style>
