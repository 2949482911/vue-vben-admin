<script setup lang="ts" name="ImportChildAdvertiser">
// 导入子账户
import {useVbenModal} from '@vben/common-ui';
import {Page} from '@vben/common-ui';
import {ref} from 'vue';
import {advertiserApi} from "#/api/core";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import type {AccountChildResponse} from "#/api/models";
import {$t} from "@vben/locales";

const emit = defineEmits(['pageReload']);
const objectRequest = ref<{ id: string; }>({id: '',})

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    gridApi.setGridOptions({data: []});
    objectRequest.value = {id: ''};
    await modalApi.close();
  },
  async onConfirm() {
    const checkedRecords = gridApi.grid.getCheckboxRecords();
    const advertiserIds: string[] = checkedRecords.map((item) => item.advertiserId);
    await advertiserApi.fetchImportChild({id: objectRequest.value.id, advertiserIds})
    gridApi.setGridOptions({data: []});
    objectRequest.value = {id: ''};
    emit('pageReload');
    await modalApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      objectRequest.value = modalApi.getData<{ id: string; }>();
      gridApi.setLoading(true);
      const advertiserList: AccountChildResponse[] = await advertiserApi.fetchAccountChild(objectRequest.value.id)
      gridApi.setGridOptions({data: advertiserList});
      gridApi.setLoading(false);
    }
  },
});


const gridOptions: VxeGridProps<AccountChildResponse> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'advertiserId',
    range: true,
    checkMethod(params: {
      row: AccountChildResponse
    }): boolean {
      return !params.row.exist;
    }
  },
  toolbarConfig: {},
  columns: [
    {title: '序号', type: 'checkbox', fixed: 'left', width: 'auto',},

    {
      field: 'advertiserId',
      title: `${$t('marketing.advertiser.columns.advertiserId')}`,
      width: 'auto',
    },

    {
      field: 'advertiserName',
      title: `${$t('marketing.advertiser.columns.advertiserName')}`,
      width: 'auto',
    },

  ],
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    autoLoad: false,
  },
};


const [Grid, gridApi] = useVbenVxeGrid({gridOptions});


</script>

<template>
  <Page>
    <Modal>
      <Grid></Grid>
    </Modal>
  </Page>
</template>

<style scoped>

</style>


