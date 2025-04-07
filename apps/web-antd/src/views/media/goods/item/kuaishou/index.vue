<script lang="ts" setup name="KuaiShouPushItem">
import {ref} from 'vue';
import {Page} from '@vben/common-ui';
import {Button, Card, Table, Input} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {$t} from "@vben/locales";
import {categoryApi, mediaAccountApi, logisticsApi} from "#/api/media";
import {PlatformEnum} from "#/constants/locales";
import type {CategoryItem, KuaiShouPushItem} from "#/api/models";

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
      rules: "required",
      componentProps: {
        afterFetch: (data: { name: string; id: string }[]) => {
          return data.map((item: any) => ({
            label: `${item.name}-${item.platform}`,
            value: item.id,
          }));
        },
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
      rules: "required",
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

const [ServiceRuleForm] = useVbenForm({
  showDefaultActions: false,
  showCollapseButton: false,
  wrapperClass: 'grid-cols-3',
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: "Select",
      fieldName: "refundRule",
      componentProps: {},
      label: `${$t('media.push_item.service_rule_options.refundRule')}`,
      rules: "required"
    },
    {
      component: "DatePicker",
      fieldName: "deliverGoodsInteralTime",
      componentProps: {},
      label: `${$t('media.push_item.service_rule_options.deliverGoodsInteralTime')}`,
    },
    {
      component: "DatePicker",
      fieldName: "promiseDeliveryTime",
      componentProps: {},
      label: `${$t('media.push_item.service_rule_options.promiseDeliveryTime')}`,
    }
  ]
})

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

// item table
const itemList = ref<KuaiShouPushItem[]>([]);
// item columns
const itemColumns = ref([
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '外部商品ID',
    dataIndex: 'relItemId',
    key: 'relItemId',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'relItemId',
  },
]);

// add item
function addEmptyItem() {
  itemList.value.push({
    title: '',
    relItemId: '',
    imageUrls: [],
    skuList: [],
    itemPropValues: [],
    details: '',
    detailImageUrls: [],
    stockPartner: false,
    itemRemark: '',
  })
}

// delete item
function deleteItem(record) {
}

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

    <Card :title="$t('media.push_item.service_rule')">
      <ServiceRuleForm/>
    </Card>

    <Card :title="$t('media.push_item.items')">
      <template #extra>
        <Button @click="addEmptyItem">{{ $t('action.add') }}</Button>
      </template>
      <Table :data-source="itemList" :columns="itemColumns">
        <template #bodyCell="{column, record }">

          <template v-if="column.dataIndex === 'title'">
            <Input v-model:value="record.title"/>
          </template>

          <template v-if="column.dataIndex === 'relItemId'">
            <Input v-model:value="record.relItemId"/>
          </template>

          <template v-else-if="column.dataIndex === 'action'">
            <Button @click="deleteItem(record)">Delete</Button>
          </template>
        </template>
      </Table>
    </Card>
  </Page>
</template>

