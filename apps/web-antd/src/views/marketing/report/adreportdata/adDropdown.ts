import { ref } from 'vue'
import { reportApi } from '#/api'

export type LoadedKey = 'campaign' | 'promotion' | 'adgroup' | 'creative'

interface OptionsType {
  label: string
  value: string
}

export function useAdLinkage() {
  const planOptions = ref<OptionsType[]>([])
  const advertisementOptions = ref<OptionsType[]>([])
  const adGroupOptions = ref<OptionsType[]>([])
  const creativityOptions = ref<OptionsType[]>([])
  
  // 只需要一个 formApi，不需要维护两个
  let formApi: any = null
  
  const loadedMap: Record<LoadedKey, boolean> = {
    campaign: false,
    promotion: false,
    adgroup: false,
    creative: false,
  }

  /** 设置表单API（由外部组件注入） */
  function setFormApi(api: any) {
    formApi = api
  }

  /** 重置联动数据 */
  async function resetLoadedMap() {
    loadedMap.campaign = false
    loadedMap.promotion = false
    loadedMap.adgroup = false
    loadedMap.creative = false

    // 清空关联的字段值
    if (formApi) {
      await formApi.setValues({
        campaign_id: [],
        promotion_id: [],
        adgroup_id: [],
        creative_id: [],
      })
    }
  }

  /** 加载联动数据 */
  async function loadAdLinkage(value: LoadedKey, forceReload = false) {
    // 检查必要条件
    if (!formApi) {
      console.warn('formApi not set, please call setFormApi first')
      return
    }
    
    // 获取当前表单值
    const formValues = await formApi.getValues()
    
    // 验证必要字段
    if (!formValues.platform?.length || !formValues.advertiserId?.length) {
      console.warn('Missing required fields: platform or advertiserId')
      return
    }
    
    // 检查是否已加载（非强制刷新）
    if (!forceReload && loadedMap[value]) return

    try {
      const res = await reportApi.fetchAdLinkage({
        platform: formValues.platform[0], // 取第一个平台
        platformAccountIds: formValues.advertiserId,
        type: value,
      })

      // 更新对应的选项列表
      switch (value) {
        case 'campaign':
          planOptions.value = res.map((i: any) => ({ 
            label: i.campaign_name, 
            value: i.campaign_id 
          }))
          break
        case 'promotion':
          advertisementOptions.value = res.map((i: any) => ({ 
            label: i.promotion_name, 
            value: i.promotion_id 
          }))
          break
        case 'adgroup':
          adGroupOptions.value = res.map((i: any) => ({ 
            label: i.adgroup_name, 
            value: i.adgroup_id 
          }))
          break
        case 'creative':
          creativityOptions.value = res.map((i: any) => ({ 
            label: i.title, 
            value: i.creative_id 
          }))
          break
      }

      loadedMap[value] = true
    } catch (error) {
      console.error(`Failed to load ${value} linkage data:`, error)
      // 失败时重置加载标记，允许重试
      loadedMap[value] = false
    }
  }

  return {
    // 响应式数据
    planOptions,
    advertisementOptions,
    adGroupOptions,
    creativityOptions,
    
    // 方法
    loadAdLinkage,
    resetLoadedMap,
    setFormApi, // 只需要这一个注入方法
  }
}
