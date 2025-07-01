<script setup lang="ts" name="KuaiShouItemDetail">
import {h, ref} from 'vue';
import type {
  KuaishouItemDetailResponse,
  KuaishouItemSku,
  MediaItemDetailRequest,
  MediaStockChangeRequest
} from "#/api/models";
import {$t} from "@vben/locales";
import {categoryApi, itemApi} from "#/api/media";
import {Button, Card, Divider, Spin, Descriptions, Tag, Switch} from "ant-design-vue";
import {useVbenModal} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";
import {useVbenForm} from "#/adapter/form";
import {PlatformEnum} from "#/constants/locales";

// update stock modal
import UpdateMediaItemStock from '../update-stock.vue'
import {ConstantTypeEnum} from "@vben/constants";

const [UpdateMediaItemStockFormModal, formUpdateMediaItemStockModalApi] = useVbenModal({
  connectedComponent: UpdateMediaItemStock,
  centered: true,
  class: 'w-12',
});

// update stock of platform goods
function openFormUpdateMediaItemStockModalApi(rows: KuaishouItemSku[]) {
  const updatePlatformItem: MediaStockChangeRequest = {
    platform: PlatformEnum.KUAISHOU,
    updateItem: rows.map(x => {
      return {
        platformSkuId: x.platformSkuId,
        localAccountId: x.localAccountId,
        platformItemId: x.platformItemId,
        skuNick: x.skuNick,
        type: 1,
        stock: 0,
      }
    })
  }
  formUpdateMediaItemStockModalApi.setData(updatePlatformItem);
  formUpdateMediaItemStockModalApi.open();
}

const title: string = `${$t('action.info')}`;

const itemDetailRequest = ref<MediaItemDetailRequest>({});
const itemDetail = ref<KuaishouItemDetailResponse>();

function auditStatus(auditStatus: number) {
  let color: string;
  let label: string;
  switch (auditStatus) {
    case ConstantTypeEnum.COMMON_ZERO:
      color = "red";
      label = '待审核';
      break;
    case ConstantTypeEnum.COMMON_ONE:
      color = "blue";
      label = '审核待修改';
      break;
    case ConstantTypeEnum.COMMON_TWO:
      color = "green";
      label = '审核通过';
      break;
    case ConstantTypeEnum.COMMON_THREE:
      color = "red";
      label = '审核拒绝';
      break;
  }
  return h(Tag, {color: color}, () => label);
}


function onOfflineStatus(onOfflineStatus: number) {
  let color: string;
  let label: string;
  switch (onOfflineStatus) {
    case ConstantTypeEnum.COMMON_ZERO:
      color = "red";
      label = '已下架';
      break;
    case ConstantTypeEnum.COMMON_ONE:
      color = "green";
      label = '已上架';
      break;
  }
  return h(Tag, {color: color}, () => label);
}

// item form
const spinning = ref<Boolean>(false);
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    colon: true,
    disabled: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Divider',
      fieldName: 'basis',
      formItemClass: 'col-span-3',
      hideLabel: true,
      renderComponentContent: () => {
        return {
          default: () => h('div', `${$t('action.basis')}`),
        };
      },
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'platformItemId',
      label: `${$t('media.media_item.kuaishou.item_columns.platformItemId')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'relItemId',
      label: `${$t('media.media_item.kuaishou.item_columns.relItemId')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'ApiTreeSelect',
      // 对应组件的参数
      componentProps: {
        api: async () => {
          const {items} = await categoryApi.fetchCategoryList({
            page: 1,
            pageSize: 1000,
            platform: PlatformEnum.KUAISHOU,
          });
          return items;
        },
        childrenField: 'children',
        // 菜单接口转options格式
        labelField: 'platformCategoryName',
        valueField: 'platformCategoryId',
      },
      // 字段名
      fieldName: 'platformCategoryId',
      label: `${$t('media.media_item.kuaishou.item_columns.platformCategoryId')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'title',
      label: `${$t('media.media_item.kuaishou.item_columns.title')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'shortTitle',
      label: `${$t('media.media_item.kuaishou.item_columns.shortTitle')}`
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: ' ',
      },
      // 字段名
      fieldName: 'sellingPoint',
      label: `${$t('media.media_item.kuaishou.item_columns.sellingPoint')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'details',
      label: `${$t('media.media_item.kuaishou.item_columns.details')}`
    },

    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'platformCreatedTime',
      label: `${$t('media.media_item.kuaishou.item_columns.platformCreatedTime')}`
    },
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'platformUpdateTime',
      label: `${$t('media.media_item.kuaishou.item_columns.platformUpdateTime')}`
    },

    {
      component: 'Divider',
      fieldName: 'audit_info',
      formItemClass: 'col-span-3',
      hideLabel: true,
      renderComponentContent: () => {
        return {
          default: () => h('div', `${$t('action.audit_info')}`),
        };
      },
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        options: [
          {
            label: '待审核',
            value: 0
          },
          {
            label: '审核待修改',
            value: 1
          },
          {
            label: '审核通过',
            value: 2
          },
          {
            label: '审核拒绝',
            value: 3
          }
        ]
      },
      // 字段名
      fieldName: 'auditStatus',
      label: `${$t('media.media_item.kuaishou.item_columns.auditStatus')}`
    },

    {
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'auditReason',
      label: `${$t('media.media_item.kuaishou.item_columns.auditReason')}`
    },

    {
      component: 'Divider',
      fieldName: 'other',
      formItemClass: 'col-span-3',
      hideLabel: true,
      renderComponentContent: () => {
        return {
          default: () => h('div', `${$t('action.other')}`),
        };
      },
    },

    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'onOfflineStatus',
      label: `${$t('media.media_item.kuaishou.item_columns.onOfflineStatus')}`
    },
    {
      component: 'Switch',
      // 对应组件的参数
      componentProps: {
        class: 'w-auto',
      },
      // 字段名
      fieldName: 'purchaseLimit',
      label: `${$t('media.media_item.kuaishou.item_columns.purchaseLimit')}`
    },
    {
      component: 'InputNumber',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'limitCount',
      label: `${$t('media.media_item.kuaishou.item_columns.limitCount')}`,
      dependencies: {
        show: (val) => {
          return val.purchaseLimit;
        }
      }
    },
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'timeOfSale',
      label: `${$t('media.media_item.kuaishou.item_columns.timeOfSale')}`,
    },
    {
      component: "Textarea",
      fieldName: "itemRemark",
      label: `${$t('media.media_item.kuaishou.item_columns.itemRemark')}`,
    }
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

function handleSetFormValue(row) {
  formApi.setValues(row);
}

// sku table
const gridOptions: VxeGridProps<KuaishouItemSku> = {
  border: true,
  columns: [
    {title: "序号", type: "seq", width: 50, type: "checkbox", width: 100},
    {
      field: "platformSkuId",
      title: `${$t("media.media_item.kuaishou.sku_columns.platformSkuId")}`,
      width: "auto"
    },
    {
      field: "relSkuId",
      title: `${$t("media.media_item.kuaishou.sku_columns.relSkuId")}`,
      width: "auto"
    },
    {
      field: "skuStock",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuStock")}`,
      width: "auto"
    },
    {
      field: "reserveStock",
      title: `${$t("media.media_item.kuaishou.sku_columns.reserveStock")}`,
      width: "auto"
    },
    {
      field: "skuSalePrice",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuSalePrice")}`,
      width: "auto"
    },
    {
      field: "volume",
      title: `${$t("media.media_item.kuaishou.sku_columns.volume")}`,
      width: "auto"
    },
    {
      field: "isValid",
      title: `${$t("media.media_item.kuaishou.sku_columns.isValid")}`,
      width: "auto"
    },
    {
      field: "specification",
      title: `${$t("media.media_item.kuaishou.sku_columns.specification")}`,
      width: "auto"
    },
    {
      field: "skuNick",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuNick")}`,
      width: "auto"
    },
    {
      field: "skuMarketPrice",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuMarketPrice")}`,
      width: "auto"
    },
    {
      field: "goodsId",
      title: `${$t("media.media_item.kuaishou.sku_columns.goodsId")}`,
      width: "auto"
    },
    {
      field: "goodsCode",
      title: `${$t("media.media_item.kuaishou.sku_columns.goodsCode")}`,
      width: "auto"
    },
    {
      field: "gtinCode",
      title: `${$t("media.media_item.kuaishou.sku_columns.gtinCode")}`,
      width: "auto"
    },
    {
      field: "packageCode",
      title: `${$t("media.media_item.kuaishou.sku_columns.packageCode")}`,
      width: "auto"
    },
    {
      field: "mealDetail",
      title: `${$t("media.media_item.kuaishou.sku_columns.mealDetail")}`,
      width: "auto"
    },
    {
      field: "skuProps",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuProps")}`,
      width: "auto"
    },
    {
      field: "skuCertificate",
      title: `${$t("media.media_item.kuaishou.sku_columns.skuCertificate")}`,
      width: "auto"
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: {default: 'action'},
      width: 256,
    },
  ],
  pagerConfig: {
    enabled: false
  },
  data: [],
  sortConfig: {
    multiple: true
  },
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    enabled: true,
    autoLoad: false
  }
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


/**
 * get  item detail
 */
async function getItemDetail() {
  gridApi.setLoading(true)
  itemDetail.value = await itemApi.fetchItemDetail(itemDetailRequest.value);
  // handleSetFormValue(itemDetail.value.item)
  gridApi.setGridOptions({data: itemDetail.value.skus})
  gridApi.setLoading(false)
  spinning.value = false
}


function init() {
  itemDetail.value = {};
  spinning.value = false;
}

</script>

<template>
  <div>
    <Modal :title="title">
      <Card :title="`${$t('action.basis')}`" :bordered="false">
        <Spin :spinning="spinning" tip="loading...">
          <Descriptions title="基础信息">
            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.platformItemId')">
              {{ itemDetail?.item?.platformItemId }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.relItemId')">
              {{ itemDetail?.item?.relItemId }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.title')">
              {{ itemDetail?.item?.title }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.shortTitle')">
              {{ itemDetail?.item?.shortTitle }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.sellingPoint')">
              {{ itemDetail?.item?.sellingPoint }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.details')">
              {{ itemDetail?.item?.details }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.auditStatus')">
              <component :is="auditStatus(itemDetail?.item?.auditStatus)"></component>
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.auditReason')">
              {{ itemDetail?.item?.auditReason }}
            </Descriptions.Item>

            <Descriptions.Item
              :label="$t('media.media_item.kuaishou.item_columns.onOfflineStatus')">
              <component :is="onOfflineStatus(itemDetail?.item?.onOfflineStatus)"></component>
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.purchaseLimit')">
              <Switch :v-model="itemDetail?.item?.purchaseLimit"></Switch>
            </Descriptions.Item>

            <Descriptions.Item v-if="itemDetail?.item?.purchaseLimit"
                               :label="$t('media.media_item.kuaishou.item_columns.purchaseLimit')">
              {{ itemDetail?.item?.limitCount }}
            </Descriptions.Item>


          </Descriptions>

          <Divider/>

          <Descriptions>
            <Descriptions.Item
              :label="$t('media.media_item.kuaishou.item_columns.platformCreatedTime')">
              {{ itemDetail?.item?.platformCreatedTime }}
            </Descriptions.Item>


            <Descriptions.Item
              :label="$t('media.media_item.kuaishou.item_columns.platformUpdateTime')">
              {{ itemDetail?.item?.platformUpdateTime }}
            </Descriptions.Item>

            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.timeOfSale')">
              {{ itemDetail?.item?.timeOfSale }}
            </Descriptions.Item>

          </Descriptions>

          <Divider/>

          <Descriptions>
            <Descriptions.Item :label="$t('media.media_item.kuaishou.item_columns.itemRemark')">
              {{ itemDetail?.item?.itemRemark }}
            </Descriptions.Item>

          </Descriptions>
        </Spin>

      </Card>
      <Divider/>
      <Card title="sku列表" :bordered="false">
        <Grid>
          <template #action="{ row }">
            <Button type="link" @click="openFormUpdateMediaItemStockModalApi([row])">
              {{ $t('media.media_item.stock_add') }}
            </Button>
          </template>
        </Grid>
      </Card>

    </Modal>
    <UpdateMediaItemStockFormModal/>
  </div>
</template>

<style scoped>

</style>
