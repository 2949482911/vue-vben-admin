<script lang="ts" setup name="UpdateMediaItemStock">
import {useVbenModal} from '@vben/common-ui';
import {ref} from "vue"
import type {MediaStockChangeRequest, UpdateStock} from "#/api/models";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import {$t} from "@vben/locales";
import {InputNumber, Select} from 'ant-design-vue'
import {itemApi} from "#/api/media";

defineOptions({
  name: 'UpdateMediaItemStock',
});


const typeOptions = [
  {
    value: 1,
    label: `${$t("action.add")}`,
  },
  {
    value: 2,
    label: `${$t("action.less")}`,
  },
];


// item
const updatePlatformItem = ref<MediaStockChangeRequest>([]);

function updateSkuStock(row: UpdateStock, index: number) {
  updatePlatformItem.value.updateItem[index - 1] = row;
}

// sku update stock list
const gridOptions: VxeGridProps<UpdateStock> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {
      field: "platformSkuId",
      title: `${$t("media.media_item.kuaishou.sku_columns.platformSkuId")}`,
      width: "auto"
    },
    {
      field: "skuNick",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuNick")}`,
      width: "auto"
    },
    {
      field: "type",
      title: `${$t("action.type")}`,
      width: "auto",
      slots: {
        default: 'type'
      }
    },
    {
      field: "stock",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuStock")}`,
      width: "auto",
      slots: {
        default: 'stock'
      }
    },
  ],
  pagerConfig: {
    enabled: false
  },
  editConfig: {
    mode: 'cell',
    trigger: 'click',
  },
  data: [],
  sortConfig: {
    multiple: true
  },
  pagerConfig: {
    enabled: false,
  },
  rowConfig: {
    keyField: 'platformSkuId',
  },
  proxyConfig: {
    loading: false,
    enabled: false,
    autoLoad: false
  }
};

const [Grid, gridApi] = useVbenVxeGrid({gridOptions});

// update stock of platform goods
async function handlerUpdateSkuStock() {
  await itemApi.fetchStockAdd(updatePlatformItem.value)
}


const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  class: 'w-[600px]',
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    // verify table field
    await handlerUpdateSkuStock()
    await modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      updatePlatformItem.value = modalApi.getData<Record<string, any>>();
      gridApi.setGridOptions({
        data: updatePlatformItem.value.updateItem
      })
    }
  },
});

</script>
<template>
  <Modal>
    <Grid>
      <template #type="{ row, seq }">
        <Select style="width: 120px" v-model:value="updatePlatformItem.updateItem[seq-1].type" :options="typeOptions"></Select>
      </template>
      <template #stock="{ row, seq }">
        <InputNumber v-model:value="updatePlatformItem.updateItem[seq-1].stock"></InputNumber>
      </template>
    </Grid>
  </Modal>
</template>
