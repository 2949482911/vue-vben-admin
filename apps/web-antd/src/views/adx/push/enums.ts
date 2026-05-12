// 1. 用户沉默时长枚举
export enum UserSilenceDuration {
  oneDaySilence = '1d_silence',
  threeDaySilence = '3d_silence',
  sevenDaySilence = '7d_silence',
  fifteenDaySilence = '15d_silence',
  thirtyDaySilence = '30d_silence',
}

// 2. 近30天APP使用天数枚举
export enum AppUsageWithin30d {
  zeroToThree = 'app_usage_within_30d_dev_0_3',
  threeToSeven = 'app_usage_within_30d_dev_3_7',
  sevenToFourteen = 'app_usage_within_30d_dev_7_14',
  fourteenToTwentyOne = 'app_usage_within_30d_dev_14_21',
  twentyOneToThirty = 'app_usage_within_30d_dev_21_30',
}
 //3.用户近日活跃枚举
export enum UserRecentlyActive {
  last1DayUsed = 'active',
  last3DaysUsed = 'active3',
  last7DaysUsed = 'app_usage_in_the_last_7days',
  last15DaysUsed = 'app_usage_in_the_last_15days',
  last30DaysUsed = 'app_usage_in_the_last_30days',
  last60DaysUsed = 'app_usage_in_the_last_60days',
  last90DaysUsed = 'app_usage_in_the_last_90days',
}
/*用户激活状态 */
export enum UserAppActiveState {
  potentialLostNewUser = 'activated_without_token',
}

/* 同类应用使用时长 */
export enum SimilarAppUsageDuration {
  long = 'long',
  middle = 'middle',
  short = 'short',
}
/**
 * 地域（省市）
 */
export enum PermanentRegion {
  /** 北京市 */
  beijing = '110000_p',
  /** 天津市 */
  tianjin = '120000_p',
  /** 河北省 */
  hebei = '130000_p',
  /** 山西省 */
  shangxi = '140000_p',
  /** 内蒙古自治区 */
  innerMongolia = '150000_p',
  /** 辽宁省 */
  liaoning = '210000_p',
  /** 吉林省 */
  jilin = '220000_p',
  /** 黑龙江省 */
  heilongjiang = '230000_p',
  /** 上海市 */
  shanghai = '310000_p',
  /** 江苏省 */
  jiangsu = '320000_p',
  /** 浙江省 */
  zhejiang = '330000_p',
  /** 安徽省 */
  anhui = '340000_p',
  /** 福建省 */
  fujian = '350000_p',
  /** 江西省 */
  jiangxi = '360000_p',
  /** 山东省 */
  shandong = '370000_p',
  henan = '410000_p',
  hubei = '420000_p',
  hunan = '430000_p',
  guangdong = '440000_p',
  guangxi = '450000_p',
  hainan = '460000_p',
  chongqing = '500000_p',
  sichuan = '510000_p',
  guizhou = '520000_p',
  yunnan = '530000_p',
  xizang = '540000_p',
  shanxi = '610000_p',
  gansu = '620000_p',
  qinghai = '630000_p',
  ningxia = '640000_p',
  xinjiang = '650000_p',
  taiwan = '710000_p',
  xianggang = '810000_p',
  aomeng = '820000_p',
  lincang = '530900_p',
  lijiang = '530700_p',
  baoshan = '530500_p',
  dali = '532900_p',
  dehong = '533100_p',
  nujiang = '533300_p',
  wenshan = '532600_p',
  kunming = '530100_p',
  shaotong = '530600_p',
  puer = '530800_p',
  qujing = '530300_p',
  chuxiong = '532300_p',
  yuxi = '530400_p',
  /** 红河哈尼族彝族自治州 */
  hongheHaniAndYiAutonomousPrefecture = '532500_p',
  /** 西双版纳傣族自治州 */
  xishuangbannaDaiAutonomousPrefecture = '532800_p',
  /** 迪庆藏族自治州 */
  diqingTibetanAutonomousPrefecture = '533400_p',
  // 内蒙古自治区
  /** 乌兰察布市 */
  ulanqabCity = '150900_p',
  /** 乌海市 */
  wuhaiCity = '150300_p',
  /** 兴安盟 */
  xinganLeague = '152200_p',
  /** 包头市 */
  baotouCity = '150200_p',
  /** 呼伦贝尔市 */
  hulunbuirCity = '150700_p',
  /** 呼和浩特市 */
  hohohotCity = '150100_p',
  /** 巴彦淖尔市 */
  bayannurCity = '150800_p',
  /** 赤峰市 */
  chifengCity = '150400_p',
  /** 通辽市 */
  tongliaoCity = '150500_p',
  /** 鄂尔多斯市 */
  ordosCity = '150600_p',
  /** 锡林郭勒盟 */
  xilingolLeague = '152500_p',
  /** 阿拉善盟 */
  alxaLeague = '152900_p',

  // 北京市（市级）
  /** 北京市（市级） */
  beijingCity = '110000_p_city',

  // 台湾省
  /** 台湾省 */
  taiwanProvince = '710000_p_city',

  // 吉林省
  /** 吉林市 */
  jilinCity = '220200_p',
  /** 四平市 */
  sipingCity = '220300_p',
  /** 延边朝鲜族自治州 */
  yanbianKoreanAutonomousPrefecture = '222400_p',
  /** 松原市 */
  songyuanCity = '220700_p',
  /** 白城市 */
  baichengCity = '220800_p',
  /** 白山市 */
  baishanCity = '220600_p',
  /** 辽源市 */
  liaoyuanCity = '220400_p',
  /** 通化市 */
  tonghuaCity = '220500_p',
  /** 长春市 */
  changchunCity = '220100_p',

  // 四川省
  /** 乐山市 */
  leshanCity = '511100_p',
  /** 内江市 */
  neijiangCity = '511000_p',
  /** 凉山彝族自治州 */
  liangshanYiAutonomousPrefecture = '513400_p',
  /** 南充市 */
  nanchongCity = '511300_p',
  /** 宜宾市 */
  yibinCity = '511500_p',
  /** 巴中市 */
  bazhongCity = '511900_p',
  /** 广元市 */
  guangyuanCity = '510800_p',
  /** 广安市 */
  guanganCity = '511600_p',
  /** 德阳市 */
  deyangCity = '510600_p',
  /** 成都市 */
  chengduCity = '510100_p',
  /** 攀枝花市 */
  panzhihuaCity = '510400_p',
  /** 泸州市 */
  luzhouCity = '510500_p',
  /** 甘孜藏族自治州 */
  ganziTibetanAutonomousPrefecture = '513300_p',
  /** 眉山市 */
  meishanCity = '511400_p',
  /** 绵阳市 */
  mianyangCity = '510700_p',
  /** 自贡市 */
  zigongCity = '510300_p',
  /** 资阳市 */
  ziyangCity = '512000_p',
  /** 达州市 */
  dazhouCity = '511700_p',
  /** 遂宁市 */
  suiningCity = '510900_p',
  /** 阿坝藏族羌族自治州 */
  abaTibetanAndQiangAutonomousPrefecture = '513200_p',
  /** 雅安市 */
  yaanCity = '511800_p',

  // 天津市（市级）
  /** 天津市（市级） */
  tianjinCity = '120000_p_city',

  // 宁夏回族自治区
  /** 中卫市 */
  zhongweiCity = '640500_p',
  /** 吴忠市 */
  wuzhongCity = '640300_p',
  /** 固原市 */
  guyuanCity = '640400_p',
  /** 石嘴山市 */
  shizuishanCity = '640200_p',
  /** 银川市 */
  yinchuanCity = '640100_p',

  // 安徽省
  /** 亳州市 */
  bozhouCity = '341600_p',
  /** 六安市 */
  luanCity = '341500_p',
  /** 合肥市 */
  hefeiCity = '340100_p',
  /** 安庆市 */
  anqingCity = '340800_p',
  /** 宣城市 */
  xuanchengCity = '341800_p',
  /** 宿州市 */
  suzhouCity = '341300_p',
  /** 池州市 */
  chizhouCity = '341700_p',
  /** 淮北市 */
  huaibeiCity = '340600_p',
  /** 淮南市 */
  huainanCity = '340400_p',
  /** 滁州市 */
  chuzhouCity = '341100_p',
  /** 芜湖市 */
  wuhuCity = '340200_p',
  /** 蚌埠市 */
  bengbuCity = '340300_p',
  /** 铜陵市 */
  tonglingCity = '340700_p',
  /** 阜阳市 */
  fuyangCity = '341200_p',
  /** 马鞍山市 */
  maanshanCity = '340500_p',
  /** 黄山市 */
  huangshanCity = '341000_p',

  // 山东省
  /** 东营市 */
  dongyingCity = '370500_p',
  /** 临沂市 */
  linyiCity = '371300_p',
  /** 威海市 */
  weihaiCity = '371000_p',
  /** 德州市 */
  dezhouCity = '371400_p',
  /** 日照市 */
  rizhaoCity = '371100_p',
  /** 枣庄市 */
  zaozhuangCity = '370400_p',
  /** 泰安市 */
  taianCity = '370900_p',
  /** 济南市 */
  jinanCity = '370100_p',
  /** 济宁市 */
  jiningCity = '370800_p',
  /** 淄博市 */
  ziboCity = '370300_p',
  /** 滨州市 */
  binzhouCity = '371600_p',
  /** 潍坊市 */
  weifangCity = '370700_p',
  /** 烟台市 */
  yantaiCity = '370600_p',
  /** 聊城市 */
  liaochengCity = '371500_p',
  /** 莱芜市 */
  laiwuCity = '371200_p',
  /** 菏泽市 */
  hezeCity = '371700_p',
  /** 青岛市 */
  qingdaoCity = '370200_p',

  // 山西省
  /** 临汾市 */
  linfenCity = '141000_p',
  /** 吕梁市 */
  luliangCity = '141100_p',
  /** 大同市 */
  datongCity = '140200_p',
  /** 太原市 */
  taiyuanCity = '140100_p',
  /** 忻州市 */
  xinzhouCity = '140900_p',
  /** 晋中市 */
  jinzhongCity = '140700_p',
  /** 晋城市 */
  jinchengCity = '140500_p',
  /** 朔州市 */
  shuozhouCity = '140600_p',
  /** 运城市 */
  yunchengCity = '140800_p',
  /** 长治市 */
  changzhiCity = '140400_p',
  /** 阳泉市 */
  yangquanCity = '140300_p',

  // 广东省
  /** 东莞市 */
  dongguanCity = '441900_p',
  /** 中山市 */
  zhongshanCity = '442000_p',
  /** 云浮市 */
  yunfuCity = '445300_p',
  /** 佛山市 */
  foshanCity = '440600_p',
  /** 广州市 */
  guangzhouCity = '440100_p',
  /** 惠州市 */
  huizhouCity = '441300_p',
  /** 揭阳市 */
  jieyangCity = '445200_p',
  /** 梅州市 */
  meizhouCity = '441400_p',
  /** 汕头市 */
  shantouCity = '440500_p',
  /** 汕尾市 */
  shanweiCity = '441500_p',
  /** 江门市 */
  jiangmenCity = '440700_p',
  /** 河源市 */
  heyuanCity = '441600_p',
  /** 深圳市 */
  shenzhenCity = '440300_p',
  /** 清远市 */
  qingyuanCity = '441800_p',
  /** 湛江市 */
  zhanjiangCity = '440800_p',
  /** 潮州市 */
  chaozhouCity = '445100_p',
  /** 珠海市 */
  zhuhaiCity = '440400_p',
  /** 肇庆市 */
  zhaoqingCity = '441200_p',
  /** 茂名市 */
  maomingCity = '440900_p',
  /** 阳江市 */
  yangjiangCity = '441700_p',
  /** 韶关市 */
  shaoguanCity = '440200_p',

  // 广西壮族自治区
  /** 北海市 */
  beihaiCity = '450500_p',
  /** 南宁市 */
  nanningCity = '450100_p',
  /** 崇左市 */
  chongzuoCity = '451400_p',
  /** 来宾市 */
  laibinCity = '451300_p',
  /** 柳州市 */
  liuzhouCity = '450200_p',
  /** 桂林市 */
  guilinCity = '450300_p',
  /** 梧州市 */
  wuzhouCity = '450400_p',
  /** 河池市 */
  hechiCity = '451200_p',
  /** 玉林市 */
  yulinCity = '450900_p',
  /** 百色市 */
  baiseCity = '451000_p',
  /** 贵港市 */
  guigangCity = '450800_p',
  /** 贺州市 */
  hezhouCity = '451100_p',
  /** 钦州市 */
  qinzhouCity = '450700_p',
  /** 防城港市 */
  fangchenggangCity = '450600_p',

  // 新疆维吾尔自治区
  /** 乌鲁木齐市 */
  urumqiCity = '650100_p',
  /** 伊犁哈萨克自治州 */
  iliKazakhAutonomousPrefecture = '654000_p',
  /** 克孜勒苏柯尔克孜自治州 */
  kizilsuKirghizAutonomousPrefecture = '653000_p',
  /** 克拉玛依市 */
  karamayCity = '650200_p',
  /** 博尔塔拉蒙古自治州 */
  bortalaMongolianAutonomousPrefecture = '652700_p',
  /** 吐鲁番市 */
  turpanCity = '650400_p',
  /** 和田地区 */
  hetianRegion = '653200_p',
  /** 哈密市 */
  hamiCity = '650500_p',
  /** 喀什地区 */
  kashgarRegion = '653100_p',
  /** 塔城地区 */
  tachengRegion = '654200_p',
  /** 巴音郭楞蒙古自治州 */
  bayingolinMongolianAutonomousPrefecture = '652800_p',
  /** 新疆维吾尔自治区直辖县级行政单位 */
  xinjiangDirectlyAdministeredCounties = '659000_p',
  /** 昌吉回族自治州 */
  changjiHuiAutonomousPrefecture = '652300_p',
  /** 阿克苏地区 */
  aksuRegion = '652900_p',
  /** 阿勒泰地区 */
  altayRegion = '654300_p',

  // 江苏省
  /** 南京市 */
  nanjingCity = '320100_p',
  /** 南通市 */
  nantongCity = '320600_p',
  /** 宿迁市 */
  suqianCity = '321300_p',
  /** 常州市 */
  changzhouCity = '320400_p',
  /** 徐州市 */
  xuzhouCity = '320300_p',
  /** 扬州市 */
  yangzhouCity = '321000_p',
  /** 无锡市 */
  wuxiCity = '320200_p',
  /** 泰州市 */
  taizhou = '321200_p',
  /** 淮安市 */
  huaianCity = '320800_p',
  /** 盐城市 */
  yanchengCity = '320900_p',
  /** 苏州市 */
  suzhou = '320500_p',
  /** 连云港市 */
  lianyungangCity = '320700_p',
  /** 镇江市 */
  zhenjiangCity = '321100_p',
  // 江西省
  /** 上饶市 */
  shangraoCity = '361100_p',
  /** 九江市 */
  jiujiangCity = '360400_p',
  /** 南昌市 */
  nanchangCity = '360100_p',
  /** 吉安市 */
  jianCity = '360800_p',
  /** 宜春市 */
  yichunCity = '360900_p',
  /** 抚州市 */
  fuzhou = '361000_p',
  /** 新余市 */
  xinyuCity = '360500_p',
  /** 景德镇市 */
  jingdezhenCity = '360200_p',
  /** 萍乡市 */
  pingxiangCity = '360300_p',
  /** 赣州市 */
  ganzhouCity = '360700_p',
  /** 鹰潭市 */
  yingtanCity = '360600_p',

  // 河北省
  /** 保定市 */
  baodingCity = '130600_p',
  /** 唐山市 */
  tangshanCity = '130200_p',
  /** 廊坊市 */
  langfangCity = '131000_p',
  /** 张家口市 */
  zhangjiakouCity = '130700_p',
  /** 承德市 */
  chengdeCity = '130800_p',
  /** 沧州市 */
  cangzhouCity = '130900_p',
  /** 石家庄市 */
  shijiazhuangCity = '130100_p',
  /** 秦皇岛市 */
  qinhuangdaoCity = '130300_p',
  /** 衡水市 */
  hengshuiCity = '131100_p',
  /** 邢台市 */
  xingtaiCity = '130500_p',
  /** 邯郸市 */
  handanCity = '130400_p',

  // 河南省
  /** 三门峡市 */
  sanmenxiaCity = '411200_p',
  /** 信阳市 */
  xinyangCity = '411500_p',
  /** 南阳市 */
  nanyangCity = '411300_p',
  /** 周口市 */
  zhoukouCity = '411600_p',
  /** 商丘市 */
  shangqiuCity = '411400_p',
  /** 安阳市 */
  anyangCity = '410500_p',
  /** 平顶山市 */
  pingdingshanCity = '410400_p',
  /** 开封市 */
  kaifengCity = '410200_p',
  /** 新乡市 */
  xinxiangCity = '410700_p',
  /** 河南省直辖县级行政单位 */
  henanDirectlyAdministeredCounties = '419000_p',
  /** 洛阳市 */
  luoyangCity = '410300_p',
  /** 漯河市 */
  luoheCity = '411100_p',
  /** 濮阳市 */
  puyangCity = '410900_p',
  /** 焦作市 */
  jiaozuoCity = '410800_p',
  /** 许昌市 */
  xuchangCity = '411000_p',
  /** 郑州市 */
  zhengzhouCity = '410100_p',
  /** 驻马店市 */
  zhumadianCity = '411700_p',
  /** 鹤壁市 */
  hebiCity = '410600_p',

  // 浙江省
  /** 丽水市 */
  lishuiCity = '331100_p',
  /** 台州市 */
  taizhouCity = '331000_p',
  /** 嘉兴市 */
  jiaxingCity = '330400_p',
  /** 宁波市 */
  ningboCity = '330200_p',
  /** 杭州市 */
  hangzhouCity = '330100_p',
  /** 温州市 */
  wenzhouCity = '330300_p',
  /** 湖州市 */
  huzhouCity = '330500_p',
  /** 绍兴市 */
  shaoxingCity = '330600_p',
  /** 舟山市 */
  zhoushanCity = '330900_p',
  /** 衢州市 */
  quzhouCity = '330800_p',
  /** 金华市 */
  jinhuaCity = '330700_p',

  // 海南省
  /** 三亚市 */
  sanyaCity = '460200_p',
  /** 三沙市 */
  sanshaCity = '460300_p',
  /** 儋州市 */
  danzhouCity = '460400_p',
  /** 海南省直辖县级行政单位 */
  hainanDirectlyAdministeredCounties = '469000_p',
  /** 海口市 */
  haikouCity = '460100_p',

  // 湖北省
  /** 十堰市 */
  shiyanCity = '420300_p',
  /** 咸宁市 */
  xianningCity = '421200_p',
  /** 孝感市 */
  xiaoganCity = '420900_p',
  /** 宜昌市 */
  yichangCity = '420500_p',
  /** 恩施土家族苗族自治州 */
  enshiTujiaAndMiaoAutonomousPrefecture = '422800_p',
  /** 武汉市 */
  wuhanCity = '420100_p',
  /** 湖北省直辖县级行政单位 */
  hubeiDirectlyAdministeredCounties = '429000_p',
  /** 荆州市 */
  jingzhouCity = '421000_p',
  /** 荆门市 */
  jingmenCity = '420800_p',
  /** 襄阳市 */
  xiangyangCity = '420600_p',
  /** 鄂州市 */
  ezhouCity = '420700_p',
  /** 随州市 */
  suizhouCity = '421300_p',
  /** 黄冈市 */
  huanggangCity = '421100_p',
  /** 黄石市 */
  huangshiCity = '420200_p',

  // 湖南省
  /** 娄底市 */
  loudiCity = '431300_p',
  /** 岳阳市 */
  yueyangCity = '430600_p',
  /** 常德市 */
  changdeCity = '430700_p',
  /** 张家界市 */
  zhangjiajieCity = '430800_p',
  /** 怀化市 */
  huaihuaCity = '431200_p',
  /** 株洲市 */
  zhuzhouCity = '430200_p',
  /** 永州市 */
  yongzhouCity = '431100_p',
  /** 湘潭市 */
  xiangtanCity = '430300_p',
  /** 湘西土家族苗族自治州 */
  xiangxiTujiaAndMiaoAutonomousPrefecture = '433100_p',
  /** 益阳市 */
  yiyangCity = '430900_p',
  /** 衡阳市 */
  hengyangCity = '430400_p',
  /** 邵阳市 */
  shaoyangCity = '430500_p',
  /** 郴州市 */
  chenzhouCity = '431000_p',
  /** 长沙市 */
  changshaCity = '430100_p',

  // 澳门特别行政区
  /** 澳门特别行政区 */
  macauSpecialAdministrativeRegion = '820000_p_city',

  // 甘肃省
  /** 临夏回族自治州 */
  linxiaHuiAutonomousPrefecture = '622900_p',
  /** 兰州市 */
  lanzhouCity = '620100_p',
  /** 嘉峪关市 */
  jiayuguanCity = '620200_p',
  /** 天水市 */
  tianshuiCity = '620500_p',
  /** 定西市 */
  dingxiCity = '621100_p',
  /** 平凉市 */
  pingliangCity = '620800_p',
  /** 庆阳市 */
  qingyangCity = '621000_p',
  /** 张掖市 */
  zhangyeCity = '620700_p',
  /** 武威市 */
  wuweiCity = '620600_p',
  /** 甘南藏族自治州 */
  gannanTibetanAutonomousPrefecture = '623000_p',
  /** 白银市 */
  baiyinCity = '620400_p',
  /** 酒泉市 */
  jiuquanCity = '620900_p',
  /** 金昌市 */
  jinchangCity = '620300_p',
  /** 陇南市 */
  longnanCity = '621200_p',

  // 福建省
  /** 三明市 */
  sanmingCity = '350400_p',
  /** 南平市 */
  nanpingCity = '350700_p',
  /** 厦门市 */
  xiamenCity = '350200_p',
  /** 宁德市 */
  ningdeCity = '350900_p',
  /** 泉州市 */
  quanzhouCity = '350500_p',
  /** 漳州市 */
  zhangzhouCity = '350600_p',
  /** 福州市 */
  fuzhouCity = '350100_p',
  /** 莆田市 */
  putianCity = '350300_p',
  /** 龙岩市 */
  longyanCity = '350800_p',

  // 西藏自治区
  /** 山南市 */
  shannanCity = '540500_p',
  /** 拉萨市 */
  lhasaCity = '540100_p',
  /** 日喀则市 */
  xigazeCity = '540200_p',
  /** 昌都市 */
  changduCity = '540300_p',
  /** 林芝市 */
  linzhiCity = '540400_p',
  /** 那曲市 */
  nagquCity = '540600_p',
  /** 阿里地区 */
  aliRegion = '542500_p',

  // 贵州省
  /** 六盘水市 */
  liupanshuiCity = '520200_p',
  /** 安顺市 */
  anshunCity = '520400_p',
  /** 毕节市 */
  bijieCity = '520500_p',
  /** 贵阳市 */
  guiyangCity = '520100_p',
  /** 遵义市 */
  zunyiCity = '520300_p',
  /** 铜仁市 */
  tongrenCity = '520600_p',
  /** 黔东南苗族侗族自治州 */
  qiandongnanMiaoAndDongAutonomousPrefecture = '522600_p',
  /** 黔南布依族苗族自治州 */
  qiannanBuyiAndMiaoAutonomousPrefecture = '522700_p',
  /** 黔西南布依族苗族自治州 */
  qianxinanBuyiAndMiaoAutonomousPrefecture = '522300_p',
  // 辽宁省
  /** 丹东市 */
  dandongCity = '210600_p',
  /**大连市 */
  dalianCity = '210200_p',
  /**抚顺市 */
  fushunCity = '210400_p',
  /**朝阳市 */
  chaoyangCity = '211300_p',
  /**本溪市 */
  benxiCity = '210500_p',
  /**沈阳市 */
  shenyangCity = '210100_p',
  panjin = '211100_p',
  yingkou = '210800_p',
  huludao = '211400_p',
  liaoyang = '211000_p',
  tieling = '211200_p',
  jinzhou = '210700_p',
  fuxin = '210900_p',
  anshan = '210300_p',
// 陕西市级
  xianyang = '610400_p',
  shangluo = '611000_p',
  ankang = '610900_p',
  baoji = '610300_p',
  yanan = '610600_p',
  yulin = '610800_p',
  hanzhong = '610700_p',
  weinan = '610500_p',
  xian = '610100_p',
  tongchuan = '610200_p',
// 青海市级
  guoluo = '632600_p',
  haidong = '630200_p',
  haibei = '632200_p',
  hainanTibet = '632500_p',
  haixi = '632800_p',
  yushu = '632700_p',
  xining = '630100_p',
  huangnan = '632300_p',

  // 黑龙江市级
  qitaihe = '230900_p',
  yichun = '230700_p',
  jiamusi = '230800_p',
  shuangyashan = '230500_p',
  harbin = '230100_p',
  daxinganling = '232700_p',
  daqing = '230600_p',
  mudanjiang = '231000_p',
  suihua = '231200_p',
  jixi = '230300_p',
  hegang = '230400_p',
  heihe = '231100_p',
  qiqihar = '230200_p',
  // 上海市级
  shanghaiCity = '310000_p_city'
}
/* 同类应用使用频率 */
export enum SimilarAppUsageRating {
  often = 'often',
  sometime = 'sometime',
  occasionally = 'occasionally',
}

/* 年龄分组 */
export enum AgeGroup {
  age18To23 = 'age_18_23',
  age24To34 = 'age_24_34',
  age35To44 = 'age_35_44',
  age45To54 = 'age_45_54',
  age55AndOlder = 'age_55_older',
}

/* 性别*/
export enum Gender {
  male = 'male',
  female = 'female',
}

/* 消费水平*/
export enum ConsumptionLevel {
  /** 高 */
  high = 'consume_high',
}

/* 手机价格*/
export enum PhonePrice {
  under1000 = 'consume_price_0_1000',
  from1000To2000 = 'consume_price_1000_2000',
  from2000To3000 = 'consume_price_2000_3000',
}
/**
 * 财产状态
 */
export enum PropertyStatus {
  carOwner = 'car_owner',
  houseOwner = 'house_owner'
}
/**
 * 职业
 */
export enum Occupations {
  teacher = 'teacher',
  universityStudent = 'university_student',
  officeWorker = 'office_worker',
  civilServant = 'civil_servant',
  doctor = 'doctor',
  selfEmployed = 'self_employed',
  driver = 'driver'
}
/**
 * 婚姻状况
 */
export enum Marriage {
  single = 'single',
  amativeness = 'amativeness',
  married = 'married'
}
/**
 * 子女
 */
export enum Children {
  gestationPeriod = 'gestation_period',
  infancy = 'infancy',
  teens = 'teens'
}
/**
 * 人群随机标识
 */
export enum UserRandomBucket {
  bucket0 = 'device_0',
  bucket1 = 'device_1',
  bucket2 = 'device_2',
  bucket3 = 'device_3',
  bucket4 = 'device_4',
  bucket5 = 'device_5',
  bucket6 = 'device_6',
  bucket7 = 'device_7',
  bucket8 = 'device_8',
  bucket9 = 'device_9',
  bucketa = 'device_a',
  bucketb = 'device_b',
  bucketc = 'device_c',
  bucketd = 'device_d',
  buckete = 'device_e',
  bucketf = 'device_f'
}
/**
 * 点击回执
 */
export enum ReportAttributionParameters {
  sendReportingAttributionDevices= 'send_reporting_attribution_devices'
}
/**
 * 标签名称
 */
export enum TagsName {
  cUserSilenceDuration = 'c_user_silence_duration',
  cAppUsageWithin30dDev = 'c_app_usage_within_30d_dev',
  cRecentlyActive = 'c_recently_active',
  cAppActiveState = 'c_app_active_state',
  cSimilarAppUsageDuration = 'c_similar_app_usage_duration',
  cSimilarAppUsageRating = 'c_similar_app_usage_rating',
  cPermanentRegion = 'c_permanent_region',
  cAgeGroup = 'c_age_group',
  cGender = 'c_gender',
  cConsumptionLevel = 'c_consumption_level',
  cPhonePrice = 'c_phone_price',
  cPropertyStatus = 'c_property_status',
  cOccupations = 'c_occupations',
  cMarriage = 'c_marriage',
  cChildren = 'c_children',
  cRandomNum = 'c_random_num',
  reportAttributionParameters = 'report_attribution_parameters'
}
