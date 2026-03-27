<script setup lang="ts">
import {Card, Divider, Button} from 'ant-design-vue';
import {computed} from 'vue';
import type {AccountInfo, Material, MaterialData} from "#/views/marketing/creation/creation";

const emit = defineEmits(['update:clearCreativeMaterialsDrawerConfig','update:clearCreativeMaterialsGroupList'])

const { accountInfo, material} = defineProps({
  // 媒体账户
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => ([])
  },
  // 创意组（视频和图片）
  material: {
    type: Object as () => MaterialData, // 使用定义的接口
    default: () => ({
      config: { method: 'all' },
      data: new Map<string, Material[]>()
    })
  },
});

async function allClear() {
  const resetMaterial: MaterialData = {
    config: {
      method: "all",
    },
    data: new Map<string, Material[]>
  };
  const resetPromotion = {
    groupId: '',
    name: '',
    deepLink: '',
    videoAttribution: 0,
    pageUrl: '',
    h5Code: '',
    h5Type: 0,
    generalSwitch: 0,
    config: {
      videoMaxCount: 5,
      imageMaxCount: 5,
      materialNormId: 0,
      placeType: 0,
      strongReminder: 0,
      virtualPositionId: ""
    }
  };
  emit('update:clearCreativeMaterialsDrawerConfig',resetPromotion)
  emit('update:clearCreativeMaterialsGroupList',resetMaterial)
}

// 判断当前是否有创意组数据可以清空
const isClearDisabled = computed(() => {
  return material.data.size === 0;
});

function accountInfoName(id:string){
  const advertiserName = accountInfo.find(item=>item.localAdvertiserId===id) || {localAdvertiserId:0,advertiserName:''}
  return advertiserName.advertiserName
}
</script>

<template>
  <div class="projectCard">
    <div class="title">广告创意素材组</div>
    <Divider type="horizontal"/>
    <div class="infoTop">
      <div class="title">分配方式：
        <span style="color: #006be6;">
          {{ material.config.method === 'all' ? '全部相同' : '按账户分配' }}
        </span>
      </div>
      <Button type="primary" danger :disabled="isClearDisabled" @click="allClear">清空</Button>
    </div>
    <Card class="infoBody">
      <div v-if="material.data.size === 0" class="empty-status">
        <div class="empty-text">暂无数据，请点击下方按钮添加</div>
      </div>
      <template v-if="material.config.method === 'all'">
        <div v-for="(group,index) in material.data.get('0')" :key="index" class="display-group">
          <div class="group-header">
            <span class="name">{{ `创意组 ${index + 1}` }}</span>
            <span class="stats">已选：
              <span class="text-blue">{{ group.video.length }}个视频</span>
              <span class="text-blue ml-2">{{ group.image.length }}个图片</span>
            </span>
          </div>
          <div class="asset-preview-grid">
            <div v-for="v in group.video" :key="v.localMaterialId" class="preview-item">
              <img :src="v.url"/>
              <div class="play-mask">▶</div>
            </div>
            <div v-for="img in group.image" :key="img.localMaterialId" class="preview-item">
              <img :src="img.url"/>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="[acc,materialData] in material.data" :key="acc" class="account-block">
          <div class="account-title">{{ accountInfoName(acc) }}</div>
          <div v-for="(group,index) in materialData" :key="index" class="display-group inner">
            <div class="group-header">
              <span class="name">{{ `创意组 ${index + 1}` }}</span>
              <span class="stats">
                已选：
                <span class="text-blue">{{ group.video.length }}个视频</span>
                <span class="text-blue ml-2">{{ group.image.length }}个图片</span>
              </span>
            </div>
            <div class="asset-preview-grid">
              <div v-for="v in group.video" :key="v.localMaterialId" class="preview-item small">
                <img :src="v.url"/>
                <div class="play-mask">▶</div>
              </div>
              <div v-for="img in group.image" :key="img.localMaterialId" class="preview-item small">
                <img :src="img.url"/>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
    <Divider type="horizontal"/>
  </div>
</template>

<style scoped lang="scss">
.projectCard {
  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .infoTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .btnCla {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .infoBody {
    height: 500px;
    margin: 10px 0 0;
    overflow-y: auto;

    .empty-status {
      padding: 40px 0;
      color: #999;
      text-align: center;
    }
  }

  .display-group {
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #e4e4e4;
    border-radius: 4px;
    // background: #f8f9fa;

    .group-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;

      .name {
        font-weight: bold;
        // color: #666;
      }

      .text-blue {
        color: #006be6;
      }
    }
  }

  .account-block {
    padding: 10px;
    margin-bottom: 10px;
    background: #f8f9fa;

    .account-title {
      padding-bottom: 8px;
      margin-bottom: 12px;
      font-weight: bold;
      border-bottom: 1px solid #eee;
    }
  }

  .asset-preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .preview-item {
    position: relative;
    width: 80px;
    height: 100px;
    overflow: hidden;
    background: #000;
    border-radius: 4px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .play-mask {
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      font-size: 18px;
      color: #fff;
      background: rgb(0 0 0 / 30%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    &.small {
      width: 60px;
      height: 80px;
    }
  }

  .ml-2 {
    margin-left: 8px;
  }
}
</style>
