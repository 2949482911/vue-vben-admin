<script setup lang="ts" name="MatchTable">
import {Page} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import type {OcpxPlatformMatch} from "#/api/models";
import {$t} from "@vben/locales";
import {Button, Input} from "ant-design-vue";
import {ref} from "vue";

const matchDataList = []

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
  pagerConfig: {
    enabled: false,
  },
};


const [Grid, gridApi] = useVbenVxeGrid({gridOptions});

function addMatchCol() {
  console.log(matchDataList.value)
  matchDataList.push({
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

</script>

<template>
  <Page>
    <Grid>
      <template #advertiserId="{ row, seq }">
        <Input v-model:value="matchDataList[seq].advertiserId"/>
      </template>

      <template #campaignId="{ row, seq }">
        <Input v-model:value="matchDataList[seq].campaignId"/>
      </template>

      <template #adgroupId="{ row, seq }">
        <Input v-model:value="matchDataList[seq].adgroupId"/>
      </template>

      <template #promotionId="{ row, seq }">
        <Input v-model:value="matchDataList[seq].promotionId"/>
      </template>

      <template #creativeId="{ row, seq }">
        <Input v-model:value="matchDataList[seq].creativeId"/>
      </template>

      <template #matchId="{ row, seq }">
        <Input v-model:value="matchDataList[seq].matchId"/>
      </template>

      <template #action="{ row }">
        <Button type="link">
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
