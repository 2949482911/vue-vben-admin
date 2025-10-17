<script setup lang="ts" name="MatchTable">
import {Page} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import type {OcpxPlatformMatch} from "#/api/models";
import {$t} from "@vben/locales";
import {Button, Input, Select} from "ant-design-vue";
import {PLATFORM} from "#/constants/locales";

// const matchDataList = ref<OcpxPlatformMatch[]>([]);

const {matchDataList} = defineProps({
  matchDataList: {
    type: Array<OcpxPlatformMatch>,
    default: () => []
  }
})


//
const gridOptions: VxeGridProps<OcpxPlatformMatch> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    {title: '序号', type: 'seq', type: 'checkbox', width: 100},
    {
      field: 'platform',
      title: `${$t('ocpx.behavioraplatform.columns.platform')}`,
      slots: {default: 'platform'},
      watch: 'auto'
    },
    {
      field: 'advertiserId',
      title: `${$t('ocpx.behavioraplatform.columns.advertiserId')}`,
      slots: {default: 'advertiserId'}
    },
    {
      field: 'campaignId',
      title: `${$t('ocpx.behavioraplatform.columns.campaignId')}`,
      slots: {default: 'campaignId'}

    },
    {
      field: 'adgroupId',
      title: `${$t('ocpx.behavioraplatform.columns.adgroupId')}`,
      slots: {default: 'adgroupId'}
    },
    {
      field: 'promotionId',
      title: `${$t('ocpx.behavioraplatform.columns.promotionId')}`,
      slots: {default: 'promotionId'}
    },
    {
      field: 'creativeId',
      title: `${$t('ocpx.behavioraplatform.columns.creativeId')}`,
      slots: {default: 'creativeId'}
    },
    {
      field: 'matchId',
      title: `${$t('ocpx.behavioraplatform.columns.matchId')}`,
      slots: {default: 'matchId'}
    },
    {
      field: 'options',
      title: `${$t('core.columns.options')}`,
      fixed: 'right',
      slots: {default: 'action'},
    },
  ],
  // height: 'auto',
  keepSource: true,
  proxyConfig: {
    enabled: false,
  },
  data: matchDataList,
  pagerConfig: {
    enabled: false,
  },
};


const [Grid, gridApi] = useVbenVxeGrid({gridOptions});

// 新增匹配列
function addMatchCol() {
  matchDataList.push({
    platform: "",
    advertiserId: "",
    campaignId: "",
    adgroupId: "",
    promotionId: "",
    creativeId: "",
    matchId: "",
  })
  gridApi.setGridOptions({data: matchDataList})
  gridApi.reload()
}

// 复制匹配列
function copyMatchData(row: OcpxPlatformMatch) {
  matchDataList.push(row)
}

function delMatchData(index: number) {
  matchDataList.splice(matchDataList.indexOf(index), 1)
}

</script>

<template>
  <Page>
    <Grid>

      <template #platform="{ row, seq }">
        <Select size="large" v-model:value="matchDataList[seq-1].platform" :options="PLATFORM"/>
      </template>

      <template #advertiserId="{ row, seq }">
        <Input v-model:value="matchDataList[seq-1].advertiserId"/>
      </template>

      <template #campaignId="{ row, seq }">
        <Input v-model:value="matchDataList[seq-1].campaignId"/>
      </template>

      <template #adgroupId="{ row, seq }">
        <Input v-model:value="matchDataList[seq-1].adgroupId"/>
      </template>

      <template #promotionId="{ row, seq }">
        <Input v-model:value="matchDataList[seq-1].promotionId"/>
      </template>

      <template #creativeId="{ row, seq }">
        <Input v-model:value="matchDataList[seq-1].creativeId"/>
      </template>

      <template #matchId="{ row, seq }">
        <Input v-model:value="matchDataList[seq-1].matchId"/>
      </template>

      <template #action="{ row, seq }">
        <Button type="link" @click="copyMatchData(row)">
          {{ $t('core.copy') }}
        </Button>
        <Button type="link" @coll="delMatchData(seq)">
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
    <Button block class="mt-5" type="dashed" @click="addMatchCol"> {{
        $t('common.create')
      }}
    </Button>
  </Page>
</template>

<style scoped>

</style>
