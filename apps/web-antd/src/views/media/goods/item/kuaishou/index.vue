<script lang="ts" setup name="KuaiShouPushItem">
import {ref} from 'vue';
import {Page} from '@vben/common-ui';
import {Button, Card, Table, Input, Textarea} from 'ant-design-vue';
import {useVbenForm} from '#/adapter/form';
import {$t} from "@vben/locales";
import {categoryApi, mediaAccountApi, logisticsApi, itemPushConfigApi} from "#/api/media";
import {PlatformEnum} from "#/constants/locales";
import type {CategoryItem, KuaiShouPushItem, PlatformQualificationParams} from "#/api/models";

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


// 获取资质配置列表


// 类目ID
const categories = ref<Array<CategoryItem>>([])

const [CustomLayoutForm, CustomLayoutFormApi] = useVbenForm({
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
        onChange: async (val) => {
          const {accountId} = await CustomLayoutFormApi.getValues()
          const params: PlatformQualificationParams = {
            platform: PlatformEnum.KUAISHOU,
            platformCategoryId: val,
            localAccountId: accountId[0]
          }
          await itemPushConfigApi.fetchPlatformQualificationConfig(params)
          await itemPushConfigApi.fetchPlatformCategoryConfig(params)
        }
      },
      label: `${$t('media.push_item.category')}`,
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
      component: 'Select',
      fieldName: 'payWay',
      componentProps: {
        options: payWayOptions
      },
      label: `${$t('media.push_item.kuaishou.item_fields.payWay')}`,
      rules: "required",
      defaultValue: 2
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
    },
    {
      component: "Select",
      fieldName: "immediatelyOnOfflineFlag",
      defaultValue: 0,
      rules: "required",
      componentProps: {
        options: [
          {
            label: `${$t('common.yes')}`,
            value: 0
          },
          {
            label: `${$t('common.no')}`,
            value: 1
          }
        ]
      },
      label: `${$t('media.push_item.service_rule_options.immediatelyOnOfflineFlag')}`,
    }
  ]
})


// 服务保证
const [ServicePromiseForm] = useVbenForm({
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
      fieldName: "freshRotRefund",
      defaultValue: false,
      componentProps: {
        options: [
          {
            label: `${$t('common.yes')}`,
            value: true
          },
          {
            label: `${$t('common.no')}`,
            value: false
          }
        ]
      },
      label: `${$t('media.push_item.servicePromise.options.freshRotRefund')}`,
    },
    {
      component: "Select",
      defaultValue: false,
      fieldName: "brokenRefund",
      componentProps: {
        options: [
          {
            label: `${$t('common.yes')}`,
            value: true
          },
          {
            label: `${$t('common.no')}`,
            value: false
          }
        ]
      },
      label: `${$t('media.push_item.servicePromise.options.brokenRefund')}`,
    },
    {
      component: "Select",
      fieldName: "allergyRefund",
      defaultValue: false,
      componentProps: {
        options: [
          {
            label: `${$t('common.yes')}`,
            value: true
          },
          {
            label: `${$t('common.no')}`,
            value: false
          }
        ]
      },
      label: `${$t('media.push_item.servicePromise.options.allergyRefund')}`,
    },
    {
      component: "Select",
      fieldName: "crabRefund",
      defaultValue: false,
      componentProps: {
        options: [
          {
            label: `${$t('common.yes')}`,
            value: true
          },
          {
            label: `${$t('common.no')}`,
            value: false
          }
        ]
      },
      label: `${$t('media.push_item.servicePromise.options.crabRefund')}`,
    },
    {
      component: "Select",
      fieldName: "weightGuarantee",
      defaultValue: false,
      componentProps: {
        options: [
          {
            label: `${$t('common.yes')}`,
            value: true
          },
          {
            label: `${$t('common.no')}`,
            value: false
          }
        ]
      },
      label: `${$t('media.push_item.servicePromise.options.weightGuarantee')}`,
    },
  ]
})

// 配置表单
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
      component: 'Switch',
      fieldName: 'multipleStock',
      componentProps: {
        class: 'w-auto',
      },
      label: `${$t('media.push_item.multipleStock')}`,
      defaultValue: false
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
    title: `${$t('media.push_item.kuaishou.item_fields.title')}`,
    dataIndex: 'title',
    key: 'title',
    width: 150,
    fixed: 'left',
  },
  {
    title: `${$t('media.push_item.kuaishou.item_fields.relItemId')}`,
    dataIndex: 'relItemId',
    key: 'relItemId',
    width: 150,
    fixed: 'left',
  },
  {
    title: `${$t('media.media_item.columns.imageUrls')}`,
    dataIndex: 'imageUrls',
    key: 'imageUrls',
    width: 'auto',
  },

  {
    title: `${$t('media.push_item.kuaishou.item_fields.shortTitle')}`,
    dataIndex: 'shortTitle',
    key: 'shortTitle',
    width: 150,
  },
  {
    title: `${$t('media.media_item.columns.sellingPoint')}`,
    dataIndex: 'sellingPoint',
    key: 'sellingPoint',
    width: 'auto',
    width: 150,
  },
  {
    title: `${$t('media.push_item.kuaishou.item_fields.instructions')}`,
    dataIndex: 'instructions',
    key: 'instructions',
    width: 'auto',
    width: 200,
  },
  {
    title: `${$t('media.media_item.kuaishou.item_columns.details')}`,
    dataIndex: 'details',
    key: 'details',
    width: 200,
  },
  {
    title: `${$t('media.media_item.kuaishou.item_columns.detailImageUrls')}`,
    dataIndex: 'detailImageUrls',
    key: 'detailImageUrls',
    width: 150,

  },
  {
    title: `${$t('media.media_item.kuaishou.item_columns.whiteBaseImageUrl')}`,
    dataIndex: 'whiteBaseImageUrl',
    key: 'whiteBaseImageUrl',
    width: 150,

  },
  {
    title: `${$t('media.media_item.kuaishou.item_columns.transparentImageUrl')}`,
    dataIndex: 'transparentImageUrl',
    key: 'transparentImageUrl',
    width: 150,

  },

  {
    title: `${$t('media.media_item.columns.itemRemark')}`,
    dataIndex: 'itemRemark',
    key: 'itemRemark',
    width: 'auto',
    width: 200,

  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 'auto',
    width: 150,

  },
]);

// sku columns
const skuColumns = ref([
  {
    title: `${$t('media.media_item.kuaishou.sku_columns.relSkuId')}`,
    dataIndex: 'relSkuId',
    key: 'relSkuId',
    width: 'auto',
  },
  {
    title: `${$t('media.media_item.kuaishou.sku_columns.skuStock')}`,
    dataIndex: 'skuStock',
    key: 'skuStock',
    width: 'auto',

  },
  {
    title: `${$t('media.media_item.kuaishou.sku_columns.skuSalePrice')}`,
    dataIndex: 'skuSalePrice',
    key: 'skuSalePrice',
    width: 'auto',

  },
  {
    title: `${$t('media.media_item.kuaishou.sku_columns.skuNick')}`,
    dataIndex: 'skuNick',
    key: 'skuNick',
    width: 'auto',

  },
  {
    title: `${$t('media.media_item.kuaishou.sku_columns.skuMarketPrice')}`,
    dataIndex: 'skuMarketPrice',
    key: 'skuMarketPrice',
    width: 'auto',

  },
  {
    title: `${$t('media.media_item.kuaishou.sku_columns.goodsId')}`,
    dataIndex: 'goodsId',
    key: 'goodsId',
    width: 'auto',

  },
  {
    title: `${$t('media.media_item.kuaishou.sku_columns.goodsCode')}`,
    dataIndex: 'goodsCode',
    key: 'goodsCode',
    width: 'auto',

  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 'auto',
    fixed: 'right'
  },
]);


// add item
function addEmptyItem() {
  itemList.value.push({
    title: '',
    shortTitle: '',
    relItemId: '',
    imageUrls: [],
    skuList: [],
    itemPropValues: [],
    details: '',
    detailImageUrls: [],
    stockPartner: false,
    itemRemark: '',
    instructions: '',
    sellingPoint: '',
    skuList: []
  })
}

// add item sku
function addItemSku(record) {
  record.skuList.push({
    relSkuId: '',
    skuStock: 0,
    skuSalePrice: 0,
    skuNick: '',
    skuMarketPrice: 0,
    goodsId: '',
    goodsCode: '',
  })
}

// delete item
function deleteItem(record, index: number) {
  itemList.value = itemList.value.filter((_, _index) => _index !== index);
}

// delete sku
function deleteSku(itemRecord, index: number) {
  itemRecord.skuList = itemRecord.skuList.filter((_, _index) => _index !== index);
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

    <Card :title="$t('media.push_item.servicePromise.title')">
      <ServicePromiseForm/>
    </Card>

    <Card :title="$t('media.push_item.items')">
      <template #extra>
        <Button @click="addEmptyItem">{{ $t('action.add') }}</Button>
      </template>
      <Table :data-source="itemList" :columns="itemColumns" :pagination="false" sticky
             :scroll="{ x: 1500 }" rowKey="relItemId">

        <template #expandedRowRender="{ record: itemRecord, index: itemIndex }">

          <Button @click="addItemSku(itemRecord)">{{ $t('action.add') }}</Button>
          <Table :data-source="itemRecord.skuList" :columns="skuColumns" :pagination="false">

            <template #bodyCell="{column, record , index}">

              <template v-if="column.dataIndex === 'relSkuId'">
                <Input v-model:value="record.relSkuId"/>
              </template>

              <template v-if="column.dataIndex === 'skuStock'">
                <Input v-model:value="record.skuStock"/>
              </template>

              <template v-if="column.dataIndex === 'skuSalePrice'">
                <Input v-model:value="record.skuSalePrice"/>
              </template>

              <template v-if="column.dataIndex === 'skuNick'">
                <Input v-model:value="record.skuNick"/>
              </template>

              <template v-if="column.dataIndex === 'skuMarketPrice'">
                <Input v-model:value="record.skuMarketPrice"/>
              </template>

              <template v-if="column.dataIndex === 'goodsId'">
                <Input v-model:value="record.goodsId"/>
              </template>

              <template v-if="column.dataIndex === 'goodsCode'">
                <Input v-model:value="record.goodsCode"/>
              </template>

              <template v-else-if="column.dataIndex === 'action'">
                <Button @click="deleteSku(itemRecord, index)">{{ $t('common.delete') }}</Button>
              </template>

            </template>

          </Table>
        </template>

        <template #bodyCell="{column, record , index}">

          <template v-if="column.dataIndex === 'title'">
            <Input v-model:value="record.title"/>
          </template>

          <template v-if="column.dataIndex === 'imageUrls'">
            <Input v-model:value="record.imageUrls"/>
          </template>

          <template v-if="column.dataIndex === 'relItemId'">
            <Input v-model:value="record.relItemId"/>
          </template>

          <template v-if="column.dataIndex === 'shortTitle'">
            <Input v-model:value="record.shortTitle"/>
          </template>

          <template v-if="column.dataIndex === 'sellingPoint'">
            <Textarea v-model:value="record.sellingPoint"/>
          </template>

          <template v-if="column.dataIndex === 'instructions'">
            <Textarea v-model:value="record.instructions"/>
          </template>

          <template v-if="column.dataIndex === 'details'">
            <Textarea v-model:value="record.details"/>
          </template>

          <template v-if="column.dataIndex === 'detailImageUrls'">
            <Input v-model:value="record.detailImageUrls"/>
          </template>

          <template v-if="column.dataIndex === 'itemRemark'">
            <Textarea v-model:value="record.itemRemark"/>
          </template>

          <template v-if="column.dataIndex === 'whiteBaseImageUrl'">
            <Input v-model:value="record.whiteBaseImageUrl"/>
          </template>

          <template v-if="column.dataIndex === 'transparentImageUrl'">
            <Input v-model:value="record.transparentImageUrl"/>
          </template>

          <template v-else-if="column.dataIndex === 'action'">
            <Button @click="deleteItem(record, index)">{{ $t('common.delete') }}</Button>
            <Button>SKU</Button>
          </template>
        </template>
      </Table>
    </Card>
  </Page>
</template>

