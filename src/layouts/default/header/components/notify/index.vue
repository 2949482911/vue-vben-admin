<template>
  <div :class="prefixCls">
    <Popover title="" trigger="click" :overlayClassName="`${prefixCls}__overlay`">
      <Badge :count="count" dot :numberStyle="numberStyle">
        <BellOutlined />
      </Badge>
      <template #content>
        <Tabs>
          <Tabs.TabPane key="notice">
            <template #tab>
              通知
              <span v-if="noticeList.length !== 0">({{ noticeList.length }})</span>
            </template>
            <NoticeList2 :list="noticeList" @title-click="onNoticeClick" />
          </Tabs.TabPane>

          <Tabs.TabPane key="message">
            <template #tab>
              代办
              <!--                <span v-if="item.list.length !== 0">({{ item.list.length }})</span>-->
            </template>
            <!-- 绑定title-click事件的通知列表中标题是“可点击”的-->
            <!--              <NoticeList :list="item.list" v-if="item.key === '1'" @title-click="onNoticeClick"/>-->
            <!--              <NoticeList :list="item.list" v-else/>-->
          </Tabs.TabPane>

          <Tabs.TabPane key="message">
            <template #tab>
              消息
              <!--                <span v-if="item.list.length !== 0">({{ item.list.length }})</span>-->
            </template>
            <!-- 绑定title-click事件的通知列表中标题是“可点击”的-->
            <!--              <NoticeList :list="item.list" v-if="item.key === '1'" @title-click="onNoticeClick"/>-->
            <!--              <NoticeList :list="item.list" v-else/>-->
          </Tabs.TabPane>
        </Tabs>
      </template>
    </Popover>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, onMounted } from 'vue';
  import { Popover, Tabs, Badge } from 'ant-design-vue';
  import { BellOutlined } from '@ant-design/icons-vue';
  import { tabListData } from './data';
  import NoticeList2 from './NoticeList2.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { getNoticeReadList, noticeRead } from '@/api/demo/system';
  import { NoticeItem } from '@/api/demo/model/notice';

  const { prefixCls } = useDesign('header-notify');
  // const {createMessage} = useMessage();
  const noticeList = ref<NoticeItem[]>([]);
  const numberStyle = {};

  const count = computed(() => {
    let count = 0;
    for (let i = 0; i < tabListData.length; i++) {
      count += tabListData[i].list.length;
    }
    return count;
  });

  function _getNoticeReadList() {
    getNoticeReadList().then((res) => {
      noticeList.value = res;
      console.log(noticeList);
    });
  }

  onMounted(() => {
    _getNoticeReadList();
  });

  function onNoticeClick(record: NoticeItem) {
    if (record.isRead) {
      return;
    }
    // 可以直接将其标记为已读（为标题添加删除线）,此处演示的代码会切换删除线状态
    noticeRead([record.id]).then(() => {
      record.isRead = !record.isRead;
    });
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-notify';

  .@{prefix-cls} {
    padding-bottom: 1px;

    &__overlay {
      max-width: 360px;
    }

    .ant-tabs-content {
      width: 300px;
    }

    .ant-badge {
      display: flex;
      align-items: center;
      font-size: 18px;

      .ant-badge-multiple-words {
        padding: 0 4px;
      }

      svg {
        width: 0.9em;
      }
    }
  }
</style>
