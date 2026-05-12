import { 
  UserSilenceDuration, 
  AppUsageWithin30d, 
  UserRecentlyActive,  
  UserAppActiveState,
  SimilarAppUsageDuration,
  SimilarAppUsageRating,
  AgeGroup,
  Gender,
  ConsumptionLevel,
  PhonePrice,
  PropertyStatus,
  Occupations,
  Marriage,
  Children,
  UserRandomBucket,
  ReportAttributionParameters,
  TagsName,
  PermanentRegion
} from './enums';

// 用户沉默时长
export const silenceOptions = [
  { label: '1天沉默', value: UserSilenceDuration.oneDaySilence },
  { label: '3天沉默', value: UserSilenceDuration.threeDaySilence },
  { label: '7天沉默', value: UserSilenceDuration.sevenDaySilence },
  { label: '15天沉默', value: UserSilenceDuration.fifteenDaySilence },
  { label: '30天沉默', value: UserSilenceDuration.thirtyDaySilence },
];

// 转换标签
export const getSilenceLabel = (val: UserSilenceDuration) => {
  return silenceOptions.find(item => item.value === val)?.label || '-';
};

//近30天APP使用天数
export const appUsageOptions = [
  { label: '(0,3]天', value: AppUsageWithin30d.zeroToThree },
  { label: '(3,7]天', value: AppUsageWithin30d.threeToSeven },
  { label: '(7,14]天', value: AppUsageWithin30d.sevenToFourteen },
  { label: '(14,21]天', value: AppUsageWithin30d.fourteenToTwentyOne },
  { label: '(21,30]天', value: AppUsageWithin30d.twentyOneToThirty },
];

// 单选转换
export const getAppUsageLabel = (val: AppUsageWithin30d) => {
  return appUsageOptions.find(item => item.value === val)?.label || '-';
};

// 多选批量转换
export const getAppUsageLabels = (vals: AppUsageWithin30d[]) => {
  return vals.map(getAppUsageLabel).filter(Boolean).join(',');
};

// 用户近日活跃
export const recentlyActiveOptions = [
  { label: '近1天使用过APP', value: UserRecentlyActive.last1DayUsed },
  { label: '近3天使用过APP', value: UserRecentlyActive.last3DaysUsed },
  { label: '近7天使用过APP', value: UserRecentlyActive.last7DaysUsed },
  { label: '近15天使用过APP', value: UserRecentlyActive.last15DaysUsed },
  { label: '近30天使用过APP', value: UserRecentlyActive.last30DaysUsed },
  { label: '近60天使用过APP', value: UserRecentlyActive.last60DaysUsed },
  { label: '近90天使用过APP', value: UserRecentlyActive.last90DaysUsed },
];

/** 单个值转中文标签（详情页用） */
export const getRecentlyActiveLabel = (val: UserRecentlyActive) => {
  return recentlyActiveOptions.find(item => item.value === val)?.label || '-';
};

/** 多选批量转中文标签 */
export const getRecentlyActiveLabels = (vals: UserRecentlyActive[]) => {
  return vals.map(getRecentlyActiveLabel).filter(Boolean).join(',');
};
//用户激活状态
export const userAppActiveStateOptions = [
  { label: '潜在流失新用户', value: UserAppActiveState.potentialLostNewUser },
];
export const getUserAppActiveStateLabel = (val: UserAppActiveState) => {
  return userAppActiveStateOptions.find(item => item.value === val)?.label || '-';
};

//同类应用使用时长
export const similarAppUsageDurationOptions = [
  { label: '长', value: SimilarAppUsageDuration.long },
  { label: '中', value: SimilarAppUsageDuration.middle },
  { label: '短', value: SimilarAppUsageDuration.short },
];
export const getSimilarAppUsageDurationLabel = (val: SimilarAppUsageDuration) => {
  return similarAppUsageDurationOptions.find(item => item.value === val)?.label || '-';
};
export const getSimilarAppUsageDurationLabels = (vals: SimilarAppUsageDuration[]) => {
  return vals.map(getSimilarAppUsageDurationLabel).filter(Boolean).join(',');
};

//同类应用使用频率
export const similarAppUsageRatingOptions = [
  { label: '经常', value: SimilarAppUsageRating.often },
  { label: '有时', value: SimilarAppUsageRating.sometime },
  { label: '偶尔', value: SimilarAppUsageRating.occasionally },
];
export const getSimilarAppUsageRatingLabel = (val: SimilarAppUsageRating) => {
  return similarAppUsageRatingOptions.find(item => item.value === val)?.label || '-';
};
export const getSimilarAppUsageRatingLabels = (vals: SimilarAppUsageRating[]) => {
  return vals.map(getSimilarAppUsageRatingLabel).filter(Boolean).join(',');
};

//年龄分组
export const ageGroupOptions = [
  { label: '18~23岁', value: AgeGroup.age18To23 },
  { label: '24~34岁', value: AgeGroup.age24To34 },
  { label: '35~44岁', value: AgeGroup.age35To44 },
  { label: '45~54岁', value: AgeGroup.age45To54 },
  { label: '55岁及以上', value: AgeGroup.age55AndOlder },
];
export const getAgeGroupLabel = (val: AgeGroup) => {
  return ageGroupOptions.find(item => item.value === val)?.label || '-';
};
export const getAgeGroupLabels = (vals: AgeGroup[]) => {
  return vals.map(getAgeGroupLabel).filter(Boolean).join(',');
};

// 性别
export const genderOptions = [
  { label: '男', value: Gender.male },
  { label: '女', value: Gender.female },
];
export const getGenderLabel = (val: Gender) => {
  return genderOptions.find(item => item.value === val)?.label || '-';
};

// 消费水平
export const consumptionLevelOptions = [
  { label: '高', value: ConsumptionLevel.high },
];
export const getConsumptionLevelLabel = (val: ConsumptionLevel) => {
  return consumptionLevelOptions.find(item => item.value === val)?.label || '-';
};
export const getConsumptionLevelLabels = (vals: ConsumptionLevel[]) => {
  return vals.map(getConsumptionLevelLabel).filter(Boolean).join(',');
};

//手机价格
export const phonePriceOptions = [
  { label: '1000以内', value: PhonePrice.under1000 },
  { label: '1000~2000', value: PhonePrice.from1000To2000 },
  { label: '2000~3000', value: PhonePrice.from2000To3000 },
];
export const getPhonePriceLabel = (val: PhonePrice) => {
  return phonePriceOptions.find(item => item.value === val)?.label || '-';
};
export const getPhonePriceLabels = (vals: PhonePrice[]) => {
  return vals.map(getPhonePriceLabel).filter(Boolean).join(',');
};
// 财产状态
export const propertyStatusOptions = [
  { label: '有房人士', value: PropertyStatus.houseOwner },
  { label: '有车一族', value: PropertyStatus.carOwner },
];
export const getPropertyStatusLabel = (val: PropertyStatus) => {
  return propertyStatusOptions.find(item => item.value === val)?.label || '-';
};
export const getPropertyStatusLabels = (vals: PropertyStatus[]) => {
  return vals.map(getPropertyStatusLabel).filter(Boolean).join(',');
};
// 职业
export const occupationsOptions = [
  { label: '公务员', value: Occupations.civilServant },
  { label: '医生', value: Occupations.doctor },
  { label: '司机', value: Occupations.driver },
  { label: '办公人员', value: Occupations.officeWorker },
  { label: '个体户', value: Occupations.selfEmployed },
  { label: '教师', value: Occupations.teacher },
]
export const getOccupationsLabel = (val: Occupations) => {
  return occupationsOptions.find(item => item.value === val)?.label || '-';
};
export const getOccupationsLabels = (vals: Occupations[]) => {
  return vals.map(getOccupationsLabel).filter(Boolean).join(',');
};
// 婚姻状况
export const marriageOptions = [
  { label: '单身', value: Marriage.single },
  { label: '已婚', value: Marriage.married },
  { label: '恋爱', value: Marriage.amativeness },
];
export const getMarriageLabel = (val: Marriage) => {
  return marriageOptions.find(item => item.value === val)?.label || '-';
};
export const getMarriageLabels = (vals: Marriage[]) => {
  return vals.map(getMarriageLabel).filter(Boolean).join(',');
};
// 子女
export const childrenOptions = [
  { label: '青少年', value: Children.teens },
  { label: '婴幼儿', value: Children.infancy },
  { label: '孕育期', value: Children.gestationPeriod },
];
export const getChildrenLabel = (val: Children) => {
  return childrenOptions.find(item => item.value === val)?.label || '-';
};
export const getChildrenLabels = (vals: Children[]) => {
  return vals.map(getChildrenLabel).filter(Boolean).join(',');
};
// 人群随机标识
export const userRandomBucketOptions = [
  { label: '0', value: UserRandomBucket.bucket0 },
  { label: '1', value: UserRandomBucket.bucket1 },
  { label: '2', value: UserRandomBucket.bucket2 },
  { label: '3', value: UserRandomBucket.bucket3 },
  { label: '4', value: UserRandomBucket.bucket4 },
  { label: '5', value: UserRandomBucket.bucket5 },
  { label: '6', value: UserRandomBucket.bucket6 },
  { label: '7', value: UserRandomBucket.bucket7 },
  { label: '8', value: UserRandomBucket.bucket8 },
  { label: '9', value: UserRandomBucket.bucket9 },
];

/** 单个随机桶转中文标签（详情页用） */
export const getUserRandomBucketLabel = (val: UserRandomBucket) => {
  return userRandomBucketOptions.find(item => item.value === val)?.label || '-';
};

/** 多选随机桶批量转中文标签（表格回显用） */
export const getUserRandomBucketLabels = (vals: UserRandomBucket[]) => {
  return vals.map(getUserRandomBucketLabel).filter(Boolean).join(',');
};
// 点击回执
export const userClickReceiptOptions = [
  { label: '仅发送支持点击回执上报的设备', value: ReportAttributionParameters.sendReportingAttributionDevices }
];
export const getUserClickReceiptLabel = (val: ReportAttributionParameters) => {
  return userClickReceiptOptions.find(item => item.value === val)?.label || '-';
};
export const getUserClickReceiptLabels = (vals: ReportAttributionParameters[]) => {
  return vals.map(getUserClickReceiptLabel).filter(Boolean).join(',');
};
// 标签名称
export const tagsNameOptions = [
  { label: '用户沉默时长', value: TagsName.cUserSilenceDuration },
  { label: '近30天APP使用天数', value: TagsName.cAppUsageWithin30dDev },
  { label: '用户近日活跃', value: TagsName.cRecentlyActive },
  { label: '用户激活状态', value: TagsName.cAppActiveState },
  { label: '同类应用使用时长', value: TagsName.cSimilarAppUsageDuration },
  { label: '同类应用使用频率', value: TagsName.cSimilarAppUsageRating },
  { label: '地域', value: TagsName.cPermanentRegion },
  { label: '年龄', value: TagsName.cAgeGroup },
  { label: '性别', value: TagsName.cGender },
  { label: '消费水平', value: TagsName.cConsumptionLevel },
  { label: '婚恋状况', value: TagsName.cMarriage },
  { label: '子女', value: TagsName.cChildren },
  { label: '手机价格', value: TagsName.cPhonePrice },
  { label: '财产状态', value: TagsName.cPropertyStatus },
  { label: '职业', value: TagsName.cOccupations },
  { label: '人群随机标识', value: TagsName.cRandomNum },
  { label: '点击回执 ', value: TagsName.reportAttributionParameters },
]
export const getTagsNameLabel = (val: TagsName) => {
  return tagsNameOptions.find(item => item.value === val)?.label || '-';
};
export const getTagsNameLabels = (vals: TagsName[]) => {
  return vals.map(getTagsNameLabel).filter(Boolean).join(',');
};
export const permanentRegionOptions = [
  { label: '北京市', value: PermanentRegion.beijing },
  { label: '天津市', value: PermanentRegion.tianjin },
  { label: '河北省', value: PermanentRegion.hebei },
  { label: '山西省', value: PermanentRegion.shangxi },
  { label: '内蒙古自治区', value: PermanentRegion.innerMongolia },
  { label: '辽宁省', value: PermanentRegion.liaoning },
  { label: '吉林省', value: PermanentRegion.jilin },
  { label: '黑龙江省', value: PermanentRegion.heilongjiang },
  { label: '上海市', value: PermanentRegion.shanghai },
  { label: '江苏省', value: PermanentRegion.jiangsu },
  { label: '浙江省', value: PermanentRegion.zhejiang },
  { label: '安徽省', value: PermanentRegion.anhui },
  { label: '福建省', value: PermanentRegion.fujian },
  { label: '江西省', value: PermanentRegion.jiangxi },
  { label: '山东省', value: PermanentRegion.shandong },
  { label: '河南省', value: PermanentRegion.henan },
  { label: '湖北省', value: PermanentRegion.hubei },
  { label: '湖南省', value: PermanentRegion.hunan },
  { label: '广东省', value: PermanentRegion.guangdong },
  { label: '广西壮族自治区', value: PermanentRegion.guangxi },
  { label: '海南省', value: PermanentRegion.hainan },
  { label: '重庆市', value: PermanentRegion.chongqing },
  { label: '四川省', value: PermanentRegion.sichuan },
  { label: '贵州省', value: PermanentRegion.guizhou },
  { label: '云南省', value: PermanentRegion.yunnan },
  { label: '西藏自治区', value: PermanentRegion.xizang },
  { label: '陕西省', value: PermanentRegion.shanxi },
  { label: '甘肃省', value: PermanentRegion.gansu },
  { label: '青海省', value: PermanentRegion.qinghai },
  { label: '宁夏回族自治区', value: PermanentRegion.ningxia },
  { label: '新疆维吾尔自治区', value: PermanentRegion.xinjiang },
  { label: '香港特别行政区', value: PermanentRegion.xianggang },
  { label: '澳门特别行政区', value: PermanentRegion.aomeng },
  { label: '台湾省', value: PermanentRegion.taiwan },

  // 云南市级
  { label: '临沧市', value: PermanentRegion.lincang },
  { label: '丽江市', value: PermanentRegion.lijiang },
  { label: '大理白族自治州', value: PermanentRegion.dali },
  { label: '曲靖市', value: PermanentRegion.qujing },
  { label: '昆明市', value: PermanentRegion.kunming },
  { label: '保山市', value: PermanentRegion.baoshan },
  { label: '文山壮族苗族自治州', value: PermanentRegion.wenshan },
  { label: '玉溪市', value: PermanentRegion.yuxi },
  { label: '昭通市', value: PermanentRegion.shaotong },
  { label: '楚雄彝族自治州', value: PermanentRegion.chuxiong },
  { label: '普洱市', value: PermanentRegion.puer },
  { label: '德宏傣族景颇族自治州', value: PermanentRegion.dehong },
  { label: '怒江傈僳族自治州', value: PermanentRegion.nujiang },
  { label: '红河哈尼族彝族自治州', value: PermanentRegion.hongheHaniAndYiAutonomousPrefecture },
  { label: '西双版纳傣族自治州', value: PermanentRegion.xishuangbannaDaiAutonomousPrefecture },
  { label: '迪庆藏族自治州', value: PermanentRegion.diqingTibetanAutonomousPrefecture },

  // 内蒙古自治区
  { label: '乌兰察布市', value: PermanentRegion.ulanqabCity},
  { label: '乌海市', value: PermanentRegion.wuhaiCity},
  { label: '兴安盟', value: PermanentRegion.xinganLeague},
  { label: '包头市', value: PermanentRegion.baotouCity},
  { label: '赤峰市', value: PermanentRegion.chifengCity},
  { label: '通辽市', value: PermanentRegion.tongliaoCity},
  { label: '鄂尔多斯市', value: PermanentRegion.ordosCity},
  { label: '呼伦贝尔市', value: PermanentRegion.hulunbuirCity},
  { label: '巴彦淖尔市', value: PermanentRegion.bayannurCity},
  { label: '呼和浩特市', value: PermanentRegion.hohohotCity},
  { label: '锡林郭勒盟', value: PermanentRegion.xilingolLeague},
  { label: '阿拉善盟', value: PermanentRegion.alxaLeague},

  { label: '北京市（市级）', value: PermanentRegion.beijingCity},
  { label: '上海市（市级）', value: PermanentRegion.shanghaiCity},
  // 吉林市级
  { label: '吉林市', value: PermanentRegion.jilinCity},
  { label: '长春市', value: PermanentRegion.changchunCity},
  { label: '延边朝鲜族自治州', value: PermanentRegion.yanbianKoreanAutonomousPrefecture},
  { label: '四平市', value: PermanentRegion.sipingCity},
  { label: '辽源市', value: PermanentRegion.liaoyuanCity},
  { label: '松原市', value: PermanentRegion.songyuanCity},
  { label: '白城市', value: PermanentRegion.baichengCity},
  { label: '白山市', value: PermanentRegion.baishanCity},
  { label: '通化市', value: PermanentRegion.tonghuaCity},
  // 四川市级
  { label: '乐山市', value: PermanentRegion.leshanCity},
  { label: '南充市', value: PermanentRegion.nanchongCity},
  { label: '成都市', value: PermanentRegion.chengduCity},
  { label: '攀枝花市', value: PermanentRegion.panzhihuaCity},
  { label: '自贡市', value: PermanentRegion.zigongCity},
  { label: '泸州市', value: PermanentRegion.luzhouCity},
  { label: '德阳市', value: PermanentRegion.deyangCity},
  { label: '广安市', value: PermanentRegion.guanganCity},
  { label: '宜宾市', value: PermanentRegion.yibinCity},
  { label: '巴中市', value: PermanentRegion.bazhongCity},
  { label: '内江市', value: PermanentRegion.neijiangCity},
  { label: '资阳市', value: PermanentRegion.ziyangCity},
  { label: '达州市', value: PermanentRegion.dazhouCity},
  { label: '遂宁市', value: PermanentRegion.suiningCity},
  { label: '雅安市', value: PermanentRegion.yaanCity},
  { label: '广元市', value: PermanentRegion.guangyuanCity},
  { label: '阿坝藏族羌族自治州', value: PermanentRegion.abaTibetanAndQiangAutonomousPrefecture},
  { label: '甘孜藏族自治州', value: PermanentRegion.ganziTibetanAutonomousPrefecture},
  { label: '凉山彝族自治州', value: PermanentRegion.liangshanYiAutonomousPrefecture},

  { label: '天津市（市级）', value: PermanentRegion.tianjinCity},

  // 宁夏回族自治区
  { label: '中卫市', value: PermanentRegion.zhongweiCity},
  { label: '固原市', value: PermanentRegion.guyuanCity},
  { label: '吴忠市', value: PermanentRegion.wuzhongCity},
  { label: '银川市', value: PermanentRegion.yinchuanCity},
  { label: '石嘴山市', value: PermanentRegion.shizuishanCity},

  // 安徽省市级
  { label: '亳州市', value: PermanentRegion.bozhouCity},
  { label: '六安市', value: PermanentRegion.luanCity},
  { label: '合肥市', value: PermanentRegion.hefeiCity},
  { label: '芜湖市', value: PermanentRegion.wuhuCity},
  { label: '蚌埠市', value: PermanentRegion.bengbuCity},
  { label: '淮南市', value: PermanentRegion.huainanCity},
  { label: '马鞍山市', value: PermanentRegion.maanshanCity},
  { label: '淮北市', value: PermanentRegion.huaibeiCity},
  { label: '铜陵市', value: PermanentRegion.tonglingCity},
  { label: '宿州市', value: PermanentRegion.suzhouCity},
  { label: '安庆市', value: PermanentRegion.anqingCity},
  { label: '黄山市', value: PermanentRegion.huangshanCity},
  { label: '滁州市', value: PermanentRegion.chuzhouCity},
  { label: '阜阳市', value: PermanentRegion.fuyangCity},
  { label: '宣城市', value: PermanentRegion.xuanchengCity},

  // 山东省市级
  { label: '东营市', value: PermanentRegion.dongyingCity},
  { label: '泰州市', value: PermanentRegion.taizhou},
  { label: '威海市', value: PermanentRegion.weihaiCity},
  { label: '日照市', value: PermanentRegion.rizhaoCity},
  { label: '莱芜市', value: PermanentRegion.laiwuCity},
  { label: '临沂市', value: PermanentRegion.linyiCity},
  { label: '德州市', value: PermanentRegion.dezhouCity},
  { label: '聊城市', value: PermanentRegion.liaochengCity},
  { label: '菏泽市', value: PermanentRegion.hezeCity},
  { label: '滨州市', value: PermanentRegion.binzhouCity},
  { label: '济南市', value: PermanentRegion.jinanCity},
  { label: '青岛市', value: PermanentRegion.qingdaoCity},
  { label: '淄博市', value: PermanentRegion.ziboCity},
  { label: '枣庄市', value: PermanentRegion.zaozhuangCity},
  { label: '烟台市', value: PermanentRegion.yantaiCity},
  { label: '潍坊市', value: PermanentRegion.weifangCity},
  { label: '济宁市', value: PermanentRegion.jiningCity},
  { label: '泰安市', value: PermanentRegion.taianCity},

  // 山西省市级
  { label: '临汾市', value: PermanentRegion.linfenCity},
  { label: '吕梁市', value: PermanentRegion.luliangCity},
  { label: '太原市', value: PermanentRegion.taiyuanCity},
  { label: '大同市', value: PermanentRegion.datongCity},
  { label: '运城市', value: PermanentRegion.yunchengCity},
  { label: '忻州市', value: PermanentRegion.xinzhouCity},
  { label: '晋中市', value: PermanentRegion.jinzhongCity},
  { label: '朔州市', value: PermanentRegion.shuozhouCity},
  { label: '晋城市', value: PermanentRegion.jinchengCity},
  { label: '阳泉市', value: PermanentRegion.yangquanCity},

  // 广东省市级
  { label: '东莞市', value: PermanentRegion.dongguanCity},
  { label: '中山市', value: PermanentRegion.zhongshanCity},
  { label: '潮州市', value: PermanentRegion.chaozhouCity},
  { label: '揭阳市', value: PermanentRegion.jieyangCity},
  { label: '河源市', value: PermanentRegion.heyuanCity},
  { label: '汕尾市', value: PermanentRegion.shanweiCity},
  { label: '阳江市', value: PermanentRegion.yangjiangCity},
  { label: '茂名市', value: PermanentRegion.maomingCity},
  { label: '韶关市', value: PermanentRegion.shaoguanCity},
  { label: '梅州市', value: PermanentRegion.meizhouCity},
  { label: '肇庆市', value: PermanentRegion.zhaoqingCity},
  { label: '惠州市', value: PermanentRegion.huizhouCity},
  { label: '汕头市', value: PermanentRegion.shantouCity},
  { label: '湛江市', value: PermanentRegion.zhanjiangCity},
  { label: '江门市', value: PermanentRegion.jiangmenCity},
  { label: '深圳市', value: PermanentRegion.shenzhenCity},
  { label: '珠海市', value: PermanentRegion.zhuhaiCity},
  { label: '佛山市', value: PermanentRegion.foshanCity},
  { label: '清远市', value: PermanentRegion.qingyuanCity},

  // 广西壮族自治区
  { label: '北海市', value: PermanentRegion.beihaiCity},
  { label: '南宁市', value: PermanentRegion.nanningCity},
  { label: '柳州市', value: PermanentRegion.liuzhouCity},
  { label: '桂林市', value: PermanentRegion.guilinCity},
  { label: '梧州市', value: PermanentRegion.wuzhouCity},
  { label: '防城港市', value: PermanentRegion.fangchenggangCity},
  { label: '玉林市', value: PermanentRegion.yulinCity},
  { label: '贵港市', value: PermanentRegion.guigangCity},
  { label: '贺州市', value: PermanentRegion.hezhouCity},
  { label: '百色市', value: PermanentRegion.baiseCity},
  { label: '河池市', value: PermanentRegion.hechiCity},
  { label: '来宾市', value: PermanentRegion.laibinCity},
  { label: '崇左市', value: PermanentRegion.chongzuoCity},
  { label: '钦州市', value: PermanentRegion.qinzhouCity},

  // 新疆维吾尔自治区
  { label: '乌鲁木齐市', value: PermanentRegion.urumqiCity},
  { label: '伊犁哈萨克自治州', value: PermanentRegion.iliKazakhAutonomousPrefecture},
  { label: '克拉玛依市', value: PermanentRegion.karamayCity},
  { label: '克孜勒苏柯尔克孜自治州', value: PermanentRegion.kizilsuKirghizAutonomousPrefecture},
  { label: '吐鲁番市', value: PermanentRegion.turpanCity},
  { label: '哈密市', value: PermanentRegion.hamiCity},
  { label: '和田地区', value: PermanentRegion.hetianRegion},
  { label: '阿勒泰地区', value: PermanentRegion.altayRegion},
  { label: '昌吉回族自治州', value: PermanentRegion.changjiHuiAutonomousPrefecture},
  { label: '博尔塔拉蒙古自治州', value: PermanentRegion.bortalaMongolianAutonomousPrefecture},
  { label: '喀什地区', value: PermanentRegion.kashgarRegion},
  { label: '巴音郭楞蒙古自治州', value: PermanentRegion.bayingolinMongolianAutonomousPrefecture},
  { label: '新疆维吾尔自治区直辖县级行政单位', value: PermanentRegion.xinjiangDirectlyAdministeredCounties},
  { label: '塔城地区', value: PermanentRegion.tachengRegion},

  // 江苏省市级
  { label: '南京市', value: PermanentRegion.nanjingCity},
  { label: '无锡市', value: PermanentRegion.wuxiCity},
  { label: '常州市', value: PermanentRegion.changzhouCity},
  { label: '徐州市', value: PermanentRegion.xuzhouCity},
  { label: '宿迁市', value: PermanentRegion.suqianCity},
  { label: '扬州市', value: PermanentRegion.yangzhouCity},
  { label: '淮安市', value: PermanentRegion.huaianCity},
  { label: '盐城市', value: PermanentRegion.yanchengCity},
  { label: '连云港市', value: PermanentRegion.lianyungangCity},
  { label: '苏州市', value: PermanentRegion.suzhou},
  { label: '镇江市', value: PermanentRegion.zhenjiangCity},

  // 江西省市级
  { label: '上饶市', value: PermanentRegion.shangraoCity},
  { label: '九江市', value: PermanentRegion.jiujiangCity},
  { label: '抚州市', value: PermanentRegion.fuzhou},
  { label: '景德镇市', value: PermanentRegion.jingdezhenCity},
  { label: '南昌市', value: PermanentRegion.nanchangCity},
  { label: '萍乡市', value: PermanentRegion.pingxiangCity},
  { label: '吉安市', value: PermanentRegion.jianCity},
  { label: '赣州市', value: PermanentRegion.ganzhouCity},
  { label: '宜春市', value: PermanentRegion.yichunCity},
  { label: '鹰潭市', value: PermanentRegion.yingtanCity},
  { label: '新余市', value: PermanentRegion.xinyuCity},

  // 河北省市级
  { label: '保定市', value: PermanentRegion.baodingCity},
  { label: '张家口市', value: PermanentRegion.zhangjiakouCity},
  { label: '承德市', value: PermanentRegion.chengdeCity},
  { label: '唐山市', value: PermanentRegion.tangshanCity},
  { label: '沧州市', value: PermanentRegion.cangzhouCity},
  { label: '廊坊市', value: PermanentRegion.langfangCity},
  { label: '衡水市', value: PermanentRegion.hengshuiCity},
  { label: '邢台市', value: PermanentRegion.xingtaiCity},
  { label: '秦皇岛市', value: PermanentRegion.qinhuangdaoCity},
  { label: '邯郸市', value: PermanentRegion.handanCity},

  // 河南省市级
  { label: '三门峡市', value: PermanentRegion.sanmenxiaCity},
  { label: '信阳市', value: PermanentRegion.xinyangCity},
  { label: '南阳市', value: PermanentRegion.nanyangCity},
  { label: '周口市', value: PermanentRegion.zhoukouCity},
  { label: '驻马店市', value: PermanentRegion.zhumadianCity},
  { label: '商丘市', value: PermanentRegion.shangqiuCity},
  { label: '平顶山市', value: PermanentRegion.pingdingshanCity},
  { label: '安阳市', value: PermanentRegion.anyangCity},
  { label: '开封市', value: PermanentRegion.kaifengCity},
  { label: '鹤壁市', value: PermanentRegion.hebiCity},
  { label: '洛阳市', value: PermanentRegion.luoyangCity},
  { label: '新乡市', value: PermanentRegion.xinxiangCity},
  { label: '焦作市', value: PermanentRegion.jiaozuoCity},
  { label: '濮阳市', value: PermanentRegion.puyangCity},
  { label: '许昌市', value: PermanentRegion.xuchangCity},
  { label: '漯河市', value: PermanentRegion.luoheCity},
  { label: '郑州市', value: PermanentRegion.zhengzhouCity},

  // 浙江省市级
  { label: '丽水市', value: PermanentRegion.lishuiCity},
  { label: '台州市', value: PermanentRegion.taizhouCity},
  { label: '嘉兴市', value: PermanentRegion.jiaxingCity},
  { label: '湖州市', value: PermanentRegion.huzhouCity},
  { label: '杭州市', value: PermanentRegion.hangzhouCity},
  { label: '宁波市', value: PermanentRegion.ningboCity},
  { label: '温州市', value: PermanentRegion.wenzhouCity},
  { label: '舟山市', value: PermanentRegion.zhoushanCity},
  { label: '衢州市', value: PermanentRegion.quzhouCity},
  { label: '金华市', value: PermanentRegion.jinhuaCity},

  // 海南省市级
  { label: '三亚市', value: PermanentRegion.sanyaCity},
  { label: '海口市', value: PermanentRegion.haikouCity},
  { label: '三沙市', value: PermanentRegion.sanshaCity},
  { label: '儋州市', value: PermanentRegion.danzhouCity},
  { label: '海南省直辖县级行政单位', value: PermanentRegion.hainanDirectlyAdministeredCounties},

  // 湖北省市级
  { label: '十堰市', value: PermanentRegion.shiyanCity},
  { label: '随州市', value: PermanentRegion.suizhouCity},
  { label: '咸宁市', value: PermanentRegion.xianningCity},
  { label: '孝感市', value: PermanentRegion.xiaoganCity},
  { label: '宜昌市', value: PermanentRegion.yichangCity},
  { label: '襄阳市', value: PermanentRegion.xiangyangCity},
  { label: '鄂州市', value: PermanentRegion.ezhouCity},
  { label: '荆门市', value: PermanentRegion.jingmenCity},
  { label: '荆州市', value: PermanentRegion.jingzhouCity},
  { label: '恩施土家族苗族自治州', value: PermanentRegion.enshiTujiaAndMiaoAutonomousPrefecture},
  { label: '武汉市', value: PermanentRegion.wuhanCity},
  { label: '黄冈市', value: PermanentRegion.huanggangCity},
  { label: '黄石市', value: PermanentRegion.huangshiCity},

  // 湖南省市级
  { label: '娄底市', value: PermanentRegion.loudiCity},
  { label: '岳阳市', value: PermanentRegion.yueyangCity},
  { label: '常德市', value: PermanentRegion.changdeCity},
  { label: '湘潭市', value: PermanentRegion.xiangtanCity},
  { label: '株洲市', value: PermanentRegion.zhuzhouCity},
  { label: '张家界市', value: PermanentRegion.zhangjiajieCity},
  { label: '益阳市', value: PermanentRegion.yiyangCity},
  { label: '郴州市', value: PermanentRegion.chenzhouCity},
  { label: '永州市', value: PermanentRegion.yongzhouCity},
  { label: '怀化市', value: PermanentRegion.huaihuaCity},
  { label: '邵阳市', value: PermanentRegion.shaoyangCity},
  { label: '长沙市', value: PermanentRegion.changshaCity},

  // 甘肃省市级
  { label: '临夏回族自治州', value: PermanentRegion.linxiaHuiAutonomousPrefecture},
  { label: '兰州市', value: PermanentRegion.lanzhouCity},
  { label: '嘉峪关市', value: PermanentRegion.jiayuguanCity},
  { label: '天水市', value: PermanentRegion.tianshuiCity},
  { label: '定西市', value: PermanentRegion.dingxiCity},
  { label: '陇南市', value: PermanentRegion.longnanCity},
  { label: '平凉市', value: PermanentRegion.pingliangCity},
  { label: '庆阳市', value: PermanentRegion.qingyangCity},
  { label: '武威市', value: PermanentRegion.wuweiCity},
  { label: '张掖市', value: PermanentRegion.zhangyeCity},
  { label: '酒泉市', value: PermanentRegion.jiuquanCity},
  { label: '白银市', value: PermanentRegion.baiyinCity},
  { label: '金昌市', value: PermanentRegion.jinchangCity},

  // 福建省市级
  { label: '三明市', value: PermanentRegion.sanmingCity},
  { label: '南平市', value: PermanentRegion.nanpingCity},
  { label: '莆田市', value: PermanentRegion.putianCity},
  { label: '泉州市', value: PermanentRegion.quanzhouCity},
  { label: '厦门市', value: PermanentRegion.xiamenCity},
  { label: '漳州市', value: PermanentRegion.zhangzhouCity},
  { label: '宁德市', value: PermanentRegion.ningdeCity},
  { label: '福州市', value: PermanentRegion.fuzhouCity},
  { label: '龙岩市', value: PermanentRegion.longyanCity},

  // 西藏自治区 
  { label: '山南市', value: PermanentRegion.shannanCity},
  { label: '拉萨市', value: PermanentRegion.lhasaCity},
  { label: '日喀则市', value: PermanentRegion.xigazeCity},
  { label: '昌都市', value: PermanentRegion.changduCity},
  { label: '林芝市', value: PermanentRegion.linzhiCity},
  { label: '那曲市', value: PermanentRegion.nagquCity},
  { label: '阿里地区', value: PermanentRegion.aliRegion},

  // 贵州市级
  { label: '六盘水市', value: PermanentRegion.liupanshuiCity},
  { label: '安顺市', value: PermanentRegion.anshunCity},
  { label: '贵阳市', value: PermanentRegion.guiyangCity},
  { label: '铜仁市', value: PermanentRegion.tongrenCity},
  { label: '毕节市', value: PermanentRegion.bijieCity},
  { label: '遵义市', value: PermanentRegion.zunyiCity},
  { label: '黔东南苗族侗族自治州', value: PermanentRegion.qiandongnanMiaoAndDongAutonomousPrefecture},
  { label: '黔南布依族苗族自治州', value: PermanentRegion.qiannanBuyiAndMiaoAutonomousPrefecture},
  { label: '黔西南布依族苗族自治州', value: PermanentRegion.qianxinanBuyiAndMiaoAutonomousPrefecture},
  
  // 辽宁市级
  { label: '沈阳市', value: PermanentRegion.shenyangCity },
  { label: '丹东市', value: PermanentRegion.dandongCity },
  { label: '大连市', value: PermanentRegion.dalianCity },
  { label: '抚顺市', value: PermanentRegion.fushunCity },
  { label: '盘锦市', value: PermanentRegion.panjin },
  { label: '朝阳市', value: PermanentRegion.chaoyangCity },
  { label: '本溪市', value: PermanentRegion.benxiCity },
  { label: '营口市', value: PermanentRegion.yingkou },
  { label: '葫芦岛市', value: PermanentRegion.huludao },
  { label: '辽阳市', value: PermanentRegion.liaoyang },
  { label: '铁岭市', value: PermanentRegion.tieling },
  { label: '锦州市', value: PermanentRegion.jinzhou },
  { label: '阜新市', value: PermanentRegion.fuxin },
  { label: '鞍山市', value: PermanentRegion.anshan },

  // 陕西市级
  { label: '咸阳市', value: PermanentRegion.xianyang },
  { label: '商洛市', value: PermanentRegion.shangluo },
  { label: '安康市', value: PermanentRegion.ankang },
  { label: '宝鸡市', value: PermanentRegion.baoji },
  { label: '延安市', value: PermanentRegion.yanan },
  { label: '榆林市', value: PermanentRegion.yulin },
  { label: '汉中市', value: PermanentRegion.hanzhong },
  { label: '渭南市', value: PermanentRegion.weinan },
  { label: '西安市', value: PermanentRegion.xian },
  { label: '铜川市', value: PermanentRegion.tongchuan },

  // 青海市级
  { label: '果洛藏族自治州', value: PermanentRegion.guoluo },
  { label: '海东市', value: PermanentRegion.haidong },
  { label: '海北藏族自治州', value: PermanentRegion.haibei },
  { label: '海南藏族自治州', value: PermanentRegion.hainanTibet },
  { label: '海西蒙古族藏族自治州', value: PermanentRegion.haixi },
  { label: '玉树藏族自治州', value: PermanentRegion.yushu },
  { label: '西宁市', value: PermanentRegion.xining },
  { label: '黄南藏族自治州', value: PermanentRegion.huangnan },

  // 黑龙江市级
  { label: '七台河市', value: PermanentRegion.qitaihe },
  { label: '伊春市', value: PermanentRegion.yichun },
  { label: '佳木斯市', value: PermanentRegion.jiamusi },
  { label: '双鸭山市', value: PermanentRegion.shuangyashan },
  { label: '哈尔滨市', value: PermanentRegion.harbin },
  { label: '大兴安岭地区', value: PermanentRegion.daxinganling },
  { label: '大庆市', value: PermanentRegion.daqing },
  { label: '牡丹江市', value: PermanentRegion.mudanjiang },
  { label: '绥化市', value: PermanentRegion.suihua },
  { label: '鸡西市', value: PermanentRegion.jixi },
  { label: '鹤岗市', value: PermanentRegion.hegang },
  { label: '黑河市', value: PermanentRegion.heihe },
  { label: '齐齐哈尔市', value: PermanentRegion.qiqihar }
];

/** 单个地域转中文标签（详情页用） */
export const getPermanentRegionLabel = (val: PermanentRegion) => {
  return permanentRegionOptions.find(item => item.value === val)?.label || '-';
};

/** 多选地域批量转中文标签（表格回显用） */
export const getPermanentRegionLabels = (vals: PermanentRegion[]) => {
  return vals.map(getPermanentRegionLabel).filter(Boolean).join(',');
};
