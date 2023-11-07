<template>
  <PageWrapper
    :title="`用户[` + userInfoData.aegisAuth.nickname + `]的资料`"
    content="这是用户资料详情页面。本页面仅用于演示相同路由在tab中打开多个页面并且显示不同的数据"
    contentBackground
    @back="goBack"
  >
    <template #extra>
      <a-button type="primary" danger> 禁用账号 </a-button>
      <a-button type="primary"> 修改密码 </a-button>
    </template>
    <template #footer>
      <tabs default-active-key="detail" v-model:activeKey="currentKey">
        <tab-pane key="detail" tab="用户资料" />
        <tab-pane key="logs" tab="操作日志" />
      </tabs>
    </template>
    <div class="pt-4 m-4 desc-wrap">
      <template v-if="currentKey == 'detail'">
        <div v-for="i in 10" :key="i">这是用户{{ userId }}资料Tab</div>
      </template>
      <template v-if="currentKey == 'logs'">
        <div v-for="i in 10" :key="i">这是用户{{ userId }}操作日志Tab</div>
      </template>
    </div>
  </PageWrapper>
</template>

<script lang="ts">
  import { ref, defineComponent, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { useGo } from '/@/hooks/web/usePage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { TabPane, Tabs } from 'ant-design-vue';
  import { userInfo } from '/@/api/demo/system';
  import { UserInfo } from '/@/api/demo/model/systemModel';

  export default defineComponent({
    name: 'AccountDetail',
    components: { Tabs, TabPane, PageWrapper },
    setup() {
      const route = useRoute();
      const go = useGo();

      const userId = ref(route.params?.id);
      const currentKey = ref('detail');
      const { setTitle } = useTabs();
      setTitle('详情：用户' + userId.value);

      function goBack() {
        // 本例的效果时点击返回始终跳转到账号列表页，实际应用时可返回上一页
        go('/system/account');
      }
      const userInfoData = ref<UserInfo>({
        aegisAuth: {},
        dataRange: {},
        menuList: [],
        roleList: [],
      });
      async function getUserInfo() {
        userInfoData.value = await userInfo(String(userId.value));
      }

      onMounted(() => {
        getUserInfo();
      });
      return {
        goBack,
        currentKey,
        userId,
        userInfoData,
      };
    },
  });
</script>

<style></style>
