<script setup lang="ts" name="KuaiShouOrderDetail">
import {Card, Descriptions, DescriptionsItem, Space, TabPane, Tabs, Tag, List, ListItem} from "ant-design-vue";
import {$t} from "@vben/locales";
import type {KuaiShouOrder} from "#/api/models";
import {type PropType, ref} from "vue";
import {dateFormat} from "#/utils";
import {getOrderStatusTag, PlatformEnum, getPayMethodTag} from "#/constants";

const props = defineProps(
  {
    orderInfo: {
      type: [] as PropType<Array<KuaiShouOrder>>,
      default: () => {
        return [] as KuaiShouOrder[];
      },
      required: true
    }
  }
);
const activeKey = ref<string>(props.orderInfo[0].skuId);

</script>

<template>
    <Tabs v-model:activeKey="activeKey" type="card" >
      <TabPane :key="order.skuId" :tab="order.skuNick" v-for="order in orderInfo">
        <Space direction="vertical">
          <Card>
            <Descriptions bordered title="订单基础信息" :column="{ xxl: 4, xl: 5, lg: 12, md: 12, sm: 2, xs: 1 }">
              <DescriptionsItem :label="$t('media.order.kuaishou.oid')">{{ order.oid }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.payTime')">{{ dateFormat( order.payTime) }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.buyerImage')">{{ order.buyerImage }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.buyerOpenId')">{{ order.buyerOpenId }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.buyerNick')">{{ order.buyerNick }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.sellerOpenId')">{{ order.sellerOpenId }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.sellerNick')">{{ order.sellerNick }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.expressFee')">{{ order.expressFee }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.discountFee')">{{ order.discountFee }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.totalFee')">{{ order.totalFee }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.status')">
                <component :is="getOrderStatusTag(PlatformEnum.KUAISHOU,order.status)"/>
              </DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.sendTime')">{{ dateFormat(order.sendTime) }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.refundTime')">{{ dateFormat(order.refundTime) }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.createTime')">{{ dateFormat(order.createTime) }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.updateTime')">{{ dateFormat(order.updateTime) }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.remark')">{{ order.remark }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.theDayOfDeliverGoodsTime')">{{ order.theDayOfDeliverGoodsTime }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.promiseTimeStampOfDelivery')">{{ order.promiseTimeStampOfDelivery }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.activityType')">{{ order.activityType }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.cpsType')">{{ order.cpsType }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.validPromiseShipmentTimeStamp')">{{ order.validPromiseShipmentTimeStamp }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.preSale')">{{ order.preSale }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.recvTime')">{{ order.recvTime }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.coType')">{{ order.coType }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.commentStatus')">{{ order.commentStatus }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.payType')">
                <component :is="getPayMethodTag(PlatformEnum.KUAISHOU, order.payType)"/>
              </DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.riskCode')">{{ order.riskCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.payChannel')">{{ order.payChannel }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.sellerDelayPromiseTimeStamp')">{{ order.sellerDelayPromiseTimeStamp }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.priorityDelivery')">
                <Tag v-if=" order.priorityDelivery">{{ $t('common.yes')}}</Tag>
                <Tag v-else>{{ $t('common.no')}}</Tag>
              </DescriptionsItem>

              <DescriptionsItem :label="$t('media.order.kuaishou.remindShipmentSign')"><Tag>{{order.remindShipmentSign}}</Tag></DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.remindShipmentTime')">{{ dateFormat(order.remindShipmentTime) }}</DescriptionsItem>

              <DescriptionsItem :label="$t('media.order.kuaishou.disableDeliveryReasonCode')">{{ order.disableDeliveryReasonCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.orderLabels')">
                <Tag v-for="(item, index) in order.orderLabels" :key="index">{{item}}</Tag>
              </DescriptionsItem>

              <DescriptionsItem :label="$t('media.order.kuaishou.enableSplitDeliveryOrder')">
                <Tag v-if=" order.enableSplitDeliveryOrder">{{ $t('common.yes')}}</Tag>
                <Tag v-else>{{ $t('common.no')}}</Tag>
              </DescriptionsItem>

              <DescriptionsItem :label="$t('media.order.kuaishou.allowanceExpressFee')">{{ order.allowanceExpressFee }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.payChannelDiscount')">{{ order.payChannelDiscount }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.tradeInPayAfterPromoAmount')">{{ order.tradeInPayAfterPromoAmount }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.governmentDiscount')">{{ order.governmentDiscount }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.channel')">{{ order.channel }}</DescriptionsItem>

            </Descriptions>
          </Card>

          <Card>
            <Descriptions bordered title="商品信息"  :column="{ xxl: 4, xl: 5, lg: 12, md: 12, sm: 2, xs: 1 }">
              <DescriptionsItem :label="$t('media.order.kuaishou.skuId')">{{ order.skuId }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.relSkuId')">{{ order.relSkuId }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.skuDesc')">{{ order.skuDesc }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.skuNick')">{{ order.skuNick }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.itemId')">{{ order.itemId }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.relItemId')">{{ order.relItemId }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.itemTitle')">{{ order.itemTitle }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.itemLinkUrl')">{{ order.itemLinkUrl }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.itemPicUrl')">{{ order.itemPicUrl }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.num')">{{ order.num }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.originalPrice')">{{ order.originalPrice }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.discountFee')">{{ order.discountFee }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.price')">{{ order.price }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.itemType')">{{ order.itemType }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.goodsCode')">{{ order.goodsCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.warehouseCode')">{{ order.warehouseCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.orderItemId')">{{ order.orderItemId }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.goodStoreCode')">{{ order.goodStoreCode }}</DescriptionsItem>
            </Descriptions>
          </Card>

          <Card>
            <Descriptions bordered title="地址信息"  :column="{ xxl: 4, xl: 5, lg: 12, md: 12, sm: 2, xs: 1 }">
              <DescriptionsItem :label="$t('media.order.kuaishou.encryptedConsignee')">{{ order.encryptedConsignee }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.desensitiseConsignee')">{{ order.desensitiseConsignee }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.encryptedMobile')">{{ order.encryptedMobile }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.desensitiseMobile')">{{ order.desensitiseMobile }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.provinceCode')">{{ order.provinceCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.province')">{{ order.province }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.cityCode')">{{ order.cityCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.city')">{{ order.city }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.districtCode')">{{ order.districtCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.district')">{{ order.district }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.townCode')">{{ order.townCode }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.town')">{{ order.town }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.encryptedAddress')">{{ order.encryptedAddress }}</DescriptionsItem>
              <DescriptionsItem :label="$t('media.order.kuaishou.desensitiseAddress')">{{ order.desensitiseAddress }}</DescriptionsItem>
            </Descriptions>
          </Card>

          <Card :title="$t('media.order.kuaishou.orderNoteInfo.title')">
            <List :data-source="order.orderNoteInfo">
              <template #renderItem="{ item }">
                <ListItem>
                  <Descriptions :column="{ xxl: 4, xl: 5, lg: 12, md: 12, sm: 2, xs: 1 }">
                    <DescriptionsItem :label="$t('media.order.kuaishou.orderNoteInfo.title')">{{ item.title }}</DescriptionsItem>
                    <DescriptionsItem :label="$t('media.order.kuaishou.orderNoteInfo.createTime')">{{ item.createTime}}</DescriptionsItem>
                    <DescriptionsItem :label="$t('media.order.kuaishou.orderNoteInfo.note')">{{ item.note}}</DescriptionsItem>
                    <DescriptionsItem :label="$t('media.order.kuaishou.orderNoteInfo.flagTagCode')">{{ item.flagTagCode}}</DescriptionsItem>
                    <DescriptionsItem :label="$t('media.order.kuaishou.orderNoteInfo.operatorName')">{{ item.operatorName}}</DescriptionsItem>
                  </Descriptions>
                </ListItem>
              </template>
            </List>
          </Card>
        </Space>
      </TabPane>
    </Tabs>
</template>

<style scoped>

</style>
