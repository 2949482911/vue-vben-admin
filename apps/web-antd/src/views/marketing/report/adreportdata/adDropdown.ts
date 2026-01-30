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

  const loadedMap: Record<LoadedKey, boolean> = {
    campaign: false,
    promotion: false,
    adgroup: false,
    creative: false,
  }

  let gridApi: any = null

  /** 后注入 gridApi */
  function setGridApi(api: any) {
    gridApi = api
  }

  async function resetLoadedMap() {
    loadedMap.campaign = false
    loadedMap.promotion = false
    loadedMap.adgroup = false
    loadedMap.creative = false

    if (gridApi) {
      await gridApi.formApi.setValues({
        campaign_id: [],
        promotion_id: [],
        adgroup_id: [],
        creative_id: [],
      })
    }
  }

  async function loadAdLinkage(value: LoadedKey, forceReload = false) {
    if (!gridApi) return

    const params = await gridApi.formApi.getValues()
    if (!params.platform?.length || !params.advertiserId?.length) return
    if (!forceReload && loadedMap[value]) return

    const res = await reportApi.fetchAdLinkage({
      platform: params.platform[0],
      platformAccountIds: params.advertiserId,
      type: value,
    })

    switch (value) {
      case 'campaign':
        planOptions.value = res.map((i: any) => ({ label: i.campaign_name, value: i.campaign_id }))
        break
      case 'promotion':
        advertisementOptions.value = res.map((i: any) => ({ label: i.promotion_name, value: i.promotion_id }))
        break
      case 'adgroup':
        adGroupOptions.value = res.map((i: any) => ({ label: i.adgroup_name, value: i.adgroup_id }))
        break
      case 'creative':
        creativityOptions.value = res.map((i: any) => ({ label: i.title, value: i.creative_id }))
        break
    }

    loadedMap[value] = true
  }

  return {
    planOptions,
    advertisementOptions,
    adGroupOptions,
    creativityOptions,
    loadAdLinkage,
    resetLoadedMap,
    setGridApi, // 暴露出来
  }
}
