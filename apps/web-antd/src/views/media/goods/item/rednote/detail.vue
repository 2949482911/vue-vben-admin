<script setup lang="ts" name="RedNoteItemDetail">
import {ref} from 'vue';
import {$t} from "@vben/locales";
import {useVbenModal} from '@vben/common-ui';
import type {MediaItemDetailRequest} from "#/api/models";
import {Card, Descriptions, Divider, Spin, Tag, Image} from "ant-design-vue";
import {itemApi} from "#/api/media";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import type {RedNoteItemDetailResponse, RedNoteItemSku} from "#/api/models/media/rednote/item";
import {dateFormat} from "#/utils";
import {ConstantTypeEnum} from "@vben/constants";


const itemDetail = ref<RedNoteItemDetailResponse>();
const title: string = `${$t('action.info')}`;
const itemDetailRequest = ref<MediaItemDetailRequest>({});
const spinning = ref<Boolean>(false);


const gridOptions: VxeGridProps<RedNoteItemSku> = {
  border: true,
  columns: [
    {
      field: "sku_id",
      title: `${$t("media.media_item.rednote.sku_columns.skuId")}`,
      width: "auto",
    },
    {
      field: "name",
      title: `${$t("media.media_item.rednote.sku_columns.name")}`,
      width: "auto",
    },
    {
      field: "itemId",
      title: `${$t("media.media_item.rednote.sku_columns.itemId")}`,
      width: "auto",
    },

    {
      field: "ipq",
      title: `${$t("media.media_item.rednote.sku_columns.ipq")}`,
      width: "auto",
    },


    {
      field: "originalPrice",
      title: `${$t("media.media_item.rednote.sku_columns.originalPrice")}`,
      width: "auto",
    },

    {
      field: "price",
      title: `${$t("media.media_item.rednote.sku_columns.price")}`,
      width: "auto",
    },

    {
      field: "stock",
      title: `${$t("media.media_item.rednote.sku_columns.stock")}`,
      width: "auto",
    },

    {
      field: "logisticsPlanId",
      title: `${$t("media.media_item.rednote.sku_columns.logisticsPlanId")}`,
      width: "auto",
    },

    {
      field: "whcode",
      title: `${$t("media.media_item.rednote.sku_columns.whcode")}`,
      width: "auto",
    },

    {
      field: "priceType",
      title: `${$t("media.media_item.rednote.sku_columns.priceType")}`,
      width: "auto",
      slots: {default: 'priceType'}
    },

    {
      field: "erpCode",
      title: `${$t("media.media_item.rednote.sku_columns.erpCode")}`,
      width: "auto",
    },

    {
      field: "deliveryTime",
      title: `${$t("media.media_item.rednote.sku_columns.deliveryTime")}`,
      width: "auto",
    },

    {
      field: "specImage",
      title: `${$t("media.media_item.rednote.sku_columns.specImage")}`,
      width: "auto",
    },

    {
      field: "barcode",
      title: `${$t("media.media_item.rednote.sku_columns.barcode")}`,
      width: "auto",
    },

    {
      field: "logisticsName",
      title: `${$t("media.media_item.rednote.sku_columns.logisticsName")}`,
      width: "auto",
    },


    {
      field: "buyable",
      title: `${$t("media.media_item.rednote.sku_columns.buyable")}`,
      width: "auto",
      slots: {default: 'buyable'}

    },

    {
      field: "createTime",
      title: `${$t("media.media_item.rednote.sku_columns.createTime")}`,
      width: "auto",
    },

    {
      field: "updateTime",
      title: `${$t("media.media_item.rednote.sku_columns.updateTime")}`,
      width: "auto",
    },

    {
      field: "isGift",
      title: `${$t("media.media_item.rednote.sku_columns.isGift")}`,
      width: "auto",
      slots: {default: 'isGift'}
    },

    {
      field: "deliveryFlag",
      title: `${$t("media.media_item.rednote.sku_columns.deliveryFlag")}`,
      width: "auto",
      slots: {default: 'deliveryFlag'}
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
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.itemId')">
              {{ itemDetail?.item?.itemId }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.name')">
              {{ itemDetail?.item?.name }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.itemShortTitle')">
              {{ itemDetail?.item?.itemShortTitle }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.ename')">
              {{ itemDetail?.item?.ename }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.brandId')">
              {{ itemDetail?.item?.brandId }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.categoryId')">
              {{ itemDetail?.item?.categoryId }}
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.shippingTemplateId')">
              {{ itemDetail?.item?.shippingTemplateId }}
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.shippingGrossWeight')">
              {{ itemDetail?.item?.shippingGrossWeight }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.variantIds')">
              {{ itemDetail?.item?.variantIds }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.articleNo')">
              {{ itemDetail?.item?.articleNo }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.description')">
              {{ itemDetail?.item?.description }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.faq')">
              {{ itemDetail?.item?.faq }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.isChannel')">
              <Tag color="green" v-if="itemDetail?.item?.isChannel === ConstantTypeEnum.COMMON_ONE">{{ $t('common.yes') }}<</Tag>
              <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.deliveryMode')">
              {{ itemDetail?.item?.deliveryMode }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.freeReturn')">
              {{ itemDetail?.item?.freeReturn }}
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.enableMultiWarehouse')">
              <Tag color="green" v-if="itemDetail?.item?.enableMultiWarehouse">{{ $t('common.yes') }}<</Tag>
              <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.createTime')">
              {{ dateFormat(itemDetail?.item?.createTime) }}
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.updateTime')">
              {{ dateFormat(itemDetail?.item?.updateTime) }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.enableMainSpecImage')">
              <Tag color="green" v-if="itemDetail?.item?.enableMainSpecImage">{{ $t('common.yes') }}<</Tag>
              <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.mainSpecId')">
              {{ itemDetail?.item?.mainSpecId }}
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.enableStepPresale')">
              <Tag color=green v-if="itemDetail?.item?.enableStepPresale">{{ $t('common.yes') }}</Tag>
              <Tag v-else color="red">{{ $t('common.no') }}</Tag>
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.enableMainSpecImage')">
              <Tag color="green" v-if="itemDetail?.item?.enableMainSpecImage">{{ $t('common.yes') }}</Tag>
              <Tag v-else color="red">{{ $t('common.no') }}</Tag>
            </Descriptions.Item>
          </Descriptions>

          <Descriptions title="图片">

            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.sizeTableImage')">
              <Image :src="itemDetail?.item?.sizeTableImage" :whight="100" :height="100"></Image>
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.images')">
              <Image v-for="item in itemDetail?.item?.images" :src="item" :whight="100" :height="100"></Image>
            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.videoUrl')">
              {{ itemDetail?.item?.videoUrl }}
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.imageDescriptions')">
              <Image :src="itemDetail?.item?.imageDescriptions" :whight="100" :height="100"></Image>
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.transparentImage')">
              <Image :src="itemDetail?.item?.transparentImage" :whight="100" :height="100"></Image>

            </Descriptions.Item>
            <Descriptions.Item :label="$t('media.media_item.rednote.item_columns.sizeTableImage')">
              <Image :src="itemDetail?.item?.sizeTableImage" :whight="100" :height="100"></Image>
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.recommendSizeTableImage')">
              <Image :src="itemDetail?.item?.recommendSizeTableImage" :whight="100" :height="100"></Image>
            </Descriptions.Item>
            <Descriptions.Item
              :label="$t('media.media_item.rednote.item_columns.modelTryOnSizeTableImage')">
              <Image :src="itemDetail?.item?.modelTryOnSizeTableImage" :whight="100" :height="100"></Image>
            </Descriptions.Item>
          </Descriptions>
        </Spin>
      </Card>
      <Divider/>

      <Card title="sku列表" :bordered="false">
        <Grid>
            <template #buyable="row">
              <Tag color="green" v-if="row.buyable">{{ $t('common.yes') }}</Tag>
              <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
            </template>

          <template #isGift="row">
              <Tag color="green" v-if="row.isGift">{{ $t('common.yes') }}</Tag>
              <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
          </template>

          <template #priceType="row">
            <Tag color="green" v-if="row.priceType === ConstantTypeEnum.COMMON_ONE">{{ $t('common.yes') }}</Tag>
            <Tag color="red" v-else>{{ $t('common.no') }}</Tag>
          </template>

          <template #deliveryFlag="row">
            <Tag color="green" v-if="row.deliveryFlag === ConstantTypeEnum.COMMON_ONE">现货</Tag>
            <Tag color="blue" v-if="row.deliveryFlag === ConstantTypeEnum.COMMON_TWO">预售</Tag>
            <Tag color="red" v-else>未知</Tag>
          </template>

        </Grid>
      </Card>
    </Modal>
  </div>
</template>

<style scoped>

</style>
