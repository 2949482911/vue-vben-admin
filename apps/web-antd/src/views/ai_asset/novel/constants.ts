import type { DictItem } from '@vben/stores';

export interface OptionItem {
  color?: string;
  desc?: string;
  label: string;
  value: string;
}

export type OptionMap = Record<string, OptionItem[]>;

/** 字典编码：所有类目以后端字典为准，前端只留 fallback */
export const DICT_CODES = {
  audience: 'ai_novel_audience',
  genre: 'ai_novel_genre',
  theme: 'ai_novel_theme',
  style: 'ai_novel_style',
  trope: 'ai_novel_trope',
  languageStyle: 'ai_novel_language_style',
  narrativeStructure: 'ai_novel_narrative_structure',
  literaryGenre: 'ai_novel_literary_genre',
  tone: 'ai_novel_tone',
  era: 'ai_novel_era',
  narrativeTime: 'ai_novel_narrative_time',
  narrativePov: 'ai_novel_narrative_pov',
  protagonist: 'ai_novel_protagonist',
  conflict: 'ai_novel_conflict',
  payoff: 'ai_novel_payoff',
  taboo: 'ai_novel_taboo',
  openingType: 'ai_novel_opening_type',
  heroEntrance: 'ai_novel_hero_entrance',
  outlineType: 'ai_novel_outline_type',
} as const;

const o = (value: string, label: string, desc?: string): OptionItem => ({
  label,
  value,
  desc,
});

/** 接口未就绪 / 字典为空时的兜底（value 与后端字典 code 保持一致） */
export const FALLBACK_OPTIONS: OptionMap = {
  audience: [
    o('teen', '少年', '12-18 岁'),
    o('young', '青年', '18-35 岁'),
    o('middle', '中年', '35-50 岁'),
    o('female', '女生', '女性读者'),
    o('male', '男生', '男性读者'),
    o('fanfic', '同人女', '喜欢同人创作'),
    o('acg', '二次元', '喜欢动漫游戏'),
    o('general', '通用', '所有读者'),
    o('elder', '中老年'),
    o('male_channel', '男频', '热血、升级、争霸'),
  ],
  genre: [
    o('xuanhuan', '玄幻'),
    o('xianxia', '仙侠'),
    o('urban', '都市'),
    o('romance', '言情'),
    o('scifi', '科幻'),
    o('mystery', '悬疑'),
    o('history', '历史'),
    o('fantasy', '奇幻'),
    o('wuxia', '武侠'),
    o('military', '军事'),
    o('brainhole', '脑洞'),
    o('rebirth', '重生'),
    o('sweet', '甜宠'),
    o('campus', '校园'),
  ],
  theme: [
    o('revenge', '复仇'),
    o('growth', '成长'),
    o('love', '爱情'),
    o('justice', '正义'),
    o('adventure', '冒险'),
    o('power', '权力'),
    o('family', '亲情'),
    o('friendship', '友情'),
    o('redemption', '救赎'),
    o('fate', '宿命'),
  ],
  style: [
    o('realistic', '写实'),
    o('romantic', '浪漫'),
    o('suspense', '悬疑'),
    o('humor', '幽默'),
    o('dark', '暗黑'),
    o('lyrical', '抒情'),
    o('epic', '史诗'),
    o('absurd', '荒诞'),
    o('fast', '快节奏'),
    o('slow', '慢节奏'),
  ],
  trope: [
    o('rebirth_revenge', '重生复仇'),
    o('system', '系统金手指'),
    o('misunderstanding', '误会梗'),
    o('identity_drop', '马甲掉落'),
    o('childhood', '青梅竹马'),
    o('contract_marriage', '契约婚姻'),
    o('substitute_bride', '替嫁新娘'),
    o('apocalypse', '末世求生'),
  ],
  languageStyle: [
    o('polite', '文明用语'),
    o('light', '轻度表达'),
    o('medium', '中度表达'),
    o('full', '火力全开'),
  ],
  narrativeStructure: [
    o('three_act', '三段式'),
    o('five_act', '五幕式'),
    o('hero_journey', '英雄之旅'),
    o('level_up', '升级流'),
    o('four_phase', '起承转合'),
    o('dungeon', '副本闯关'),
  ],
  literaryGenre: [
    o('romanticism', '浪漫主义'),
    o('realism', '现实主义'),
    o('absurdism', '荒诞派'),
    o('hard_scifi', '硬核科幻'),
    o('existentialism', '存在主义'),
    o('magic_realism', '魔幻现实主义'),
  ],
  tone: [
    o('passionate', '热血燃向'),
    o('light_humor', '轻松幽默'),
    o('warm', '温馨治愈'),
    o('sweet', '甜蜜撒糖'),
    o('literary', '文艺深沉'),
    o('epic', '史诗宏大'),
  ],
  era: [
    o('modern', '现代都市'),
    o('near_future', '近未来'),
    o('far_future', '远未来'),
    o('parallel', '平行世界'),
    o('ancient', '古代架空'),
    o('republic', '民国'),
  ],
  narrativeTime: [
    o('chronological', '顺叙'),
    o('flashback', '倒叙'),
    o('interlude', '插叙'),
    o('parallel_time', '平叙'),
    o('prolepsis', '预叙'),
  ],
  narrativePov: [
    o('first', '第一人称'),
    o('second', '第二人称'),
    o('third', '第三人称'),
    o('omniscient', '全知视角'),
    o('limited', '限知视角'),
    o('multi', '多人视角'),
  ],
  protagonist: [
    o('underdog', '废柴逆袭'),
    o('genius', '天才少年'),
    o('reborn', '重生归来'),
    o('time_traveler', '穿越者'),
    o('hidden_master', '隐世高手'),
    o('ordinary', '普通人'),
    o('avenger', '复仇者'),
    o('chosen', '气运之子'),
  ],
  conflict: [
    o('level_up', '升级打怪'),
    o('revenge', '复仇之路'),
    o('redemption', '自我救赎'),
    o('identity', '寻找身世'),
    o('break_limit', '突破桎梏'),
    o('dominate', '争霸天下'),
    o('mystery', '破解谜团'),
    o('survival', '生存挣扎'),
  ],
  payoff: [
    o('face_slap', '打脸装逼'),
    o('pretend_weak', '扮猪吃虎'),
    o('identity_flip', '身份反转'),
    o('crush', '碾压吊打'),
    o('genius', '智商碾压'),
    o('comeback', '绝地翻盘'),
    o('grassroot', '草根逆袭'),
  ],
  taboo: [
    o('no_saint', '不要圣母'),
    o('no_stupid', '不要无脑'),
    o('no_alpha', '不要龙傲天'),
    o('no_simp', '不要舔狗'),
    o('no_tool', '不要工具人'),
    o('no_harem', '不要后宫'),
    o('no_ntr', '不要 NTR'),
  ],
  openingType: [
    o('conflict', '冲突爆发'),
    o('crisis', '危机降临'),
    o('action', '动作场面'),
    o('life_death', '生死关头'),
    o('betrayal', '遭遇背叛'),
    o('rebirth', '重生穿越'),
    o('awaken', '觉醒获得'),
    o('identity', '身份揭示'),
  ],
  heroEntrance: [
    o('mysterious', '神秘登场'),
    o('strong', '强势亮相'),
    o('return_king', '王者归来'),
    o('lone_wolf', '孤高独行'),
    o('ordinary', '普通人卷入'),
    o('rookie', '菜鸟入门'),
  ],
  outlineType: [
    o('detailed', '详细大纲'),
    o('brief', '简略大纲'),
    o('chapter', '章纲'),
    o('plot', '情节大纲'),
    o('character', '人物大纲'),
    o('timeline', '时间大纲'),
  ],
};

export interface WizardGroup {
  dictKey?: keyof typeof DICT_CODES;
  hint?: string;
  key: string;
  label: string;
  max?: number;
  options?: OptionItem[];
  placeholder?: string;
  required?: boolean;
  type: 'multi' | 'single' | 'text' | 'textarea';
}

export const RHYTHM_OPTIONS: OptionItem[] = [
  o('fast', '快节奏', '每集一个反转'),
  o('medium', '中速', '两集一个反转'),
  o('slow', '慢热', '靠人物关系推进'),
];

export interface WizardStep {
  desc: string;
  groups: WizardGroup[];
  title: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    title: '基础配置',
    desc: '类型、题材与整体基调',
    groups: [
      { key: 'audience', label: '目标受众', dictKey: 'audience', required: true, type: 'single' },
      { key: 'genre', label: '小说类型', dictKey: 'genre', required: true, type: 'multi', max: 3 },
      { key: 'theme', label: '主题设定', dictKey: 'theme', type: 'multi' },
      { key: 'style', label: '写作风格', dictKey: 'style', type: 'multi' },
      { key: 'trope', label: '常见剧情套路', dictKey: 'trope', type: 'multi' },
      { key: 'languageStyle', label: '语言风格', dictKey: 'languageStyle', type: 'single' },
      { key: 'narrativeStructure', label: '叙事结构', dictKey: 'narrativeStructure', type: 'multi' },
      { key: 'literaryGenre', label: '文学流派', dictKey: 'literaryGenre', type: 'multi' },
      { key: 'tone', label: '文风基调', dictKey: 'tone', type: 'multi' },
      { key: 'era', label: '设定时代', dictKey: 'era', required: true, type: 'single' },
    ],
  },
  {
    title: '叙事设定',
    desc: '时间线与人称视角',
    groups: [
      { key: 'narrativeTime', label: '叙事时间', dictKey: 'narrativeTime', required: true, type: 'single' },
      { key: 'narrativePov', label: '叙事视角', dictKey: 'narrativePov', required: true, type: 'single' },
    ],
  },
  {
    title: '角色与冲突',
    desc: '主角、冲突与爽点',
    groups: [
      { key: 'protagonist', label: '主角设定', dictKey: 'protagonist', required: true, type: 'multi' },
      { key: 'conflict', label: '核心冲突', dictKey: 'conflict', hint: '先选的为主要冲突', required: true, type: 'multi' },
      { key: 'payoff', label: '爽点', dictKey: 'payoff', type: 'multi' },
      { key: 'taboo', label: '禁忌', dictKey: 'taboo', hint: '告诉 AI 不要写什么', type: 'multi' },
    ],
  },
  {
    title: '开篇设计',
    desc: '前三集决定留存',
    groups: [
      { key: 'openingType', label: '开篇类型', dictKey: 'openingType', required: true, type: 'single' },
      { key: 'heroEntrance', label: '主角出场', dictKey: 'heroEntrance', required: true, type: 'single' },
      { key: 'hook', label: '开篇钩子', type: 'text', placeholder: '例如：开场 10 秒内抛出换角冲突' },
    ],
  },
  {
    title: '总纲与补充',
    desc: '大纲框架与创作意图',
    groups: [
      { key: 'outlineType', label: '总纲类型', dictKey: 'outlineType', required: true, type: 'single' },
      { key: 'rhythm', label: '剧情节奏', options: RHYTHM_OPTIONS, type: 'single' },
      { key: 'corePhilosophy', label: '核心哲思', type: 'text' },
      { key: 'storySummary', label: '故事概括', type: 'textarea' },
      { key: 'loveLine', label: '感情线', type: 'text' },
    ],
  },
];

export function dictItemToOption(item: DictItem): OptionItem {
  const extra = (item as any).extra ?? {};
  return {
    label: String(item.label),
    value: String(item.value),
    desc: extra.desc ?? (item as any).desc,
    color: item.color,
  };
}
