import type { RuleConfiguration, RuleOptions } from '#/views/marketing/creation/creation';

/**
 * vivo平台的规则配置
 */
export const vivoRuleConfiguration: RuleConfiguration = {
  project: {
    show: true,
    name: '计划',
    rules: '计划生成规则',
    countLabel: '每个账户指定计划数'
  },
  adGroup: {
    show: true,
    name: '广告组',
    rules: '广告组生成规则',
    countLabel: '每个计划指定广告组数'
  },
  ad: {
    show: true,
    name: '广告',
    rules: '广告生成规则',
    countLabel: '每个广告组指定广告数'
  },
  creative: {
    show: true,
    name: '创意',
    rules: '创意生成规则',
    countLabel: '每个广告指定创意数'
  }
};

/**
 * vivo平台的规则选项
 */
export const vivoRuleOptions: RuleOptions = {
  projectRules: [
    { title: '根据定向包生成', desc: '计划数量与定向包数量相等', key: 'targeting' },
    { title: '根据创意组生成', desc: '计划数量与创意组数量相等', key: 'creative' },
    { title: '根据标题包生成', desc: '计划数量与标题包数量相等', key: 'title' },
    { title: '指定数量', desc: '手动指定每个账户的计划数量', key: 'custom' },
  ],
  adGroupRules: [
    { title: '根据定向包生成', desc: '广告组数量与定向包数量相等', key: 'targeting' },
    { title: '根据创意组生成', desc: '广告组数量与创意组数量相等', key: 'creative' },
    { title: '根据标题包生成', desc: '广告组数量与标题包数量相等', key: 'title' },
    { title: '指定数量', desc: '手动指定每个计划的广告组数量', key: 'custom' },
  ],
  adRules: [
    { title: '按创意组数', desc: '按创意组数生成广告，自动匹配标题包，标题包不足时循环使用', key: 'creative' },
    { title: '按标题包数', desc: '按标题包数生成广告，自动匹配创意数，创意数不足时循环使用', key: 'title' },
    { title: '指定数量', desc: '先指定广告数量，自动循环使用素材和标题，多退少补', key: 'custom' },
  ],
  creativeRules: [
    { title: '无', desc: '无', key: 'none' },
    { title: '根据创意组生成', desc: '创意数量与创意组数量相等', key: 'creative_group' },
    { title: '指定数量', desc: '手动指定每个广告的创意数量', key: 'custom' },
  ],
};
