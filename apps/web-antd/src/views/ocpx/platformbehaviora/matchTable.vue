<script setup lang="ts" name="MatchTable">
import {Page} from '@vben/common-ui';
import {useVbenVxeGrid, type VxeGridProps} from '#/adapter/vxe-table';
import type {OcpxPlatformMatch} from "#/api/models";
import {$t} from "@vben/locales";
import {Button, Input} from "ant-design-vue";
import {ref} from "vue";

const matchDataList = ref<OcpxPlatformMatch[]>([
  {
    advertiserId: "账户ID",
    campaignId: "计划ID",
    adgroupId: "组ID",
    promotionId: "推广ID",
    creativeId: "创意ID",
    matchId: "匹配ID",
  }
])

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
      editRender: {
        name: 'input',
      }
    },
    {
      field: 'adgroupId',
      title: `${$t('ocpx.behavioraplatform.columns.adgroupId')}`,
      editRender: {
        name: 'input',
      }
    },
    {
      field: 'promotionId',
      title: `${$t('ocpx.behavioraplatform.columns.promotionId')}`,
      editRender: {
        name: 'input',
      }
    },
    {
      field: 'creativeId',
      title: `${$t('ocpx.behavioraplatform.columns.creativeId')}`,
      editRender: {
        name: 'input',
      }
    },
    {
      field: 'matchId',
      title: `${$t('ocpx.behavioraplatform.columns.matchId')}`,
      editRender: {
        name: 'input',
      }
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
  data: matchDataList.value,
  editConfig: {
    mode: 'row',
    trigger: 'click',
  },
};


const [Grid, gridApi] = useVbenVxeGrid({gridOptions});

function addMatchCol() {
  console.log(matchDataList.value)
  matchDataList.value.push({
    advertiserId: "",
    campaignId: "",
    adgroupId: "",
    promotionId: "",
    creativeId: "",
    matchId: "",
  })
  gridApi.setGridOptions({data: matchDataList.value})
}

</script>

<template>
  <Page>
    <Grid>
      <template #advertiserId="{ row }">
        <Input :value="row.advertiserId"/>
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
