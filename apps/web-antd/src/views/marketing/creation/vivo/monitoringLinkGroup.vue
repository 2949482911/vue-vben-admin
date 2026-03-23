<script lang="ts" setup>
import { useVbenModal } from '@vben/common-ui';
import { RadioGroup, RadioButton, Input } from 'ant-design-vue';
import { ref } from 'vue';
import { useVbenForm } from '#/adapter/form';
import type { AccountInfo } from '../creation';

const emit = defineEmits(['update:monitoringLinkGroup'])

const { accountInfo, monitoringLink } = defineProps({
  accountInfo: {
    type: Array as () => AccountInfo[],
    default: () => ([])
  },
  monitoringLink:{
    type: Object,
    default: () => ({
      clickLink:'',
      exposureLink:'',
      monitorLink:'',
      linkModeType:'manual',
      allocateType:'all',
    })
  }
})

//选中的账户
const activeAccountId = ref<string>();

const localMonitoringLink = ref({
  clickLink:'',
  exposureLink:'',
  monitorLink:'',
  linkModeType:'manual',
  allocateType:'all',
})

const [Modal,modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if(isOpen){
      defaultPreferred()
    }
  },
  async onConfirm(){
    const data = await formApi.getValues()
    const finalData = {
      ...localMonitoringLink.value, // 获取 RadioGroup 和 监测链接 的值
      clickLink: data.clickLink,
      exposureLink: data.exposureLink,
    };
    emit('update:monitoringLinkGroup',finalData)
    await formApi.resetForm()
    localMonitoringLink.value.linkModeType = 'manual'
    localMonitoringLink.value.allocateType = 'all'
    localMonitoringLink.value.monitorLink= ''
    await modalApi.close()
  },
  async onCancel(){
    await formApi.resetForm()
    localMonitoringLink.value.linkModeType = 'manual'
    localMonitoringLink.value.allocateType = 'all'
    localMonitoringLink.value.monitorLink= ''
    await modalApi.close()
  }
});

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 56,
    labelClass: 'mr-6',
  },
  layout: 'horizontal',
  schema: [
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'clickLink',
      label: '点击链接',
    },
    {
      component: "Input",
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'exposureLink',
      label: '曝光链接',
    },
  ],
});

function defaultPreferred(){
  localMonitoringLink.value.allocateType = monitoringLink.allocateType
  localMonitoringLink.value.linkModeType = monitoringLink.linkModeType
  localMonitoringLink.value.monitorLink = monitoringLink.monitorLink
  formApi.setValues({
    clickLink: monitoringLink.clickLink,
    exposureLink: monitoringLink.exposureLink,
  });
  if (accountInfo.length > 0) {
    activeAccountId.value = accountInfo[0]?.localAdvertiserId;
  }
}

// 处理点击左侧切换
const handleSelectAccount = (id: string) => {
  activeAccountId.value = id;
  // 这里可以根据 ID 去 formApi 重置或加载对应账号的数据
};
</script>

<template>
  <Modal title="事件资产和监测链接组" :width="1000">
    <div style="font-size: 14px;">
      监测连接模式
      <RadioGroup style="margin-left: 10px;" v-model:value="localMonitoringLink.linkModeType">
        <!-- <RadioButton value="ocpx">Ocpx</RadioButton> -->
        <RadioButton value="manual">手动输入</RadioButton>
      </RadioGroup>
    </div>

    <div class="allocateBody">
      <div class="title">选择活动</div>
      
      <div class="allocate-container">
        <div class="allocate-header">
          分配方式
          <RadioGroup style="margin-left: 10px;" v-model:value="localMonitoringLink.allocateType">
            <RadioButton value="all">全部相同</RadioButton>
            <!-- <RadioButton value="allocate">按账户分配</RadioButton> -->
          </RadioGroup>
        </div>

        <div class="allocate-main">
          <div class="account-content">
            <div class="form-inner">
              <div class="formCla">
                
                <div class="account-sidebar" v-if="localMonitoringLink.allocateType === 'allocate'">
                  <div 
                    v-for="item in accountInfo" 
                    :key="item.localAdvertiserId"
                    :class="['account-item', activeAccountId === item.localAdvertiserId ? 'is-active' : '']"
                    @click="handleSelectAccount(item.localAdvertiserId)"
                  >
                    <div class="info">
                      <div class="name">{{ item.advertiserName }}</div>
                      <div class="id">ID: {{ item.localAdvertiserId }}</div>
                    </div>
                  </div>
                </div>

                <div class="right-content">
                  
                  <div class="single-link-item" v-if="localMonitoringLink.linkModeType === 'ocpx'">
                    <div class="label">监测链接</div>
                    <Input v-model:value="localMonitoringLink.monitorLink" placeholder="请输入" style="flex: 1;" />
                  </div>

                  <div class="form-wrapper" v-else-if="localMonitoringLink.linkModeType === 'manual'">
                    <Form />
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.allocateBody {
  margin-top: 15px;

  .title {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 700;
  }

  // 外层大容器
  .allocate-container {
    overflow: hidden;
    // background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;

    // 头部：分配方式选择区
    .allocate-header {
      padding: 12px 20px;
      font-size: 14px;
      // background-color: #fff;
      border-bottom: 1px solid #e5e7eb;
    }

    // 主体内容区（高度固定）
    .allocate-main {
      height: 450px;
      
      .account-content,
      .form-inner {
        height: 100%;
      }

      // 核心弹性布局容器
      .formCla {
        display: flex;
        height: 100%;
        overflow: hidden;

        // --- 左侧：账户侧边栏 ---
        .account-sidebar {
          flex-shrink: 0;
          width: 188px;
          overflow-y: auto;
          // background-color: #f8fafc;
          border-right: 1px solid #e5e7eb;

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 2px;
          }

          .account-item {
            padding: 15px 20px;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
            transition: all 0.2s ease-in-out;

            .name {
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 14px;
              color: #1f2937;
              white-space: nowrap;
            }

            .id {
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 12px;
              color: #64748b;
              white-space: nowrap;
            }

            &:hover:not(.is-active) {
              background-color: #f1f5f9;
            }

            &.is-active {
              background-color: #006be6;

              .name, .id {
                color: #fff;
              }
            }
          }
        }

        // --- 右侧：表单或输入框容器 ---
        .right-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          height: 100%;
          padding: 20px;
          overflow-y: auto;

          // 单行监测链接样式 (OCPX 模式)
          .single-link-item {
            display: flex;
            gap: 12px;
            align-items: center;
            width: 100%;
            
            .label {
              flex-shrink: 0;
              width: 70px;
              font-size: 14px;
            }
          }

          // Form 组件包装层 (手动模式)
          .form-wrapper {
            width: 100%;
            max-width: 650px;

            :deep(.vben-form) {
              padding: 0 !important;
              
              .ant-form-item {
                margin-bottom: 16px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
