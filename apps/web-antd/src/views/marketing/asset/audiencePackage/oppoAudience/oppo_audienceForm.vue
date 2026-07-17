<script lang="ts" setup>
import { useVbenForm } from '@vben/common-ui';
import { RadioGroup, RadioButton, CheckboxGroup, Select } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { oppoTagData } from './oppoTagData';
import { oppo_advertisementApi } from '#/api';
import TreeSelector from '../TreeSelector.vue';
import type { IndustryTag, PhoneSeriesItem, UnionAppsTag, WeatherShowListType } from '#/api/models';
import type { AdOppoConfig } from '../audiencePackageType';

const props = defineProps<{
  advertiserId?: string;
}>();

// 封装统一的数据加载函数（await Promise.all 确保所有接口返回后才继续）
async function loadAdvertiserData(advertiserId: string) {
  await Promise.all([
    getRegionList(advertiserId),
    getModelList(advertiserId),
    getInstallAppList(advertiserId),
    getInterestTag(advertiserId),
    getAllianceApp(advertiserId),
  ]);
}

// 广告主切换时重新加载数据（不用 immediate，避免初始化时 advertiserId 未就绪就提前发请求）
watch(
  () => props.advertiserId,
  (newId) => {
    if (newId) {
      loadAdvertiserData(newId);
    }
  },
);

const regionData = ref([]);
const modelData = ref<PhoneSeriesItem[]>([]);
const industryTagData = ref<IndustryTag[]>([]);
const unionAppsData = ref<UnionAppsTag[]>([]);
const weatherShowListData = ref<WeatherShowListType[]>([]);
const appInstall = ref<{ id: string; name: string }[]>([]);
const oppoConfig = ref({
  delStatus: 0,
  region: [],
  mobileModel: [],
  sex: 0,
  ageNew: [],
  network: [],
  installAppList: [],
  preInstallAppList: [],
  unPreInstallAppList: [],
  notInstallAppList: [],
  permanentRegion: [],
  appActive: [],
  appNotActive: [],
  interestTagsV2: [],
  unionAppId: [],
  unionAppIdRe: [],
  immutable: 0,
  type: 0,
  audience: '',
  pTargetId: 0,
  oppAudienceId: 0,
  appActiveDays: 0,
  appNotActiveDays: 0,
  audienceCount: 0,
  imeiType: 0,
  yesterdayInstalledApp: [],
  weatherCode: [],
  installedNeverActiveAppList: [],
  filterConvertedAd: null,
  appUninstallDays: 0,
  neverInstallAppList: [],
  promoteAppInstall: '999',
  appActiveAndOr: null,
  appNotActiveAndOr: null,
  historyNeverActiveAppList: '',
  historyNeverActiveAndOr: null,
  audienceIds: '',
  oppAudienceIds: '',
});

/**处理枚举公用方法 */
const getTagOptions = (key: string) => {
  const list = (oppoTagData as any)?.data?.[key] || [];
  return list.map((item: any) => ({
    label: item.tagName,
    value: item.id,
  }));
};

/**
 * 切换“不限/设置”单选框时的清空公用方法
 * @param val 当前选中的单选框值 (包含字符串'0'、数字0、数字999等“不限”值)
 * @param configKey oppoConfig 对象内部对应的属性名
 * @param fieldName 可选：Vben Form 对应的字段名（如果是纯自定义 Slot 没在 Schema 注册则不传）
 */
const handleTargetingChange = (val: any, configKey: string, fieldName?: string) => {
  // 判断是否切换为了“不限” (兼容 '0', 0, 999)
  if (val === '0' || val === 0 || val === '999') {
    // 1. 清空自定义的大存储对象 oppoConfig 内部的值
    if (configKey && (oppoConfig.value as any)[configKey] !== undefined) {
      // 根据原数据类型，优雅地回归初始状态
      const originVal = (oppoConfig.value as any)[configKey];
      (oppoConfig.value as any)[configKey] = Array.isArray(originVal) ? [] : undefined;
    }

    // 2. 同步清空 Vben Form 内部收集的表单值
    if (fieldName) {
      formApi.setFieldValue(
        fieldName,
        Array.isArray((oppoConfig.value as any)[configKey]) ? [] : undefined,
      );
    }
  }
};

//获取地域元接口
async function getRegionList(advertiserId: string) {
  const res = await oppo_advertisementApi.fetchOppoAdvertisement({
    queryType: 0,
    advertiserId: [advertiserId],
  });
  regionData.value = res;
}

//获取机型元接口
async function getModelList(advertiserId: string) {
  const res = await oppo_advertisementApi.fetchOppoMetadata({
    advertiserId: [advertiserId],
  });
  modelData.value = res[0].mobiles.map((item: PhoneSeriesItem) => ({
    label: item.name,
    value: item.id,
  }));
  await formApi.updateSchema([
    { fieldName: 'mobileModel', componentProps: { options: modelData.value } },
  ]);
  weatherShowListData.value = res[0].weatherShowList?.map((item: WeatherShowListType) => ({
    label: item.weatherName,
    value: item.weatherCode,
  }));
  await formApi.updateSchema([
    { fieldName: 'weatherCode', componentProps: { options: weatherShowListData.value } },
  ]);
}

//获取应用已安装元接口(与所有通过定向APP元数据接口获取通用)
async function getInstallAppList(advertiserId: string) {
  const res = await oppo_advertisementApi.fetchOppoMetadataApp({
    advertiserId: [advertiserId],
  });
  appInstall.value = res.map((item: { id: string; name: string }) => ({
    label: item.name,
    value: item.id,
  }));
  await formApi.updateSchema([
    { fieldName: 'installAppList', componentProps: { options: appInstall.value } },
  ]);
  await formApi.updateSchema([
    { fieldName: 'preInstallAppList', componentProps: { options: appInstall.value } },
  ]);
  await formApi.updateSchema([
    { fieldName: 'unPreInstallAppList', componentProps: { options: appInstall.value } },
  ]);
  await formApi.updateSchema([
    { fieldName: 'notInstallAppList', componentProps: { options: appInstall.value } },
  ]);
  await formApi.updateSchema([
    { fieldName: 'yesterdayInstalledApp', componentProps: { options: appInstall.value } },
  ]);
  await formApi.updateSchema([
    { fieldName: 'installedNeverActiveAppList', componentProps: { options: appInstall.value } },
  ]);
  await formApi.updateSchema([
    { fieldName: 'neverInstallAppList', componentProps: { options: appInstall.value } },
  ]);
}

//获取兴趣标签接口
async function getInterestTag(advertiserId: string) {
  const res = await oppo_advertisementApi.fetchOppoInterestTag({
    advertiserId: [advertiserId],
  });
  industryTagData.value = res.map((item: IndustryTag) => ({
    label: item.name,
    value: item.id,
  }));
  await formApi.updateSchema([
    { fieldName: 'interestTagsV2', componentProps: { options: industryTagData.value } },
  ]);
}

//获取联盟AppId\联盟App反向接口
async function getAllianceApp(advertiserId: string) {
  const res = await oppo_advertisementApi.fetchOppoMetadataUapp({
    advertiserId: [advertiserId],
  });
  unionAppsData.value = res.unionApps?.map((item: UnionAppsTag) => ({
    label: item.name,
    value: item.id,
  }));
}

/** 将数组转成逗号拼接字符串，非数组值原样返回 */
const arrayToString = (val: any): any => {
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(',') : '';
  }
  return val;
};

/**
 * 将逗号拼接字符串还原为数组；
 * '999' / 999 视为"不限"标志，直接返回空数组；
 * 已经是数组则原样返回
 */
const stringToArray = (val: any): string[] => {
  if (!val && val !== 0) return [];
  if (Array.isArray(val)) return val.map(String);
  const str = String(val).trim();
  if (str === '' || str === '999') return [];
  return str.split(',').map((s) => s.trim());
};

/**关闭弹框提交oppoConfig */
async function submitOppoConfig() {
  const formValue = await formApi.getValues();
  const result = {
    delStatus: oppoConfig.value.delStatus,
    region: arrayToString(oppoConfig.value.region),
    mobileModel: arrayToString(formValue.mobileModel),
    sex: oppoConfig.value.sex !== 0 ? oppoConfig.value.sex : undefined,
    ageNew: ageType.value === '1' ? arrayToString(oppoConfig.value.ageNew) : '999',
    network: networkType.value === '0' ? '' : arrayToString(oppoConfig.value.network),
    installAppList: arrayToString(formValue.installAppList),
    preInstallAppList: arrayToString(formValue.preInstallAppList),
    unPreInstallAppList: arrayToString(formValue.unPreInstallAppList),
    notInstallAppList: arrayToString(formValue.notInstallAppList),
    permanentRegion: arrayToString(oppoConfig.value.permanentRegion),
    appActive: appActiveType.value === '0' ? '999' : arrayToString(oppoConfig.value.appActive),
    appNotActive:
      appNotActiveType.value === '0' ? '999' : arrayToString(oppoConfig.value.appNotActive),
    interestTagsV2: arrayToString(formValue.interestTagsV2),
    unionAppId: arrayToString(formValue.unionAppId),
    unionAppIdRe: arrayToString(formValue.unionAppIdRe),
    immutable: oppoConfig.value.immutable,
    type: oppoConfig.value.type === 0 ? '' : oppoConfig.value.type,
    audience: formValue.audience,
    pTargetId: formValue.pTargetId,
    oppAudienceId: formValue.oppAudienceId,
    appActiveDays: formValue.appActiveDays,
    appNotActiveDays: formValue.appNotActiveDays,
    audienceCount: formValue.audienceCount,
    imeiType: oppoConfig.value.imeiType,
    yesterdayInstalledApp: arrayToString(formValue.yesterdayInstalledApp),
    weatherCode: arrayToString(formValue.weatherCode),
    installedNeverActiveAppList: arrayToString(formValue.installedNeverActiveAppList),
    filterConvertedAd: formValue.filterConvertedAd,
    appUninstallDays: formValue.appUninstallDays,
    neverInstallAppList: arrayToString(formValue.neverInstallAppList),
    promoteAppInstall: oppoConfig.value.promoteAppInstall,
    appActiveAndOr: formValue.appActiveAndOr,
    appNotActiveAndOr: formValue.appNotActiveAndOr,
    historyNeverActiveAppList: formValue.historyNeverActiveAppList,
    historyNeverActiveAndOr: formValue.historyNeverActiveAndOr,
    audienceIds: formValue.audienceIds,
    oppAudienceIds: formValue.oppAudienceIds,
  };
  return result;
}

/**关闭弹框时清空oppoConfig */
async function popUpOppoCancel() {
  await formApi.resetForm();
  regionType.value = '0';
  ageType.value = '999';
  networkType.value = '0';
  permanentRegionType.value = '0';
  appActiveType.value = '0';
  appNotActiveType.value = '0';
  oppoConfig.value = {
    delStatus: 0,
    region: [],
    mobileModel: [],
    sex: 0,
    ageNew: [],
    network: [],
    installAppList: [],
    preInstallAppList: [],
    unPreInstallAppList: [],
    notInstallAppList: [],
    permanentRegion: [],
    appActive: [],
    appNotActive: [],
    interestTagsV2: [],
    unionAppId: [],
    unionAppIdRe: [],
    immutable: 0,
    type: 0,
    audience: '',
    pTargetId: 0,
    oppAudienceId: 0,
    appActiveDays: 0,
    appNotActiveDays: 0,
    audienceCount: 0,
    imeiType: 0,
    yesterdayInstalledApp: [],
    weatherCode: [],
    installedNeverActiveAppList: [],
    filterConvertedAd: null,
    appUninstallDays: 0,
    neverInstallAppList: [],
    promoteAppInstall: '999',
    appActiveAndOr: null,
    appNotActiveAndOr: null,
    historyNeverActiveAppList: '',
    historyNeverActiveAndOr: null,
    audienceIds: '',
    oppAudienceIds: '',
  };
}

/**编辑oppoConfig回显展示 */
async function echoOppoConfig(params: AdOppoConfig) {
  if (params.localAdvertiserId) {
    await loadAdvertiserData(params.localAdvertiserId);
  }
  const config = params.config || ({} as any);

  // ---- 还原 oppoConfig（数组字段从字符串拆回数组）----
  const regionArr = stringToArray(config.region);
  const permanentRegionArr = stringToArray(config.permanentRegion);
  const appActiveArr = stringToArray(config.appActive);
  const appNotActiveArr = stringToArray(config.appNotActive);
  const ageNewArr = stringToArray(config.ageNew);
  const networkArr = stringToArray(config.network);

  // prettier-ignore
  oppoConfig.value = {
    delStatus: config.delStatus || 0,
    region: regionArr,
    mobileModel: stringToArray(config.mobileModel),
    sex: config.sex || 0,
    ageNew: ageNewArr,
    network: networkArr,
    installAppList: stringToArray(config.installAppList),
    preInstallAppList: stringToArray(config.preInstallAppList),
    unPreInstallAppList: stringToArray(config.unPreInstallAppList),
    notInstallAppList: stringToArray(config.notInstallAppList),
    permanentRegion: permanentRegionArr,
    appActive: appActiveArr,
    appNotActive: appNotActiveArr,
    interestTagsV2: stringToArray(config.interestTagsV2),
    unionAppId: stringToArray(config.unionAppId),
    unionAppIdRe: stringToArray(config.unionAppIdRe),
    immutable: config.immutable || 0,
    type: config.type || 0,
    audience: config.audience || '',
    pTargetId: config.pTargetId || 0,
    oppAudienceId: config.oppAudienceId || 0,
    appActiveDays: config.appActiveDays || 0,
    appNotActiveDays: config.appNotActiveDays || 0,
    audienceCount: config.audienceCount || 0,
    imeiType: config.imeiType || 0,
    yesterdayInstalledApp: stringToArray(config.yesterdayInstalledApp),
    weatherCode: stringToArray(config.weatherCode),
    installedNeverActiveAppList: stringToArray(config.installedNeverActiveAppList),
    filterConvertedAd: config.filterConvertedAd || null,
    appUninstallDays: config.appUninstallDays || 0,
    neverInstallAppList: stringToArray(config.neverInstallAppList),
    promoteAppInstall: config.promoteAppInstall || '999',
    appActiveAndOr: config.appActiveAndOr || null,
    appNotActiveAndOr: config.appNotActiveAndOr || null,
    historyNeverActiveAppList: config.historyNeverActiveAppList || '',
    historyNeverActiveAndOr: config.historyNeverActiveAndOr || null,
    audienceIds: config.audienceIds || '',
    oppAudienceIds: config.oppAudienceIds || '',
  } as any;

  // ---- 还原各 RadioGroup 的"不限/设置"状态 ----
  regionType.value = regionArr.length > 0 ? '1' : '0';
  permanentRegionType.value = permanentRegionArr.length > 0 ? '1' : '0';
  // ageNew：'999' 或空视为不限
  ageType.value = !config.ageNew || config.ageNew === '999' || config.ageNew === 999 ? '999' : '1';
  // network：空字符串或无值视为不限
  networkType.value = networkArr.length > 0 ? '1' : '0';
  // appActive / appNotActive：'999' 视为不限
  appActiveType.value =
    !config.appActive || config.appActive === '999' || config.appActive === 999 ? '0' : '1';
  appNotActiveType.value =
    !config.appNotActive || config.appNotActive === '999' || config.appNotActive === 999
      ? '0'
      : '1';

  // ---- 同步 Vben Form 的表单值（Select / Input 等托管字段）----
  await formApi.setValues({
    delStatus: oppoConfig.value.delStatus,
    mobileModel: oppoConfig.value.mobileModel,
    ageList: oppoConfig.value.ageNew,
    installAppList: oppoConfig.value.installAppList,
    preInstallAppList: oppoConfig.value.preInstallAppList,
    unPreInstallAppList: oppoConfig.value.unPreInstallAppList,
    notInstallAppList: oppoConfig.value.notInstallAppList,
    yesterdayInstalledApp: oppoConfig.value.yesterdayInstalledApp,
    installedNeverActiveAppList: oppoConfig.value.installedNeverActiveAppList,
    neverInstallAppList: oppoConfig.value.neverInstallAppList,
    interestTagsV2: oppoConfig.value.interestTagsV2,
    unionAppId: oppoConfig.value.unionAppId,
    unionAppIdRe: oppoConfig.value.unionAppIdRe,
    audience: oppoConfig.value.audience,
    pTargetId: oppoConfig.value.pTargetId,
    oppAudienceId: oppoConfig.value.oppAudienceId,
    appActiveDays: oppoConfig.value.appActiveDays,
    appNotActiveDays: oppoConfig.value.appNotActiveDays,
    audienceCount: oppoConfig.value.audienceCount,
    weatherCode: oppoConfig.value.weatherCode,
    filterConvertedAd: oppoConfig.value.filterConvertedAd,
    appUninstallDays: oppoConfig.value.appUninstallDays,
    appActiveAndOr: oppoConfig.value.appActiveAndOr,
    appNotActiveAndOr: oppoConfig.value.appNotActiveAndOr,
    historyNeverActiveAppList: oppoConfig.value.historyNeverActiveAppList,
    historyNeverActiveAndOr: oppoConfig.value.historyNeverActiveAndOr,
    audienceIds: oppoConfig.value.audienceIds,
    oppAudienceIds: oppoConfig.value.oppAudienceIds,
  });
}

//----------地域------------
const regionType = ref<string>('0');

//----------年龄(新)------------
const ageType = ref<string>('999');
const ageNewOptions = computed(() => getTagOptions('ageNew'));

//----------网络------------
const networkType = ref<string>('0');
const networkOptions = computed(() => getTagOptions('network'));

//----------常驻地------------
const permanentRegionType = ref<string>('0');

//----------应用活跃------------
const appActiveType = ref<string>('0');

//----------应用非活跃------------
const appNotActiveType = ref<string>('0');

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 120,
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Slot',
      fieldName: 'region',
      componentProps: {
        showSearch: true,
        allowClear: true,
      },
      label: '地域',
      defaultValue: [],
    },
    {
      component: 'Select',
      fieldName: 'mobileModel',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        placeholder: '请选择',
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
      },
      label: '机型',
    },
    {
      component: 'Slot',
      fieldName: 'sex',
      label: '性别',
    },
    {
      component: 'Slot',
      fieldName: 'ageList',
      label: '年龄',
      rules: computed(() => {
        return ageType.value === '1' ? 'required' : '';
      }) as any,
    },
    {
      component: 'Slot',
      fieldName: 'networkList',
      label: '网络',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'installAppList',
      label: '应用已安装',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'preInstallAppList',
      label: '应用预安装',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'unPreInstallAppList',
      label: '应用非预安装',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'notInstallAppList',
      label: '应用未安装',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'yesterdayInstalledApp',
      label: '前一天已安装',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'installedNeverActiveAppList',
      label: '应用已安装未激活',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'neverInstallAppList',
      label: '应用从未安装',
    },
    {
      component: 'Slot',
      fieldName: 'permanentRegion',
      componentProps: {
        showSearch: true,
        allowClear: true,
      },
      label: '常驻地',
      defaultValue: [],
    },
    {
      component: 'Slot',
      fieldName: 'appActive',
      label: '应用活跃',
    },
    {
      component: 'Slot',
      fieldName: 'appNotActive',
      label: '应用非活跃',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'interestTagsV2',
      label: '兴趣标签',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'unionAppId',
      label: '联盟AppId',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'unionAppIdRe',
      label: '联盟App反向',
    },
    {
      component: 'Slot',
      fieldName: 'immutable',
      label: '定向行为',
      rules: 'required',
    },
    {
      component: 'Slot',
      fieldName: 'type',
      label: '定向类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'audience',
      label: '人群定向',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      defaultValue: 0,
      fieldName: 'pTargetId',
      label: '引用人群定向',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      defaultValue: 0,
      fieldName: 'oppAudienceId',
      label: '排除人群包ID',
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        min: 0,
        max: 365,
        precision: 0,
      },
      fieldName: 'appActiveDays',
      label: '应用活跃天数',
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        min: 0,
        max: 365,
        precision: 0,
      },
      fieldName: 'appNotActiveDays',
      label: '应用非活跃天数',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'audienceCount',
      label: '人群包受众数量',
    },
    {
      component: 'Slot',
      fieldName: 'imeiType',
      label: 'imei类型',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        mode: 'multiple',
        allowClear: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: [],
        placeholder: '请选择',
      },
      fieldName: 'weatherCode',
      label: '天气',
    },
    {
      component: 'Select',
      componentProps: {
        showSearch: true,
        allowClear: true,
        options: [
          {
            value: 1,
            label: '广告',
          },
          {
            value: 2,
            label: '广告组',
          },
          {
            value: 3,
            label: '广告计划',
          },
          {
            value: 4,
            label: '广告主',
          },
        ],
        placeholder: '请选择',
      },
      fieldName: 'filterConvertedAd',
      label: '屏蔽已转化用户',
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入',
        min: 0,
        max: 365,
        precision: 0,
      },
      fieldName: 'appUninstallDays',
      label: '应用未安装天数',
    },
    {
      component: 'Slot',
      fieldName: 'promoteAppInstall',
      label: '推广应用安装',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            value: 1,
            label: '与',
          },
          {
            value: 0,
            label: '或',
          },
        ],
        placeholder: '请选择',
      },
      defaultValue: 0,
      fieldName: 'appActiveAndOr',
      label: '应用活跃标签',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            value: 1,
            label: '与',
          },
          {
            value: 0,
            label: '或',
          },
        ],
        placeholder: '请选择',
      },
      defaultValue: 0,
      fieldName: 'appNotActiveAndOr',
      label: '应用非活跃标签',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
      },
      fieldName: 'historyNeverActiveAppList',
      label: '未激活标签应用',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            value: 1,
            label: '与',
          },
          {
            value: 0,
            label: '或',
          },
        ],
        placeholder: '请选择',
      },
      defaultValue: 0,
      fieldName: 'historyNeverActiveAndOr',
      label: '历史从未激活标签',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
      },
      fieldName: 'audienceIds',
      label: '多选的正向人群包',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
      },
      fieldName: 'oppAudienceIds',
      label: '多选的排除人群包',
    },
  ],
});

defineExpose({ submitOppoConfig, popUpOppoCancel, echoOppoConfig });
</script>

<template>
  <div>
    <Form>
      <template #delStatus>
        <div>
          <RadioGroup v-model:value="oppoConfig.delStatus" button-style="solid">
            <RadioButton :value="0">正常</RadioButton>
            <RadioButton :value="1">删除</RadioButton>
          </RadioGroup>
        </div>
      </template>
      <template #region>
        <div>
          <RadioGroup
            v-model:value="regionType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'region', 'region')"
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <TreeSelector
            v-if="regionType === '1'"
            v-model:value="oppoConfig.region"
            :field-names="{
              children: 'children',
              title: 'name',
              key: 'code',
            }"
            :tree-data="regionData"
            placeholder="搜索省份、城市"
          />
        </div>
      </template>
      <template #sex>
        <RadioGroup v-model:value="oppoConfig.sex" button-style="solid">
          <RadioButton :value="0">不限</RadioButton>
          <RadioButton :value="1">女</RadioButton>
          <RadioButton :value="2">男</RadioButton>
        </RadioGroup>
      </template>
      <template #ageList>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="ageType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'ageNew', 'ageList')"
          >
            <RadioButton value="999">不限</RadioButton>
            <RadioButton value="1">按年龄</RadioButton>
          </RadioGroup>
          <CheckboxGroup
            v-if="ageType === '1'"
            v-model:value="oppoConfig.ageNew"
            :options="ageNewOptions"
          />
        </div>
      </template>
      <template #networkList>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="networkType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'network', 'networkList')"
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <CheckboxGroup
            v-if="networkType === '1'"
            v-model:value="oppoConfig.network"
            :options="networkOptions"
          />
        </div>
      </template>
      <template #permanentRegion>
        <div>
          <RadioGroup
            v-model:value="permanentRegionType"
            button-style="solid"
            @change="
              (e) => handleTargetingChange(e.target.value, 'permanentRegion', 'permanentRegion')
            "
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <TreeSelector
            v-if="permanentRegionType === '1'"
            v-model:value="oppoConfig.permanentRegion"
            :field-names="{
              children: 'children',
              title: 'name',
              key: 'code',
            }"
            :tree-data="regionData"
            placeholder="搜索省份、城市"
          />
        </div>
      </template>
      <template #appActive>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="appActiveType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'appActive', 'appActive')"
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <Select
            v-if="appActiveType === '1'"
            v-model:value="oppoConfig.appActive"
            mode="multiple"
            style="width: 100%"
            allowClear
            showSearch
            optionFilterProp="label"
            :options="appInstall"
          />
        </div>
      </template>
      <template #appNotActive>
        <div class="flex flex-col gap-2">
          <RadioGroup
            v-model:value="appNotActiveType"
            button-style="solid"
            @change="(e) => handleTargetingChange(e.target.value, 'appNotActive', 'appNotActive')"
          >
            <RadioButton value="0">不限</RadioButton>
            <RadioButton value="1">设置</RadioButton>
          </RadioGroup>
          <Select
            v-if="appNotActiveType === '1'"
            v-model:value="oppoConfig.appNotActive"
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            :options="appInstall"
          />
        </div>
      </template>
      <template #immutable>
        <div>
          <RadioGroup v-model:value="oppoConfig.immutable" button-style="solid">
            <RadioButton :value="0">另存为的定向</RadioButton>
            <RadioButton :value="1">创建不可编辑定向</RadioButton>
          </RadioGroup>
        </div>
      </template>
      <template #type>
        <div>
          <RadioGroup v-model:value="oppoConfig.type" button-style="solid">
            <RadioButton :value="0">不限</RadioButton>
            <RadioButton :value="1">普通定向包</RadioButton>
            <RadioButton :value="2">IMEI人群定向包</RadioButton>
            <RadioButton :value="6">电话包</RadioButton>
            <RadioButton :value="11">OAID</RadioButton>
          </RadioGroup>
        </div>
      </template>
      <template #imeiType>
        <div>
          <RadioGroup v-model:value="oppoConfig.imeiType" button-style="solid">
            <RadioButton :value="0">imei明文</RadioButton>
            <RadioButton :value="1">IMEI-MD5</RadioButton>
            <RadioButton :value="2">手机号码</RadioButton>
            <RadioButton :value="6">OAID明文</RadioButton>
            <RadioButton :value="11">OAID-MD5</RadioButton>
          </RadioGroup>
        </div>
      </template>
      <template #promoteAppInstall>
        <div>
          <RadioGroup v-model:value="oppoConfig.promoteAppInstall" button-style="solid">
            <RadioButton value="999">不限</RadioButton>
            <RadioButton value="1">已安装该应用</RadioButton>
          </RadioGroup>
        </div>
      </template>
    </Form>
  </div>
</template>

<style lang="scss" scoped></style>
