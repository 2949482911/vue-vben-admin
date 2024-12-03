<script lang="ts" setup name="CreateProcess">
import {ref} from 'vue';
import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import type {CreateRoleRequest} from "#/api/models";
import WorkflowBpmnModeler from 'workflow-bpmn-modeler';

const refNode =ref(null)

const emit = defineEmits(['pageReload']);

const notice = ref<CreateRoleRequest>({});
const isUpdate = ref<Boolean>(false);

const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    isUpdate.value = false;
  },
  async onConfirm() {
    await formApi.submitForm();
    isUpdate.value = false;
    emit("pageReload");
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      notice.value = modalApi.getData<Record<string, any>>();
      if (notice.value.id) {
        isUpdate.value = true;
        handleSetFormValue(notice.value);
      } else {
        isUpdate.value = false;
      }
    }
  },
});


function handleSetFormValue(row) {
  formApi.setValues(row);
}

const xml = ref<string>(`
  <?xml version="1.0" encoding="UTF-8"?>
    <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:flowable="http://flowable.org/bpmn" targetNamespace="http://www.flowable.org/processdef">
      <process id="process_${1}" name="name_${1}">
        <startEvent id="startNode1" name="开始" />
      </process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_flow">
        <bpmndi:BPMNPlane id="BPMNPlane_flow" bpmnElement="T-2d89e7a3-ba79-4abd-9f64-ea59621c258c">
          <bpmndi:BPMNShape id="BPMNShape_startNode1" bpmnElement="startNode1" bioc:stroke="">
            <omgdc:Bounds x="240" y="200" width="30" height="30" />
            <bpmndi:BPMNLabel>
              <omgdc:Bounds x="242" y="237" width="23" height="14" />
            </bpmndi:BPMNLabel>
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </definitions>
`)

function getModelDetail() {

}

function save() {

}
const categorys = [
  { name: "Music", id: "7" },
  { name: "Articles", id: "8" },
]
const groups = [
  { name: "Folk Music", id: "4" },
  { name: "Rock Music", id: "5" },
  { name: "Classical Music", id: "6" },
]
const users = [
  { name: "The Beatles", id: "1" },
  { name: "The Rolling Stones", id: "2" },
  { name: "Pink Floyed", id: "3" },
]


const title: string = notice.value
  ? `${$t('common.edit')}`
  : `${$t('common.create')}`;
</script>
<template>
  <Modal :title="title">
    <WorkflowBpmnModeler
      ref="refNode"
      :xml="xml"
      :users="users"
      :groups="groups"
      :categorys="categorys"
      @save="save"
    ></WorkflowBpmnModeler>
  </Modal>
</template>
