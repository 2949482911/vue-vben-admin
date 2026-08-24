<script setup lang="ts" name="MaterialAnalysisOverview">
/**
 * 素材概览卡片
 *
 * 展示素材总数、使用中、起量、衰退数量及平均CTR/CVR/ROI
 */
import { Card, Col, Row, Statistic } from 'ant-design-vue';
import type { MaterialOverview } from '#/api/models';

defineProps<{
  data: MaterialOverview | null;
  loading?: boolean;
}>();
</script>

<template>
  <Row :gutter="16" class="overview-row">
    <Col :span="4">
      <Card :loading="loading">
        <Statistic
          title="素材总数"
          :value="data?.totalMaterials || 0"
          :value-style="{ fontSize: '24px', fontWeight: 600 }"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="loading">
        <Statistic
          title="使用中"
          :value="data?.activeMaterials || 0"
          :value-style="{ fontSize: '24px', fontWeight: 600, color: '#52c41a' }"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="loading">
        <Statistic
          title="新起量"
          :value="data?.growingMaterials || 0"
          :value-style="{ fontSize: '24px', fontWeight: 600, color: '#1668dc' }"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="loading">
        <Statistic
          title="衰退中"
          :value="data?.decliningMaterials || 0"
          :value-style="{ fontSize: '24px', fontWeight: 600, color: '#fa8c16' }"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="loading">
        <Statistic
          title="平均CTR"
          :value="data?.avgCtr || 0"
          suffix="%"
          :value-style="{ fontSize: '24px', fontWeight: 600 }"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="loading">
        <Statistic
          title="平均ROI"
          :value="data?.avgRoi || 0"
          :precision="2"
          :value-style="{ fontSize: '24px', fontWeight: 600 }"
        />
      </Card>
    </Col>
  </Row>
</template>

<style scoped lang="scss">
.overview-row {
  margin-bottom: 16px;

  :deep(.ant-card-body) {
    padding: 16px 20px;
  }
}
</style>
