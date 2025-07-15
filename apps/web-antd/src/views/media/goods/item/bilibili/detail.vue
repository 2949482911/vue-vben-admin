<script setup lang="ts" name="BilibiliItemDetail">
import {h, ref} from 'vue';
import {$t} from "@vben/locales";
import {useVbenModal} from '@vben/common-ui';
import type {
  BilibiliItemDetailResponse,
  BilibiliItemSku,
  MediaItemDetailRequest
} from "#/api/models";
import {Card, Descriptions, Divider, Spin, Tag} from "ant-design-vue";
import {itemApi} from "#/api/media";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import {ConstantTypeEnum} from "@vben/constants";


const itemDetail = ref<BilibiliItemDetailResponse>();
const title: string = `${$t('action.info')}`;

function presellType(presell_type: number) {
  let color: string;
  let label: string;
  switch (presell_type) {
    case ConstantTypeEnum.COMMON_ZERO: {
      color = "red";
      label = '现货发货';
      break;
    }
    case ConstantTypeEnum.COMMON_ONE: {
      color = "blue";
      label = '预售发货';
      break;
    }
  }
  return h(Tag, {color: color}, () => label);
}

function status(status: number) {
  let color: string;
  let label: string;
  switch (status) {
    case ConstantTypeEnum.COMMON_ZERO: {
      color = "red";
      label = '待上架';
      break;
    }
    case ConstantTypeEnum.COMMON_ONE: {
      color = "blue";
      label = '已上架';
      break;
    }
    case ConstantTypeEnum.COMMON_TWO: {
      color = "green";
      label = '已下架';
      break;
    }
  }
  return h(Tag, {color: color}, () => label);
}

function recyclingStatus(recycling_status: number) {
  let color: string;
  let label: string;
  switch (recycling_status) {
    case ConstantTypeEnum.COMMON_ZERO: {
      color = "blue";
      label = '未删除';
      break;
    }
    case ConstantTypeEnum.COMMON_ONE: {
      color = "red";
      label = '已删除';
      break;
    }
  }
  return h(Tag, {color: color}, () => label);
}


const itemDetailRequest = ref<MediaItemDetailRequest>({});

const spinning = ref<Boolean>(false);

const gridOptions: VxeGridProps<BilibiliItemSku> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {
      field: "sku_id",
      title: `${$t("media.media_item.bilibili.sku_columns.sku_id")}`,
    },
    {
      field: "code",
      title: `${$t("media.media_item.bilibili.sku_columns.code")}`,
    },
    {
      field: "stock_num",
      title: `${$t("media.media_item.bilibili.sku_columns.stock_num")}`,
    },
    {
      field: "price",
      title: `${$t("media.media_item.bilibili.sku_columns.price")}`,
    },
  ],
  height: 'auto',
  data: [],
  sortConfig: {
    multiple: true
  },
  pagerConfig: {
    enabled: false,
  },
  scrollY: {
    enabled: true,
    gt: 0,
  },
  proxyConfig: {
    enabled: false,
    autoLoad: false
  },
  showOverflow: true,
};
const [Grid, gridApi] = useVbenVxeGrid({gridOptions});


const [Modal, modalApi] = useVbenModal({
  fullscreen: true,
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
    init();
  },
  onConfirm() {
    modalApi.close();
    init();
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      spinning.value = true
      itemDetailRequest.value = modalApi.getData<Record<string, any>>();
      await getItemDetail()
    }
  },
});

function init() {
  itemDetail.value = {};
  spinning.value = false;
}


/**
 * get  item detail
 */

async function getItemDetail() {
  gridApi.setLoading(true)
  itemDetail.value = await itemApi.fetchItemDetail(itemDetailRequest.value);
  gridApi.setGridOptions({data: itemDetail.value.skus})
  gridApi.setLoading(false)
  spinning.value = false
}

</script>

<template>
  <div>
    <Modal :title="title">
      <Card :title="`${$t('action.basis')}`" :bordered="false">
        <Spin :spinning="spinning" tip="loading...">
          <Descriptions title="基础信息">

            <Descriptions.Item :label="$t('media.media_item.bilibili.item_columns.product_id')">
              {{ itemDetail?.item?.product_id }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.bilibili.item_columns.name')">
              {{ itemDetail?.item?.name }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.media_item.bilibili.item_columns.text_description')">
              {{ itemDetail?.item?.text_description }}
            </Descriptions.Item>


            <Descriptions.Item :label="$t('media.media_item.bilibili.item_columns.freight_id')">
              {{ itemDetail?.item?.freight_id }}
            </Descriptions.Item>


            <Descriptions.Item
              :label="$t('media.media_item.bilibili.item_columns.delivery_delay_day')">
              {{ itemDetail?.item?.delivery_delay_day }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.bilibili.item_columns.presell_type')">
              <component :is="presellType(itemDetail?.item?.presell_type)"></component>
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.media_item.bilibili.item_columns.limit_per_buyer')">
              {{ itemDetail?.item?.limit_per_buyer }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.bilibili.item_columns.status')">
              <component :is="status(itemDetail?.item?.status)"></component>
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.media_item.bilibili.item_columns.recycling_status')">
              <component :is="recyclingStatus(itemDetail?.item?.recycling_status)"></component>
            </Descriptions.Item>

          </Descriptions>
        </Spin>

      </Card>
      <Divider/>

      <Card title="sku列表" :bordered="false">
        <Grid>

        </Grid>
      </Card>
    </Modal>
  </div>
</template>

<style scoped>

</style>
