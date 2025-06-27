<script setup lang="ts" name="BilibiliItemDetail">
import {h, ref} from 'vue';
import {$t} from "@vben/locales";
import {useVbenModal} from '@vben/common-ui';
import type {
  BilibiliItemDetailResponse,
  BilibiliItemSku,
  MediaItemDetailRequest
} from "#/api/models";
import {Card, Divider, Spin} from "ant-design-vue";
import {useVbenForm} from "#/adapter/form";
import {categoryApi, itemApi} from "#/api/media";
import {PlatformEnum} from "#/constants";
import {useVbenVxeGrid, type VxeGridProps} from "#/adapter/vxe-table";


const itemDetail = ref<BilibiliItemDetailResponse>();
const title: string = `${$t('action.info')}`;


const itemDetailRequest = ref<MediaItemDetailRequest>({});

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
      fieldName: 'product_id',
      label: `${$t('media.media_item.bilibili.item_columns.product_id')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'name',
      label: `${$t('media.media_item.bilibili.item_columns.name')}`
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
            platform: PlatformEnum.Bilibili,
          });
          return items;
        },
        childrenField: 'children',
        // 菜单接口转options格式
        labelField: 'platformCategoryName',
        valueField: 'platformCategoryId',
      },
      // 字段名
      fieldName: 'category_leaf_id',
      label: `${$t('media.media_item.bilibili.item_columns.category_leaf_id')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'text_description',
      label: `${$t('media.media_item.bilibili.item_columns.text_description')}`
    },

    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: ' ',
      },
      // 字段名
      fieldName: 'freight_id',
      label: `${$t('media.media_item.bilibili.item_columns.freight_id')}`
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'delivery_delay_day',
      label: `${$t('media.media_item.bilibili.item_columns.delivery_delay_day')}`
    },

    {
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        options: [
          {
            label: '现货发货',
            value: 0
          },
          {
            label: '预售发货',
            value: 1
          },
        ]
      },
      // 字段名
      fieldName: 'presell_type',
      label: `${$t('media.media_item.bilibili.item_columns.presell_type')}`
    },
    {
      component: 'Input',
      // 对应组件的参数
      componentProps: {},
      // 字段名
      fieldName: 'limit_per_buyer',
      label: `${$t('media.media_item.bilibili.item_columns.limit_per_buyer')}`
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
            label: '待上架',
            value: 0
          },
          {
            label: '已上架',
            value: 1
          },
          {
            label: '已下架',
            value: 2
          }
        ]
      },
      // 字段名
      fieldName: 'status',
      label: `${$t('media.media_item.bilibili.item_columns.status')}`
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
      componentProps: {
        class: 'w-auto',
      },
      // 字段名
      fieldName: 'limit_per_buyer',
      label: `${$t('media.media_item.bilibili.item_columns.limit_per_buyer')}`
    },

    {
      component: 'Select',
      // 对应组件的参数
      componentProps: {
        options: [
          {
            label: '未删除',
            value: 0
          },
          {
            label: '已删除',
            value: 1
          },
        ]
      },
      // 字段名
      fieldName: 'recycling_status',
      label: `${$t('media.media_item.bilibili.item_columns.recycling_status')}`,
    }
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});


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
  await formApi.setValues(itemDetail.value.item);
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
          <Form></Form>
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
