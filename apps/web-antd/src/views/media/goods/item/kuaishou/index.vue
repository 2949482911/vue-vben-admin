<script lang="ts" setup name="KuaiShouPushItem">
import {ref} from 'vue';
import {Page} from '@vben/common-ui';
import {Button, Card, Image} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {$t} from "@vben/locales";
import {categoryApi, mediaAccountApi, logisticsApi} from "#/api/media";
import {PlatformEnum} from "#/constants/locales";
import type {CategoryItem} from "#/api/models";
import {useVbenVxeGrid} from "@vben/plugins/vxe-table";
import type {VxeGridProps} from '#/adapter/vxe-table';

const payWayOptions = ref([
  {
    label: `${$t('media.push_item.kuaishou.pay_way_options.online_pay')}`,
    value: 2
  }
])

async function getCategoryTree(accountIds: Array<string>): Array<CategoryItem> {
  return await categoryApi.fetchCategoryTree({
    platform: PlatformEnum.KUAISHOU,
    accountIds
  })
}

// 类目ID
const categories = ref<Array<CategoryItem>>([])

const [CustomLayoutForm] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  showDefaultActions: false,
  showCollapseButton: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'ApiSelect',
      fieldName: 'accountId',
      componentProps: {
        afterFetch: (data: { name: string; id: string }[]) => {
          return data.map((item: any) => ({
            label: `${item.name}-${item.platform}`,
            value: item.id,
          }));
        },
        // 菜单接口
        api: async () => {
          const {items} = await mediaAccountApi.fetchAllMediaOnlineretailers(PlatformEnum.KUAISHOU)
          return items
        },
        mode: "multiple",
        onChange: async (val,) => {
          categories.value = await getCategoryTree(val)
        }
      },
      label: `${$t('media.push_item.account')}`,
    },
    {
      component: 'TreeSelect',
      fieldName: 'categoryId',
      componentProps: {
        treeData: categories,
        fieldNames: {
          label: 'platformCategoryName',
          value: 'platformCategoryId',
          children: 'children',
        },
      },
      label: `${$t('media.push_item.category')}`,
    },
  ],
  // 一共三列
  wrapperClass: 'grid-cols-3',
});

const [ConfigForm] = useVbenForm({
  showDefaultActions: false,
  showCollapseButton: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      fieldName: 'payWay',
      componentProps: {
        options: payWayOptions
      },
      label: `${$t('media.push_item.kuaishou.item_fields.payWay')}`,
      rules: "required",
      defaultValue: 2
    },

    {
      component: 'Switch',
      fieldName: 'purchaseLimit',
      componentProps: {
        class: 'w-auto',
      },
      label: `${$t('media.push_item.kuaishou.item_fields.purchaseLimit')}`,
      defaultValue: false
    },
    {
      component: 'InputNumber',
      fieldName: 'limitCount',
      componentProps: {
        min: 1,
        max: 1000,
        class: 'w-full',
      },
      rules: 'required',
      label: `${$t('media.push_item.kuaishou.item_fields.limitCount')}`,
      dependencies: {
        show: (form) => {
          return form.purchaseLimit
        },
        triggerFields: ["purchaseLimit"]
      },
      defaultValue: 1
    },
    {
      component: 'Switch',
      fieldName: 'stockPartner',
      componentProps: {
        class: 'w-auto',
      },
      label: `${$t('media.push_item.kuaishou.item_fields.stockPartner')}`,
      defaultValue: false
    },
    {
      component: "ApiSelect",
      fieldName: "expressTemplateId",
      rules: 'required',
      componentProps: {
        afterFetch: (data: { name: string; platformExpressTemplateId: string }[]) => {
          return data.map((item: any) => ({
            label: item.name,
            value: item.platformExpressTemplateId,
          }));
        },
        api: async () => {
          const {items} = await logisticsApi.fetchExpressTemplateList({
            platform: PlatformEnum.KUAISHOU,
            page: 1,
            pageSize: 1000
          })
          return items
        }
      },
      label: `${$t('media.push_item.kuaishou.item_fields.expressTemplate')}`
    },
    {
      component: 'Switch',
      fieldName: 'saleTimeFlag',
      componentProps: {
        class: 'w-auto',
      },
      label: `${$t('media.push_item.kuaishou.item_fields.saleTimeFlag')}`,
      defaultValue: false
    },
    {
      component: 'TimePicker',
      fieldName: 'timeOfSale',
      componentProps: {
        class: 'w-auto',
      },
      rules: "required",
      label: `${$t('media.push_item.kuaishou.item_fields.timeOfSale')}`,
      dependencies: {
        show: (form) => {
          return form.timeOfSale
        },
        triggerFields: ["saleTimeFlag"]
      }
    }
  ],
  wrapperClass: 'grid-cols-3',
})

// 表单项
const gridOptions: VxeGridProps<RowType> = {
  columns: [
    {title: '序号', type: 'seq', width: 50},
    {
      editRender: {name: 'input'},
      field: 'title',
      title: `${$t('media.push_item.kuaishou.item_fields.title')}`
    },
    {
      editRender: {name: 'input'},
      field: 'purchaseLimit',
      title: `${$t('media.push_item.kuaishou.item_fields.title')}`
    },
    {
      editRender: {name: 'InputNumber'},
      field: 'limitCount',
      title: `${$t('media.push_item.kuaishou.item_fields.limitCount')}`,
      slots: {default: 'limitCount'},
    },
  ],
  data: [
    {
      "title": "测试",
      "purchaseLimit": true,
      "limitCount": 10
    }
  ],
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
  pagerConfig: {
    enabled: false
  },
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: gridOptions
});


</script>


<template>
  <Page
    content-class="flex flex-col gap-4"
    :title="$t('page.media.account.kuaishou')"
  >
    <template #description>
      <div class="text-muted-foreground">
        <p>{{ $t('media.push_item.kuaishou.desc') }}</p>
      </div>
    </template>

    <template #extra>
    </template>
    <Card :title="$t('media.push_item.basis_info')">
      <CustomLayoutForm/>
    </Card>

    <Card :title="$t('media.push_item.config')">
      <ConfigForm/>
    </Card>

    <Card :title="$t('media.push_item.items')">
      <template #extra>
        <Button>{{ $t('action.add') }}</Button>
      </template>
    </Card>
  </Page>
</template>

