<script setup lang="ts">
import {Page} from '@vben/common-ui';
import type {VbenFormProps} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import { pangolinApi } from '#/api/core/tools';
import { trimObject } from '#/utils/trim';
import {Image} from 'ant-design-vue';
import type { ProductPangolinItem } from '#/api/models/tools';

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      rules: 'required',
      fieldName: 'appId',
      label: 'appId'
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      rules: 'required',
      fieldName: 'appSecret',
      label: 'appSecret'
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'title',
      label: '商品关键词'
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'priceMin',
      label: '最低价格'
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'priceMax',
      label: '最高价格'
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'sellNumMin',
      label: '历史销量最小值'
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'sellNumMax',
      label: '历史销量最大值'
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          {
            label: "默认排序",
            value: 0,
          },
          {
            label: "历史销量排序",
            value: 1,
          },
          {
            label: "价格排序",
            value: 2,
          },
          {
            label: "佣金排序",
            value: 3,
          },
          {
            label: "佣金比例排序",
            value: 4,
          }
        ],
      },
      defaultValue: 0,
      fieldName: 'searchType',
      label: "排序类型",
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          {
            label: "升序",
            value: 0,
          },
          {
            label: "降序",
            value: 1,
          }
        ],
      },
      defaultValue: 0,
      fieldName: 'orderType',
      label: "订单类型",
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'cosFeeMin',
      label: '最低分佣'
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'cosFeeMax',
      label: '最高分佣'
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'cosRatioMin',
      label: '分佣比例最小值'
    },
    {
      component: 'Input',
      componentProps: {
        type:'number',
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'cosRatioMax',
      label: '分佣比例最大值'
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          {
            label: "全量",
            value: 0,
          },
          {
            label: "超值购",
            value: 1,
          }
        ],
      },
      defaultValue: 0,
      fieldName: 'activityId',
      label: "活动商品",
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
}

const gridOptions: VxeGridProps<ProductPangolinItem> = {
  border: true,
  checkboxConfig: {
    highlight: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
  },
  columns: [
    {
      field: 'product_id',
      title: '商品id',
      width: 'auto',
    },
    {
      field: 'title',
      title: '商品名称',
      width: 'auto',
    },
    {
      field: 'is_kol_product',
      slots: { default: 'is_kol_product' },
      title: '是否有达人特殊佣金',
      width: 'auto',
    },
    {
      field: 'price',
      title: '商品价格',
      width: 'auto',
    },
    {
      field: 'in_stock',
      slots: { default: 'in_stock' },
      title: '有无库存',
      width: 'auto',
    },
    {
      field: 'first_cid',
      title: '商品一级类目',
      width: 'auto',
    },
    {
      field: 'second_cid',
      title: '商品二级类目',
      width: 'auto',
    },
    {
      field: 'third_cid',
      title: '商品三级类目',
      width: 'auto',
    },
    {
      field: 'sales',
      title: '商品历史销量',
      width: 'auto',
    },
    {
      field: 'cover',
      slots: { default: 'image-url' },
      title: '商品主图',
      width: 'auto',
    },
    {
      field: 'detail_url',
      title: '商品链接',
      width: 'auto',
    },
    {
      field: 'shop_id',
      title: '商铺id',
      width: 'auto',
    },
    {
      field: 'shop_name',
      title: '商铺名称',
      width: 'auto',
    },
    {
      field: 'coupon_price',
      title: '券后价格',
      width: 'auto',
    },
    {
      field: 'cos_ratio',
      title: '分佣比例',
      width: 'auto',
    },
    {
      field: 'cos_fee',
      title: '佣金金额',
      width: 'auto',
    },
    {
      field: 'activity_id',
      slots: { default: 'activity_id' },
      title: '活动商品',
      width: 'auto',
    },
    {
      field: 'ext',
      title: '加密字段',
      width: 'auto',
    },
    {
      field: 'post_free',
      slots: { default: 'post_free' },
      title: '是否包邮',
      width: 'auto',
    },
    {
      field: 'limit_min_sale',
      slots: { default: 'limit_min_sale' },
      title: '是否多件起购',
      width: 'auto',
    }
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  exportConfig: {
    filename: '',
    types: [
      "csv",
      "xlsx",
      "xls"
    ]
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        const params = trimObject(args);
        return await pangolinApi.fetchPangolinProducts({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...params,
        });
      },
    },
  },
};


const [Grid] = useVbenVxeGrid({ formOptions, gridOptions });

</script>

<template>
<div>
  <Page auto-content-height>
    <Grid>
      <template #image-url="{ row }">
        <Image :src="row.cover" height="30" width="30" />
      </template>
      <template #is_kol_product="{ row }">
        {{row.is_kol_product ? '是' : '否' }}
      </template>
      <template #in_stock="{ row }">
        {{row.in_stock ? '是' : '否' }}
      </template>
      <template #post_free="{ row }">
        {{row.post_free ? '是' : '否' }}
      </template>
      <template #limit_min_sale="{ row }">
        {{row.limit_min_sale ? '是' : '否' }}
      </template>
      <template #activity_id="{ row }">
        {{row.activity_id === 1 ? '超值购' : '全量' }}
      </template>
    </Grid>
  </Page>
</div>
</template>

<style scoped>

</style>
