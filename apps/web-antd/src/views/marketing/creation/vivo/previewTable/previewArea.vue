<script setup lang="ts">
import {
  Button,
  Card,
  Divider,
  TypographyText,
  Input,
  Menu,
  MenuItem,
  Tag,
  message,
  Dropdown,
  Textarea,
} from 'ant-design-vue';
import { computed, h, onMounted, onUnmounted, ref } from 'vue';
import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  getVivoTableData,
  useVivoTableUpdate,
  type VivoConfigData,
  type VivoCreation,
  type VivoTableData,
  type VivoCampaignResp,
  type VivoAdGroupResp,
  type VivoPromotionResp,
  type VivoAdgroup,
  type VivoPromotion,
  type VivoCampaign,
  type CampaignData,
  VIVO_VERSION,
} from '../vivo';
import {
  getRuleInfoCampaignCount,
  type AccountInfo,
  type PlatformCreation,
} from '#/views/marketing/creation/creation';
import { Platform } from '#/constants/enums';
import { MEDIA_SELECT, PROJRCT_SELECT } from '../projectEnum';
import { useOssClient } from '#/views/marketing/asset/material/useOssClient';
import { uploadToOss } from '#/utils/uploadToOss';
import { useUserStore } from '@vben/stores';
import { creationTaskApi } from '#/api';
import { useVbenModal } from '@vben/common-ui';
import { useProjectPlaceholder, renderProjectTitle } from '#/utils/customName';

const { accountInfo, creationInfo } = defineProps({
  accountInfo: {
    type: Array<AccountInfo>,
    default: () => [],
  },
  creationInfo: {
    type: Object as () => VivoCreation,
    default: () => undefined,
  },
});

// 表格数据
const tableData = ref<Array<VivoTableData>>([]);
// 记录当前选中的账户 ID
const activeAccountId = ref<string>('');

const localCreationInfo = ref<VivoCreation | undefined>(undefined);

//--------------提交审核弹框--------------
const PROJECT_PLACEHOLDERS = [
  { label: '产品名称', value: '<产品名称>' },
  { label: '日期', value: '<日期>' },
  { label: '时分秒', value: '<时分秒>' },
] as const; // 使用 as const 保证类型安全

const { customizeName, handleTagClick } = useProjectPlaceholder('', 100);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (!customizeName.value) return message.warning('请填写提交任务名字');
    await submitReview();
    customizeName.value = '';
    await modalApi.close();
  },
  async onCancel() {
    customizeName.value = '';
    await modalApi.close();
  },
});

function openSubmitReviewModal() {
  modalApi.open();
}

//--------------自定义修改项目名称--------------
const editingRow = ref<CampaignData>(); // 记录当前正在编辑哪一行
const editingField = ref<string>(''); // 记录当前修改的字段名：campaignName | groupName | promoName
const editingText = ref<string>('项目名称');
const editingTitle = ref<string>('修改项目名称');
const batchModifyText = ref<string>('项目名称');
const batchModifyTitle = ref<string>('批量修改项目名称');
const tempName = ref(''); // 弹窗输入框绑定的临时值

const [CustomizeNameModal, customizeNamemodalApi] = useVbenModal({
  async onConfirm() {
    if (!editingRow.value || !editingField.value) return;

    const newName = tempName.value;
    const field = editingField.value;
    const { advertiserId, campaignIdx, adGroupIdx, submitIndex } = editingRow.value;

    // --- 1. 同步更新原始嵌套数据 tableData (确保提交审核时数据正确) ---
    const accountData = tableData.value.find((item) => item.advertiserId === advertiserId);

    if (accountData) {
      try {
        const campaign = accountData.campaignList[campaignIdx];
        if (!campaign) {
          console.warn('未找到对应的计划数据');
          return;
        }
        if (field === 'campaignName') {
          // 修改计划层
          campaign.name = newName;
        } else if (field === 'groupName') {
          // 修改组层
          // 检查 adgroup 是否存在
          const group = campaign.adgroupList[adGroupIdx];
          if (group) {
            group.name = newName;
          }
        } else if (
          field === 'promoName' ||
          field === 'deepLink' ||
          field === 'clickLink' ||
          field === 'exposureLink'
        ) {
          const group = campaign.adgroupList[adGroupIdx];
          let targetPromo: VivoPromotion | undefined = undefined;
          const pIdx = editingRow.value.pIdx;

          if (pIdx !== undefined && group?.promotionList) {
            targetPromo = group.promotionList[pIdx];
          } else if (group?.promotionList) {
            targetPromo = group.promotionList.find(
              (p: VivoPromotion) => p.name === editingRow.value?.promoName,
            );
          }

          if (targetPromo) {
            if (field === 'promoName') {
              targetPromo.name = newName;
            } else if (field === 'deepLink') {
              targetPromo.deepLink = newName;
            } else if (field === 'clickLink') {
              targetPromo.clickMonitorUrl = newName;
            } else if (field === 'exposureLink') {
              targetPromo.viewMonitorUrl = newName;
            }
          }
        }
      } catch (e) {
        console.error('更新原始数据失败', e);
      }
    }

    // --- 2. 更新表格当前显示的数据 ---
    const $grid = gridApi.grid;
    if ($grid) {
      const allRows = $grid.getData();

      allRows.forEach((r: CampaignData) => {
        if (r.advertiserId === advertiserId) {
          // 如果改的是计划名：该计划下所有行都要改（因为合并单元格）
          if (field === 'campaignName' && r.campaignIdx === campaignIdx) {
            r.campaignName = newName;
          }
          // 如果改的是组名：该组下所有行都要改
          if (
            field === 'groupName' &&
            r.campaignIdx === campaignIdx &&
            r.adGroupIdx === adGroupIdx
          ) {
            r.groupName = newName;
          }
          if (r.advertiserId === advertiserId && r.submitIndex === submitIndex) {
            // 只要是广告层级的修改，都只针对 submitIndex 匹配的这一行
            if (field === 'promoName') {
              r.promoName = newName;
            } else if (field === 'deepLink') {
              r.deepLink = newName;
            } else if (field === 'clickLink') {
              r.clickLink = newName;
            } else if (field === 'exposureLink') {
              r.exposureLink = newName;
            }
          }
        }
      });
      $grid.loadData(allRows);
    }

    await customizeNamemodalApi.close();
  },
  async onCancel() {
    customizeName.value = '';
    await customizeNamemodalApi.close();
  },
});

function handleEditName(
  row: CampaignData,
  field: 'campaignName' | 'groupName' | 'promoName' | 'deepLink' | 'clickLink' | 'exposureLink',
) {
  if (field === 'deepLink') {
    editingTitle.value = '修改deepLink链接';
    editingText.value = 'deepLink链接';
  } else if (field === 'campaignName') {
    editingTitle.value = '修改项目名称';
    editingText.value = '项目名称';
  } else if (field === 'clickLink') {
    editingTitle.value = '修改点击链接';
    editingText.value = '点击链接';
  } else if (field === 'exposureLink') {
    editingTitle.value = '修改曝光链接';
    editingText.value = '曝光链接';
  }
  editingRow.value = row;
  editingField.value = field;
  tempName.value = row[field] || ''; // 根据字段获取初始值
  customizeNamemodalApi.open();
}

// 点击切换选中的方法
const handleAccountClick = async (id: string) => {
  activeAccountId.value = id;
  gridApi.setLoading(true);
  // 2. 模拟 1 秒的延迟，增强“变化感”
  setTimeout(() => {
    try {
      // 从当前的 tableData 中找到点击的那个账户数据
      const currentAccount = tableData.value.find((item) => item.advertiserId === id);

      if (currentAccount) {
        // 调用拍平函数转换数据
        const flattened = flattenVivoData(currentAccount.campaignList, currentAccount.advertiserId);

        // 将新数据设置到表格中
        gridApi.setGridOptions({ data: flattened });

        // 如果需要，切换账户后默认清空之前的选中状态
        const $grid = gridApi.grid;
        $grid?.clearCheckboxRow();
      }
    } finally {
      // 3. 1秒后关闭 Loading
      gridApi.setLoading(false);
    }
  }, 500);
};

// 计划数量
const campaignCount = computed({
  get: () => {
    if (!localCreationInfo.value) {
      return 0;
    }
    const localMaterialIds: string[] = localCreationInfo.value?.accountInfo.map(
      (x) => x.localAdvertiserId,
    );
    return getRuleInfoCampaignCount(
      localCreationInfo.value.platform,
      localCreationInfo.value,
      localMaterialIds,
    );
  },
  set: () => {},
});

// 广告数量
const adCount = computed({
  get: () => {
    if (!localCreationInfo.value) {
      return 0;
    }
    let count: number = 0;
    tableData.value.forEach((item) => {
      count += item.getAdCount();
    });
    return count;
  },
  set: () => {},
});

const handleSpanMethod = ({
  row,
  _rowIndex,
  column,
  visibleData,
}: {
  row: any;
  _rowIndex: number;
  column: any;
  visibleData: CampaignData[];
}) => {
  const field = column.field;

  // 1. 定义需要合并的层级
  const campaignFields = ['campaignName', 'campaignBudget', 'campaignMediaType', 'campaignAdType'];
  const groupFields = ['groupName', 'groupPrice', 'groupOcpxPrice', 'groupDailyBudget'];

  // 2. 创意汇总列和广告名列，直接返回 1x1，不合并
  if (
    [
      'promoName',
      'displayCreativeTitle',
      'displayCreativeSubTitle',
      'displayCreativePushTitle',
    ].includes(field)
  ) {
    return { rowspan: 1, colspan: 1 };
  }

  // 3. 获取当前列对应的合并基准 ID
  let targetId = '';
  if (campaignFields.includes(field) || column.type === 'checkbox') {
    targetId = row.rowCampaignId;
  } else if (groupFields.includes(field)) {
    targetId = row.rowGroupId;
  } else {
    return { rowspan: 1, colspan: 1 };
  }

  // 4. 向上逻辑：隐藏重复单元格
  if (_rowIndex > 0) {
    const prevRow = visibleData[_rowIndex - 1];
    const prevTargetId =
      campaignFields.includes(field) || column.type === 'checkbox'
        ? prevRow?.rowCampaignId
        : prevRow?.rowGroupId;
    if (targetId === prevTargetId) {
      return { rowspan: 0, colspan: 0 };
    }
  }

  // 5. 向下逻辑：计算合并行数
  let countRowspan = 1;
  for (let i = _rowIndex + 1; i < visibleData.length; i++) {
    const nextRow = visibleData[i];
    const nextTargetId =
      campaignFields.includes(field) || column.type === 'checkbox'
        ? nextRow?.rowCampaignId
        : nextRow?.rowGroupId;
    if (targetId === nextTargetId) {
      countRowspan++;
    } else {
      break;
    }
  }
  return { rowspan: countRowspan, colspan: 1 };
};

// 辅助渲染函数，减少冗余代码
const renderEditCell = (
  row: CampaignData,
  field: 'campaignName' | 'groupName' | 'promoName' | 'deepLink' | 'clickLink' | 'exposureLink',
) => {
  return h('div', { class: 'edit-cell-wrapper' }, [
    // 文本容器
    h(
      'span',
      {
        style:
          field === 'deepLink' || field === 'clickLink' || field === 'exposureLink'
            ? {
                display: '-webkit-box',
                '-webkit-box-orient': 'vertical',
                '-webkit-line-clamp': '3',
                overflow: 'hidden',
                'word-break': 'break-all',
              }
            : {},
      },
      row[field],
    ),
    // 修改图标
    h(
      Button,
      {
        type: 'link',
        size: 'small',
        onClick: () => handleEditName(row, field),
      },
      { default: () => '📝' },
    ),
  ]);
};

const gridOptions: VxeGridProps = {
  border: true,
  height: 'auto',
  columnConfig: { resizable: true },
  checkboxConfig: {
    highlight: true,
    trigger: 'row',
  },
  // 核心：通过类名实现“块状高亮”
  rowClassName: ({ row }) => {
    const $grid = gridApi.grid;
    if (!$grid) return '';
    const selectRecords = $grid.getCheckboxRecords();
    // 只要已选记录里有该计划的行，整块变色
    const isBlockActive = selectRecords.some(
      (r: CampaignData) => r.rowCampaignId === row.rowCampaignId,
    );
    return isBlockActive ? 'is--campaign-block-active' : '';
  },
  showOverflow: false,
  showHeaderOverflow: false,
  spanMethod: handleSpanMethod,
  columns: [
    // { type: 'checkbox', width: 50 },
    {
      title: '计划',
      children: [
        {
          field: 'campaignName',
          title: '项目',
          slots: { default: ({ row }) => renderEditCell(row, 'campaignName') },
        },
        { field: 'campaignBudget', title: '项目预算' },
        { field: 'campaignMediaType', title: '媒体类型', slots: { default: 'campaignMediaType' } },
        { field: 'campaignAdType', title: '推广目标', slots: { default: 'campaignAdType' } },
        {
          title: '广告组',
          children: [
            {
              field: 'groupName',
              title: '名字',
              slots: { default: ({ row }) => renderEditCell(row, 'groupName') },
            },
            { field: 'groupOcpxPrice', title: '转化出价' },
            { field: 'groupDailyBudget', title: '日预算' },
            {
              title: '广告',
              children: [
                {
                  field: 'promoName',
                  title: '名字',
                  slots: { default: ({ row }) => renderEditCell(row, 'promoName') },
                },
                {
                  field: 'deepLink',
                  title: 'deepLink链接',
                  width: '98px',
                  slots: { default: ({ row }) => renderEditCell(row, 'deepLink') },
                },
                {
                  field: 'clickLink',
                  title: '点击链接',
                  slots: { default: ({ row }) => renderEditCell(row, 'clickLink') },
                },
                {
                  field: 'exposureLink',
                  title: '曝光链接',
                  slots: { default: ({ row }) => renderEditCell(row, 'exposureLink') },
                },
                {
                  field: 'pageUrlName',
                  title: '落地页',
                },
                {
                  title: '创意',
                  children: [
                    { field: 'displayCreativeTitle', title: '标题' },
                    { field: 'displayCreativeSubTitle', title: '副标题' }, // 修正 key
                    { field: 'displayCreativePushTitle', title: '应用标题' },
                  ],
                },
              ],
            },
          ],
        },
        { field: 'campaignState', title: '提交状态', slots: { default: 'stateSlot' } },
        { field: 'errorMsg', title: '原因', width: 200 },
      ],
    },
  ],
  pagerConfig: { enabled: false },
};

// 1. 定义事件对象
const gridEvents = {
  // 复选框勾选事件
  checkboxChange: ({ checked, row }: { checked: boolean; row: CampaignData }) => {
    const $grid = gridApi.grid;
    if ($grid) {
      const allRows = $grid.getData();
      // 依然保持逻辑上的联动：选中计划，该计划下所有创意行在数据层面被勾选
      const blockRows = allRows.filter((r: CampaignData) => r.rowCampaignId === row.rowCampaignId);
      $grid.setCheckboxRow(blockRows, checked);
      // 注意：这里不需要 $grid.updateData() 了，因为不需要触发自定义 class 刷新
    }
  },
};
const [Grid, gridApi] = useVbenVxeGrid({ gridOptions, gridEvents });

onMounted(() => {
  gridApi.setGridOptions({ data: [] });
});

/**
 * 表格生成
 * @param val
 */
async function generateTable(val: PlatformCreation<VivoConfigData>) {
  if (val.platform === Platform.VIVO) {
    localCreationInfo.value = val as VivoCreation;
    // 1. 获取原始数据
    const rawTableData = getVivoTableData(localCreationInfo.value);
    tableData.value = rawTableData;
    // 2. 将第一个账号的 campaignList 拍平
    if (rawTableData.length > 0) {
      const firstAdvertiserId = rawTableData[0]?.advertiserId as string;
      await handleAccountClick(firstAdvertiserId);
    }
  }
}

// 清空表格的方法
function clearTable() {
  localCreationInfo.value = undefined; // 这样会触发 v-if 显示“请先完成配置...”
  tableData.value = [];
  activeAccountId.value = '';
  // 清空 grid 数据
  gridApi.setGridOptions({ data: [] });
}

defineExpose({ generateTable, clearTable });

/**
 * 将嵌套的广告数据结构拍平成 Vxe-Table 可识别的行数据
 */
function flattenVivoData(campaignList: VivoCampaign[], advertiserId: string) {
  const rows: CampaignData[] = [];
  let globalIndex = 0; // index 是基于整个账号下的广告总计数

  campaignList?.forEach((campaign, cIdx) => {
    // 遍历广告组
    campaign.adgroupList.forEach((group: VivoAdgroup, gIdx: number) => {
      // 遍历广告（Promotion）
      group.promotionList.forEach((promo: VivoPromotion, pIdx: number) => {
        // --- 核心：汇总创意信息 ---
        const creatives = promo.creativeList || [];
        const count = creatives.length;

        rows.push({
          // 用于合并逻辑的 ID
          rowCampaignId: `c_${cIdx}`,
          rowGroupId: `c_${cIdx}_g_${gIdx}`,
          rowPromoId: `c_${cIdx}_g_${gIdx}_p_${pIdx}`, // 这是 Promo 层级的唯一标识

          // --- 计划层级字段 ---
          campaignName: campaign.name,
          campaignBudget: campaign.dailyBudget != -1 ? campaign.dailyBudget / 100000 : -1,
          campaignMediaType: campaign.mediaType,
          campaignAdType: campaign.adType,

          campaignState: promo?.state || '待提交',
          errorMsg: promo?.msg || '-',
          advertiserId: advertiserId, // 存储账号ID，用于匹配
          submitIndex: globalIndex, // 记录该行对应的后端索引
          campaignIdx: cIdx, // 新增：记录它是第几个计划
          adGroupIdx: gIdx, // 新增：记录它是第几个组
          pIdx: pIdx, // 新增：记录在 promotionList 中的索引

          // --- 广告组层级字段 ---
          groupName: group.name,
          // groupPrice: group.price / 100000 || '-',
          groupOcpxPrice: group.ocpxPrice / 100000 || '-',
          groupDailyBudget: group.dailyBudget != -1 ? group.dailyBudget / 100000 : -1,

          // --- 广告层级字段 ---
          promoName: promo.name,
          deepLink: promo.deepLink || '-',
          exposureLink: promo.viewMonitorUrl || '-',
          clickLink: promo.clickMonitorUrl || '-',
          pageUrlName: promo.pageUrlName || '-',

          // --- 汇总后的展示字段 ---
          displayCreativeTitle: count > 0 ? `${creatives[0]?.title}（${count}个素材）` : '-',
          displayCreativeSubTitle: count > 0 ? `${creatives[0]?.subTitle}（${count}个素材）` : '-',
          displayCreativePushTitle:
            count > 0 ? `${creatives[0]?.pushSubTitle}（${count}个素材）` : '-',
          creativeCount: count,
        });
        globalIndex++;
      });
    });
  });

  return rows;
}

/**匹配账户名字 */
function accountInfoName(id: string) {
  const advertiserName = accountInfo.find((item) => item.localAdvertiserId === id) || {
    localAdvertiserId: 0,
    advertiserName: '',
  };
  return advertiserName.advertiserName;
}

/**匹配推广目标 */
function adTypeName(value: number) {
  const currentAdTypeName = PROJRCT_SELECT.find((item) => item.value === value) || {
    value: 0,
    label: '',
  };
  return currentAdTypeName.label;
}

/**匹配媒体类型 */
function mediaTypeName(value: number) {
  const currentMediaTypeName = MEDIA_SELECT.find((item) => item.value === value) || {
    value: 0,
    label: '',
  };
  return currentMediaTypeName.label;
}

// 定义一个变量记录定时器，方便销毁
const pollTimer = ref<ReturnType<typeof setTimeout> | null>(null);

/**提交审核 */
async function submitReview() {
  try {
    // 1. 检查数据是否存在
    if (!tableData.value.length || !localCreationInfo.value) {
      console.warn('没有可提交的数据');
      return;
    }

    const userStore = useUserStore();
    const mainId = userStore.userInfo?.mainId;

    gridApi.setLoading(true);

    // 2. 获取 OSS 客户端实例
    const client = await useOssClient();
    const timestamp = Date.now();

    /** * 内部私有工具函数：处理 JSON 转换并上传至 OSS
     * @param data 要上传的对象
     * @param suffix 文件名后缀，用于区分文件类型
     */

    // --- 把Map转化成普通的对象，不然上传json是空的，下次取回来的数据也是空的 ---
    const uploadJson = async (data: any, subName: string) => {
      // 深拷贝一份数据，避免修改原始响应对象
      const cloneData = JSON.parse(
        JSON.stringify(data, (_, value) => {
          // 关键逻辑：如果遇到 Map 类型，将其转换为普通对象
          if (value instanceof Map) {
            return Object.fromEntries(value.entries());
          }
          return value;
        }),
      );

      const jsonString = JSON.stringify(cloneData, null, 2);
      const fileName = `${timestamp}_${subName}.json`;
      const objectKey = `${mainId}/json/batchInvestment/${fileName}`;
      const file = new File([jsonString], fileName, { type: 'application/json' });

      const result = await uploadToOss(client, file, objectKey);
      return result.url; // 返回 OSS 路径
    };
    // 3. 并行上传两个文件（提高效率）
    // creationInfo -> configArea
    // tableData    -> fullParamsData
    const [creationUrl, tableUrl] = await Promise.all([
      uploadJson(localCreationInfo.value, 'creation'),
      uploadJson(tableData.value, 'table'),
    ]);

    // console.log({
    //   name: renderProjectTitle(customizeName.value, 0, creationInfo?.project.projectName),
    //   platform: creationInfo?.platform || '',
    //   projectId: creationInfo?.project.projectId || '',
    //   ruleType: 'immediately',
    //   version: VIVO_VERSION, //版本
    //   configArea: creationUrl, //本地数据
    //   fullParamsData: tableUrl, //上传表格
    // });
    // return;

    const res = await creationTaskApi.fetchVivoSubmitReview({
      name: renderProjectTitle(customizeName.value, 0, creationInfo?.project.projectName),
      platform: creationInfo?.platform || '',
      projectId: creationInfo?.project.projectId || '',
      ruleType: 'immediately',
      version: VIVO_VERSION, //版本
      configArea: creationUrl, //本地数据
      fullParamsData: tableUrl, //上传表格
    });

    if (res.taskId) {
      startPolling(res.taskId);
    }
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    // loading的时候会重新拿到我的旧数据展示，所以这里需要
    // 强制手动重新“拍平”一次数据，覆盖掉 Grid 可能产生的自动回退
    if (activeAccountId.value) {
      const currentAccount = tableData.value.find((a) => a.advertiserId === activeAccountId.value);
      if (currentAccount) {
        const flattened = flattenVivoData(currentAccount.campaignList, currentAccount.advertiserId);
        gridApi.setGridOptions({ data: flattened });
      }
    }
    gridApi.setLoading(false);
  }
}

/** 轮询任务状态的逻辑 */
function startPolling(taskId: string) {
  // 如果之前有轮询，先清掉
  if (pollTimer.value) clearTimeout(pollTimer.value);

  const poll = async () => {
    try {
      const res = await creationTaskApi.fetchVivoSubmitResult({ id: taskId });
      gridApi.setLoading(true);

      const { taskState, campaignResp, adGroupResp, promotionResp } = res;

      // 终止条件：状态为 3 或 4 (成功标识)
      if (taskState === 3 || taskState === 4) {
        //更新当前表格行
        updateTableRowsStatus(campaignResp, adGroupResp, promotionResp);
        //更新原始 tableData 数据（确保切换账号后状态还在）
        updateAllTableDataStatus(campaignResp, adGroupResp, promotionResp);
        gridApi.setLoading(false);
        return;
      }

      // 如果还没结束，每隔 3 秒继续查
      pollTimer.value = setTimeout(poll, 3000);
    } catch (err) {
      console.error('轮询出错:', err);
      gridApi.setLoading(false);
    }
  };

  poll();
}

/**更新表格当前看到的账户状态 */
function updateTableRowsStatus(
  campaignResp: Record<string, VivoCampaignResp[]>,
  adGroupResp: Record<string, VivoAdGroupResp[]>,
  promotionResp: Record<string, VivoPromotionResp[]>,
) {
  const $grid = gridApi.grid;
  if (!$grid) return;

  const allRows = [...$grid.getData()];
  const res = { campaignResp, adGroupResp, promotionResp };

  allRows.forEach((row: CampaignData) => {
    // 调用统一逻辑
    const { state, msg } = getUnifiedStatus(row.advertiserId ?? '', row, res);
    row.campaignState = state;
    row.errorMsg = msg;
  });

  // 刷新表格渲染
  gridApi.setGridOptions({ data: allRows });
}

/** 更新内存中所有账号的原始数据状态 */
function updateAllTableDataStatus(
  campaignResp: Record<string, VivoCampaignResp[]>,
  adGroupResp: Record<string, VivoAdGroupResp[]>,
  promotionResp: Record<string, VivoPromotionResp[]>,
) {
  const res = { campaignResp, adGroupResp, promotionResp };

  tableData.value.forEach((accData) => {
    const accId = accData.advertiserId;
    // 关键：手动维护 globalIndex，确保逻辑与 flatten 保持一致
    let globalIndex = 0;

    accData.campaignList.forEach((campaign: VivoCampaign, cIdx: number) => {
      campaign.adgroupList.forEach((group: VivoAdgroup, gIdx: number) => {
        group.promotionList.forEach((promo: VivoPromotion) => {
          // --- 核心修改处 ---
          // 构造一个模拟的 row 对象传给 getUnifiedStatus
          const mockRow = {
            campaignIdx: cIdx,
            adGroupIdx: gIdx,
            submitIndex: globalIndex,
          };
          // 这里 pIdx 对应 flatten 时的 globalIndex 逻辑
          const { state, msg } = getUnifiedStatus(accId, mockRow, res);

          // 更新原始嵌套对象的状态，确保切换账号后数据还在
          promo.state = state;
          promo.msg = msg;
        });
      });
    });
  });
}

/**
 * 统一的状态判定逻辑
 * 优先级：计划错误 > 广告组错误 > 广告错误
 */
function getUnifiedStatus(
  accId: string,
  row: CampaignData, // 传入整行数据，以便获取各种索引
  // idx: number,
  res: {
    campaignResp: Record<string, VivoCampaignResp[]>;
    adGroupResp: Record<string, VivoAdGroupResp[]>;
    promotionResp: Record<string, VivoPromotionResp[]>;
  },
) {
  const { campaignIdx, adGroupIdx, submitIndex } = row;
  // 每个账号下只有一个计划和一个广告组
  const campResult = res.campaignResp?.[accId]?.[campaignIdx];
  const groupResult = res.adGroupResp?.[accId]?.[adGroupIdx];
  // 广告可以有多个，通过 idx 匹配
  const promoResult = res.promotionResp?.[accId]?.[submitIndex];

  // 1. 检查计划层级
  if (campResult && ![0, 9].includes(campResult.code)) {
    return { state: '计划创建失败', msg: campResult.message || '计划报错' };
  }

  // 2. 检查广告组层级
  if (groupResult && ![0, 9].includes(groupResult.code)) {
    return { state: '广告组失败', msg: groupResult.message || '广告组报错' };
  }

  // 3. 检查广告层级
  if (promoResult && ![0, 9].includes(promoResult.code)) {
    return { state: '广告创建失败', msg: promoResult.message || '广告报错' };
  }

  // 4. 如果都没有报错，且 promoResult 存在且 code 为 0 或 9
  if (promoResult && [0, 9].includes(promoResult.code)) {
    return { state: '创建成功', msg: '-' };
  }

  return { state: '待提交', msg: '-' };
}

//--------------批量修改操作--------------
const nameCollection = ref<string>('');
//批量修改
const batchModifyType = ref<'project' | 'ad' | 'clickLink' | 'exposureLink'>('project');

const { handleUpdateOriginalData } = useVivoTableUpdate({
  tableData,
  activeAccountId,
  gridApi,
  flattenFn: flattenVivoData, // 传入你组件内的拍平函数
});
const [BatchModifyNameModal, batchModifyNamemodalApi] = useVbenModal({
  onConfirm() {
    if (!nameCollection.value.trim()) return batchModifyNamemodalApi.close();
    const newNames = nameCollection.value
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    // 调用抽离出来的公共更新逻辑
    handleUpdateOriginalData((accountData) => {
      if (batchModifyType.value === 'project') {
        newNames.forEach((name, index) => {
          if (accountData.campaignList[index]) {
            accountData.campaignList[index].name = name;
          }
        });
      } else if (batchModifyType.value === 'ad') {
        const allPromos = accountData.campaignList.flatMap((c) =>
          c.adgroupList.flatMap((g) => g.promotionList),
        );
        newNames.forEach((name, index) => {
          if (allPromos[index]) {
            allPromos[index].name = name;
          }
        });
      } else if (batchModifyType.value === 'exposureLink') {
        const allPromos = accountData.campaignList.flatMap((c) =>
          c.adgroupList.flatMap((g) => g.promotionList),
        );
        newNames.forEach((name, index) => {
          if (allPromos[index]) {
            allPromos[index].viewMonitorUrl = name;
          }
        });
      } else if (batchModifyType.value === 'clickLink') {
        const allPromos = accountData.campaignList.flatMap((c) =>
          c.adgroupList.flatMap((g) => g.promotionList),
        );
        newNames.forEach((name, index) => {
          if (allPromos[index]) {
            allPromos[index].clickMonitorUrl = name;
          }
        });
      }
    });
    message.success('批量修改成功');
    nameCollection.value = '';
    batchModifyNamemodalApi.close();
  },
  onCancel() {
    nameCollection.value = '';
    batchModifyNamemodalApi.close();
  },
});

function batchModifyName(val: 'project' | 'ad' | 'clickLink' | 'exposureLink') {
  batchModifyType.value = val; // 记录当前修改的是哪个层级
  if (val === 'project') {
    batchModifyTitle.value = '批量修改项目名称';
    batchModifyText.value = '项目名称';
  } else if (val === 'ad') {
    batchModifyTitle.value = '批量修改广告名称';
    batchModifyText.value = '广告名称';
  } else if (val === 'clickLink') {
    batchModifyTitle.value = '批量修点击链接';
    batchModifyText.value = '点击链接';
  } else if (val === 'exposureLink') {
    batchModifyTitle.value = '批量修改曝光链接';
    batchModifyText.value = '曝光链接';
  }
  batchModifyNamemodalApi.open();
}

onUnmounted(() => {
  if (pollTimer.value) clearTimeout(pollTimer.value);
});
</script>

<template>
  <div>
    <div class="empty-status" v-if="localCreationInfo === undefined">
      请先完成计划配置，再预览生成的广告计划~
    </div>
    <div v-else>
      <!-- <div> -->
      <div
        style="display: flex; align-items: center; justify-content: space-between; margin: 0 0 10px"
      >
        <div class="sum">
          <div style="margin: 0 20px 0 0">
            项目总数：<span class="numColor">{{ campaignCount }}</span>
          </div>
          <div style="margin: 0 20px 0 0">
            广告总数：<span class="numColor">{{ adCount }}</span>
          </div>
          <Button type="primary" @click="openSubmitReviewModal">提交审核</Button>
        </div>
        <Dropdown trigger="click" placement="bottom">
          <Button type="primary">批量操作</Button>
          <template #overlay>
            <Menu>
              <MenuItem @click="batchModifyName('project')"> 修改项目名称 </MenuItem>
              <MenuItem @click="batchModifyName('ad')"> 修改广告名称 </MenuItem>
              <MenuItem @click="batchModifyName('clickLink')"> 修改点击链接 </MenuItem>
              <MenuItem @click="batchModifyName('exposureLink')"> 修改曝光链接 </MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </div>
      <Card>
        <div style="display: flex; align-items: center">
          <div
            class="accountInfo"
            v-for="item in tableData"
            :key="item.advertiserId"
            :class="{ 'is-active': activeAccountId === item.advertiserId }"
            @click="handleAccountClick(item.advertiserId)"
          >
            <div class="title-link">
              <TypographyText
                :content="accountInfoName(item.advertiserId)"
                :ellipsis="{ tooltip: true }"
              />
            </div>
            <div class="id-wrapper">
              ID：
              <TypographyText :content="item.advertiserId" :ellipsis="{ tooltip: true }" />
            </div>
            <Divider dashed style="width: 100%; min-width: 100%; margin: 10px auto"></Divider>
            <div style="display: flex; align-items: center; justify-content: space-between">
              <div>
                项目数：<span class="numColor">{{ item.getCampaignCount() }}</span>
              </div>
              <div>
                广告数：<span class="numColor">{{ item.getAdCount() }}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <!--数据表格-->
      <div>
        <Grid style="min-height: 85vh">
          <template #campaignMediaType="{ row }">
            {{ mediaTypeName(row.campaignMediaType) }}
          </template>
          <template #campaignAdType="{ row }">
            {{ adTypeName(row.campaignAdType) }}
          </template>
          <template #stateSlot="{ row }">
            <span
              :style="{
                color: row.campaignState.includes('失败')
                  ? 'red'
                  : row.campaignState === '创建成功'
                    ? 'green'
                    : '#666',
              }"
            >
              {{ row.campaignState }}
            </span>
          </template>
          <!-- <template #projectHeaderSlot>
            <Checkbox v-model:checked="isAllProjectChecked"/>
          </template>
          <template #projectCheckboxSlot="{ row }">
            <Checkbox
              :checked="row.projectChecked"
              @change="(e: any) => onProjectCheckChange(row, e.target.checked)"
            />
          </template> -->
        </Grid>
      </div>
    </div>
    <Modal title="提示">
      <div class="flex flex-col items-center gap-2 w-full">
        <div class="form">
          <div>任务名称：</div>
          <div>
            <Input
              v-model:value="customizeName"
              placeholder="请输入任务名称"
              allow-clear
              class="w-[300px]"
            />
            <div class="flex flex-wrap items-center gap-2 text-xs mt-4">
              <span class="text-gray-500 font-medium">通配符：</span>
              <template v-for="item in PROJECT_PLACEHOLDERS" :key="item.value">
                <Tag
                  class="cursor-pointer select-none transition-all hover:border-blue-400"
                  :color="customizeName.includes(item.value) ? 'blue' : 'default'"
                  @click="handleTagClick(item.value)"
                >
                  {{ item.value }}
                </Tag>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Modal>
    <CustomizeNameModal :title="editingTitle">
      <div class="py-4 flex items-center">
        <div>{{ editingText }}：</div>
        <Input class="!w-[300px]" v-model:value="tempName" placeholder="请输入" />
      </div>
    </CustomizeNameModal>
    <BatchModifyNameModal :title="batchModifyTitle">
      <div class="py-4 flex items-center">
        <div>{{ batchModifyText }}：</div>
        <Textarea
          class="!w-[300px]"
          v-model:value="nameCollection"
          placeholder="请输入"
          :rows="6"
        />
      </div>
    </BatchModifyNameModal>
  </div>
</template>

<style scoped lang="scss">
:deep(.vxe-cell) {
  padding: 8px !important;
  word-break: break-all !important;
  white-space: normal !important;
}

:deep(.vxe-cell--slot) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-status {
  padding: 40px 0;
  color: #999;
  text-align: center;
}

.sum {
  display: flex;
  align-items: center;

  .numColor {
    color: #006be6;
  }
}

.accountInfo {
  width: 15%;
  padding: 10px;
  margin: 0 20px 0 0;
  cursor: pointer;

  // --- 【默认样式：未点击时的灰色】 ---
  border: 1px solid #d9d9d9; // 灰色边框
  border-radius: 4px;
  transition: all 0.3s; // 增加过渡动画，点击变色更平滑

  .title-link {
    color: #999; // 标题变灰
    :deep(.ant-typography) {
      color: #999 !important;
    }
  }

  .id-wrapper {
    color: #999; // ID 文字变灰
    :deep(.ant-typography) {
      color: #999 !important;
    }
  }

  .numColor {
    color: #999; // 底部数字变灰
  }

  // --- 【选中样式：点击后的蓝色】 ---
  &.is-active {
    border: 1px solid #006be6; // 蓝色边框

    .title-link {
      color: #006be6;

      :deep(.ant-typography) {
        color: #006be6 !important;
      }
    }

    .id-wrapper {
      color: #333; // 选中的 ID 可以恢复深色，方便阅读
      :deep(.ant-typography) {
        color: #333 !important;
      }
    }

    .numColor {
      color: #006be6; // 数字恢复蓝色
    }
  }

  // 鼠标悬停但未点击时的反馈（可选）
  &:hover:not(.is-active) {
    border-color: #adc6ff;
  }
}

.form {
  display: flex;
  align-items: baseline;
  justify-content: center; // 如果父容器宽度很大，这一行能保证内容在自己的区域内居中
  width: 100%;
}
</style>
