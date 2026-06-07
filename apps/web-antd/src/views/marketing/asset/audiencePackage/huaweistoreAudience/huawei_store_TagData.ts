import { $t } from '@vben/locales';

/**
 * 华为推送标签对象定义
 *
 * 标签条件，标签条件可为单个标签；标签条件为多个标签时，多个标签枚举值之间用逗号分隔，格式参考请求示例，取值请参考Condition。
 */
export interface HuaWeiStoreAudiencePackage {
  communication_onlinerate_dev: Array<string>;
  push_online_days_30d_dev: Array<string>;
  push_online_days_7d_dev: Array<string>;
  forecast_age_dev: Array<string>;
  terminal_new_dev: Array<string>;
  series_new_dev: Array<string>;
  price_new_dev: Array<string>;
  gender_new_dev: Array<string>;
  game_payamout_30_dev: Array<string>;
  product_new_dev: Array<string>;
  game_dlanum_30_dev: Array<string>;
  his_activated_apps_dev: Array<string>;
  daily_installed_apps_dev: Array<string>;
  his_installed_apps_dev: Array<string>;
  hispace_active_state_dev: Array<string>;
  // 30dy_app_active_dev 原文变量名字
  thirtdy_app_active_dev: Array<string>;
  app_type_actived_v2_dev: Array<string>;
  hispace_app_install_pref_dev: Array<string>;
  hispace_pay_user_cd_dev: Array<string>;
  latest_province_dev: Array<string>;
  city_new_dev_dev: Array<string>;
  active_city_grade_dev: Array<string>;
  game_elements_dev: Array<string>;
  game_ip_dev: Array<string>;
  game_theme_dev: Array<string>;
  game_played_game_play_dev: Array<string>;
  game_played_core_play_dev: Array<string>;
  game_sdk_overall_silence_duration_up: Array<string>;
  game_cancel_booking_dev: Array<string>;
  game_cps_silence_days_dev: Array<string>;
  game_comic_game_degree_dev: Array<string>;
  game_30dy_plat_usage_days_dev: Array<string>;
  game_booking_app_up: Array<string>;
  game_30dy_app_new_install_cnt: Array<string>;
  game_30dy_app_opened_cnt: Array<string>;
  game_install_app_cnt_dev: Array<string>;
  game_usage_app_cnt_dev: Array<string>;
  // 90d_app_active_dev 原文变量名字
  nined_app_active_dev: Array<string>;
  consume_purchase_dev: Array<string>;
  consume_spender_dev: Array<string>;
  mobile_entertainment_pref_dev: Array<string>;
  app_type_installed_v2_dev: Array<string>;
  jnt_oprn_iap_30dy_pay_amt_up: Array<string>;
  travel_lover_flag: Array<string>;
  not_actived_seg_dev: Array<string>;
  game_play_pref_dev: Array<string>;
  active_duration_dev: Array<string>;
  carrier_score_dev: Array<string>;
  cp_new_dev: Array<string>;
  us_hours_30d_dev: Array<string>;
  city_new_dev: Array<string>;
  switch_state_dev: Array<string>;
  resolution_dev: Array<string>;
  ram_dev: Array<string>;
  probability_card_payment_intention: Array<string>;
  probability_video_new_user_payment_dev: Array<string>;
  probability_tower_defense_payment_intention: Array<string>;
  probability_strategy_payment_intention: Array<string>;
  probability_role_playing_payment_intention: Array<string>;
  probability_martial_arts_payment_intention: Array<string>;
  probability_legends_payment_intention: Array<string>;
  probability_immortal_xia_payment_intention: Array<string>;
  probability_fishing_payment_intention: Array<string>;
  financial_loan_apply_interests: Array<string>;
  cur_emui_ver_num_dev: Array<string>;
  star_fan_adhesion_dev: Array<string>;
  int_ecommerce_purchase: Array<string>;
  int_lower_tiered_city: Array<string>;
  int_ecommerce_platform: Array<string>;
  int_high_net_worth: Array<string>;
  int_internet_age_persion: Array<string>;
  int_game_artstyle: Array<string>;
  int_purchase_luxury: Array<string>;
  int_game_purchase_fighting_landlord: Array<string>;
  int_game_purchase_mahjong: Array<string>;
  int_game_purchase_fishing: Array<string>;
  int_instant_message: Array<string>;
  int_asking_answers_community: Array<string>;
  career_attributes_dev: Array<string>;
  int_game_play: Array<string>;
  int_game_making_friends: Array<string>;
  int_video_chat: Array<string>;
  int_fashion_brand: Array<string>;
  int_purchase_clothes: Array<string>;
  int_game_purchase_themes: Array<string>;
  int_purchase_overseas: Array<string>;
  int_purchase_wholesale: Array<string>;
  int_purchase_home: Array<string>;
  int_voice_make_friends: Array<string>;
  int_women_community: Array<string>;
  int_city_making_friends: Array<string>;
  int_workplace_social: Array<string>;
  int_fashion_community: Array<string>;
  int_women_clothing: Array<string>;
  int_discount_shopping: Array<string>;
  int_purchase_food: Array<string>;
  int_purchase_drinks: Array<string>;
  int_blind_date: Array<string>;
  int_luxury_brand_car: Array<string>;
  hobby_game_type: Array<string>;
  hobby_game_theme: Array<string>;
  hobby_game_carrier: Array<string>;
  int_new_energy_car: Array<string>;
  int_loans: Array<string>;
  int_game_bhvr_type: Array<string>;
  int_game_bhvr_carrier: Array<string>;
  int_finance: Array<string>;
  int_curing_car: Array<string>;
  int_luxury_brand: Array<string>;
  int_car_produce: Array<string>;
  consume_game_level_dev: Array<string>;
  consume_level_dev: Array<string>;
  career_third_level_type_dev: Array<string>;
  short_video_prefer: Array<string>;
  carowner_group: Array<string>;
  int_business: Array<string>;
  int_rent_car: Array<string>;
  int_purchase_pregnant_probability: Array<string>;
  int_purchase_3c_probability: Array<string>;
  int_prime_credit: Array<string>;
  int_personal_loan: Array<string>;
  int_militarynews_prefer: Array<string>;
  int_make_strange_friends: Array<string>;
  int_game_live: Array<string>;
  int_entertainment_live: Array<string>;
  int_credit_card: Array<string>;
  credit_query_service_dev: Array<string>;
  incar_electrical_appliances_dev: Array<string>;
  car_accessories_dev: Array<string>;
  car_decoration_dev: Array<string>;
  int_buy_second_car: Array<string>;
  int_buy_new_car: Array<string>;
  int_news_prefer: Array<string>;
  int_audio_reader: Array<string>;
  up_realname_verify_dev: Array<string>;
  loan_probability: Array<string>;
  comsumption_level: Array<string>;
  financial_news_prefer: Array<string>;
  sportsnews_prefer: Array<string>;
  novel_reading_perfer: Array<string>;
  education_dev: Array<string>;
  user_watch_picbook: Array<string>;
  fitness_slimming_level: Array<string>;
  user_education_language: Array<string>;
  user_education_intelligence: Array<string>;
  user_education_interest: Array<string>;
  game_level: Array<string>;
  game_purchase_score: Array<string>;
  rent_house_intention: Array<string>;
  buy_house_intention: Array<string>;
  cross_industry_exploration_dev: Array<string>;
  e_business_feature_dev: Array<string>;
  general_quality_audience_dev: Array<string>;
  e_business_active_dev: Array<string>;
  hispace_expsoure_cnt: Array<string>;
  health_interest_dev: Array<string>;
  owner_cars_user_dev: Array<string>;
  consume_frequency_dev: Array<string>;
  financial_risk_prefer: Array<string>;
  financial_securities_audiences: Array<string>;
  luxury_hotel_prefer: Array<string>;
  radio_dev: Array<string>;
  consume_ability_dev: Array<string>;
  primary_secondary_edu_dev: Array<string>;
  edu_pay_dev: Array<string>;
  mother_baby_nursery_rhyme_score: Array<string>;
  local_life_service_flag_dev: Array<string>;
  mother_baby_services_score: Array<string>;
  parenting_status_dev: Array<string>;
  marriage_status_dev: Array<string>;
  consume_credit_card_level_dev: Array<string>;
  car_energy_interest_exist_dev: Array<string>;
  car_price_interest_exist_dev: Array<string>;
  car_origin_interest_potential_dev: Array<string>;
  car_price_interest_potential_dev: Array<string>;
  car_model_potential_dev: Array<string>;
  car_model_owned_dev: Array<string>;
  car_brand_interest_potential_dev: Array<string>;
  car_brand_interest_owned_dev: Array<string>;
  parenting_knowledge_dev: Array<string>;
  children_video_audio_dev: Array<string>;
  children_games_dev: Array<string>;
  children_books_dev: Array<string>;
  business_service_job_hunting_dev: Array<string>;
  knowledge_payment_dev: Array<string>;
  children_clothing_flag_dev: Array<string>;
  maternal_health_care_dev: Array<string>;
  owner_house_flag_dev: Array<string>;
  finance_valued_client_dev: Array<string>;
  finance_trust_dev: Array<string>;
  finance_overseas_asset_dev: Array<string>;
  finance_precious_metal_dev: Array<string>;
  finance_crude_dev: Array<string>;
  finance_futures_dev: Array<string>;
  finance_serious_illness_insurance_dev: Array<string>;
  finance_medical_insurance_dev: Array<string>;
  finance_annuity_insurance_dev: Array<string>;
  finance_accident_insurance_dev: Array<string>;
  finance_bond_dev: Array<string>;
  finance_foreign_currency_dev: Array<string>;
  finance_car_loan_dev: Array<string>;
  finance_house_loan_dev: Array<string>;
  sports_goods_dev: Array<string>;
  sports_culture_dev: Array<string>;
  sports_fitness_training_dev: Array<string>;
  sports_outdoor_extreme_dev: Array<string>;
  sports_water_ice_dev: Array<string>;
  sports_running_riding_dev: Array<string>;
  sports_ball_games_dev: Array<string>;
  buy_trip_assistant_service_flag_dev: Array<string>;
  overseas_shopping_flag_dev: Array<string>;
  finance_creadit_card_interests_dev: Array<string>;
  finance_bank_interests_dev: Array<string>;
  finance_crowdfund_dev: Array<string>;
  finance_internet_bank_dev: Array<string>;
  finance_bookkeeping_dev: Array<string>;
  finance_financial_service_dev: Array<string>;
  finance_digital_currency_dev: Array<string>;
  finance_microloans_dev: Array<string>;
  purch_seasonrec_dev: Array<string>;
  purch_sealeisure_dev: Array<string>;
  finance_car_insurance_dev: Array<string>;
  finance_insurance_endowment_dev: Array<string>;
  finance_insurance_life_dev: Array<string>;
  finance_property_insurance_dev: Array<string>;
  book_tickets_pro_dev: Array<string>;
  buy_travel_agents_flag_dev: Array<string>;
  sports_interests_dev: Array<string>;
  purch_outeradv_dev: Array<string>;
  female_skirt_flag_dev: Array<string>;
  female_trousers_flag_dev: Array<string>;
  female_jacket_flag_dev: Array<string>;
  airfare_purch_dev: Array<string>;
  purch_family_dev: Array<string>;
  high_speed_rail_dev: Array<string>;
  probability_anime_lovers_dev: Array<string>;
  home_theater_purch_flag_dev: Array<string>;
  speaker_purch_flag_dev: Array<string>;
  pc_purch_flag_dev: Array<string>;
  game_study_machine_flag_dev: Array<string>;
  rent_shop_flag_dev: Array<string>;
  common_rent_house_flag_dev: Array<string>;
  rent_villa_flag_dev: Array<string>;
  high_end_clothing_luggage_flag_dev: Array<string>;
  nanny_dev: Array<string>;
  maternity_matron_dev: Array<string>;
  house_move_dev: Array<string>;
  house_maintain_dev: Array<string>;
  home_appliances_maintain_dev: Array<string>;
  cleaner_dev: Array<string>;
  marry_love_friend_flag_dev: Array<string>;
  secondhand_trade_flag_dev: Array<string>;
  recent_trips_flag_dev: Array<string>;
  finance_stock_dev: Array<string>;
  finance_fund_dev: Array<string>;
  insurance_dev_v1: Array<string>;
  financial_bank_dev: Array<string>;
  motion_camera_buying_flag_dev: Array<string>;
  second_house_transaction_flag_dev: Array<string>;
  new_house_transaction_flag_dev: Array<string>;
  school_district_house_transaction_flag_dev: Array<string>;
  smartwatch_flag_dev: Array<string>;
  buy_house_flag_dev: Array<string>;
  tablet_purch_flag_dev: Array<string>;
  menswear_flag_dev: Array<string>;
  ordinary_house_transaction_flag_dev: Array<string>;
  slr_camera_flag_dev: Array<string>;
  car_service_interest_dev: Array<string>;
  financial_microloans_dev: Array<string>;
  probability_role_playing_game_lovers_dev: Array<string>;
  probability_business_strategy_game_lovers_dev: Array<string>;
  probability_board_game_lovers_dev: Array<string>;
  apptype_usage_30d_duration_dev: Array<string>;
  apptype_usage_30d_times_dev: Array<string>;
  female_clothes_buying_flag_dev: Array<string>;
  puz_game_lovers_dev: Array<string>;
  audio_entertainment_lovers_dev: Array<string>;
  juvenile_cohesion_dev: Array<string>;
  house_property_dev: Array<string>;
  financial_credit_card_apply_dev: Array<string>;
  second_third_score_dev: Array<string>;
  probability_music_interest_lovers_dev: Array<string>;
  probability_live_broadcast_lovers_dev: Array<string>;
  probability_action_shooting_game_lovers_dev: Array<string>;
  probability_sports_racing_game_lovers_dev: Array<string>;
  subject_score_dev: Array<string>;
  language_train_dev: Array<string>;
  vocation_interest_dev: Array<string>;
  hobby_train_dev: Array<string>;
  maintain_car_dev: Array<string>;
  decorating_flag_dev: Array<string>;
  video_lover_label: Array<string>;
  short_video_lover_label: Array<string>;
  online_shopping_flag_dev: Array<string>;
  high_consumption: Array<string>;
  pps_visit_country_year_dev: Array<string>;
  pps_visit_country_six_month_dev: Array<string>;
  pps_visit_country_three_month_dev: Array<string>;
  pps_visit_country_one_month_dev: Array<string>;
  pps_visit_city_year_dev: Array<string>;
  pps_visit_city_six_month_dev: Array<string>;
  pps_visit_city_three_month_dev: Array<string>;
  pps_visit_city_one_month_dev: Array<string>;
  city_new_grade_dev: Array<string>;
  network_v2_dev: Array<string>;
  app_interest_v2_dev: Array<string>;
  province_new_dev: Array<string>;
}


/**
 * 手机在线时段
 cor_0h：0:00-1:00小时
 cor_1h：1:00-2:00小时
 cor_2h：2:00-3:00小时
 cor_3h：3:00-4:00小时
 cor_4h：4:00-5:00小时
 cor_5h：5:00-6:00小时
 cor_6h：6:00-7:00小时
 cor_7h：7:00-8:00小时
 cor_8h：8:00-9:00小时
 cor_9h：9:00-10:00小时
 cor_10h：10:00-11:00小时
 cor_11h：11:00-12:00小时
 cor_12h：12:00-13:00小时
 cor_13h：13:00-14:00小时
 cor_14h：14:00-15:00小时
 cor_15h：15:00-16:00小时
 cor_16h：16:00-17:00小时
 cor_17h：17:00-18:00小时
 cor_18h：18:00-19:00小时
 cor_19h：19:00-20:00小时
 cor_20h：20:00-21:00小时
 cor_21h：21:00-22:00小时
 cor_22h：22:00-23:00小时
 cor_23h：23:00-24:00小时
 */
export const communication_onlinerate_dev = [
  {
    value: 'cor_0h',
    label: '0:00-1:00小时',
  },
  {
    value: 'cor_1h',
    label: '1:00-2:00小时',
  },
  {
    value: 'cor_2h',
    label: '2:00-3:00小时',
  },
  {
    value: 'cor_3h',
    label: '3:00-4:00小时',
  },
  {
    value: 'cor_4h',
    label: '4:00-5:00小时',
  },
  {
    value: 'cor_5h',
    label: '5:00-6:00小时',
  },
  {
    value: 'cor_6h',
    label: '6:00-7:00小时',
  },
  {
    value: 'cor_7h',
    label: '7:00-8:00小时',
  },
  {
    value: 'cor_8h',
    label: '8:00-9:00小时',
  },
  {
    value: 'cor_9h',
    label: '9:00-10:00小时',
  },
  {
    value: 'cor_10h',
    label: '10:00-11:00小时',
  },
  {
    value: 'cor_11h',
    label: '11:00-12:00小时',
  },
  {
    value: 'cor_12h',
    label: '12:00-13:00小时',
  },
  {
    value: 'cor_13h',
    label: '13:00-14:00小时',
  },
  {
    value: 'cor_14h',
    label: '14:00-15:00小时',
  },
  {
    value: 'cor_15h',
    label: '15:00-16:00小时',
  },
  {
    value: 'cor_16h',
    label: '16:00-17:00小时',
  },
  {
    value: 'cor_17h',
    label: '17:00-18:00小时',
  },
  {
    value: 'cor_18h',
    label: '18:00-19:00小时',
  },
  {
    value: 'cor_19h',
    label: '19:00-20:00小时',
  },
  {
    value: 'cor_20h',
    label: '20:00-21:00小时',
  },
  {
    value: 'cor_21h',
    label: '21:00-22:00小时',
  },
  {
    value: 'cor_22h',
    label: '22:00-23:00小时',
  },
  {
    value: 'cor_23h',
    label: '23:00-24:00小时',
  },

]


/**
 *
 手机月在线天数
 c1m_1：1天
 c1m_2：2天
 c1m_3：3天
 c1m_4：4天
 c1m_5：5天
 c1m_6：6天
 c1m_7：7天
 c1m_8：8天
 c1m_9：9天
 c1m_10：10天
 c1m_11：11天
 c1m_12：12天
 c1m_13：13天
 c1m_14：14天
 c1m_15：15天
 c1m_16：16天
 c1m_17：17天
 c1m_18：18天
 c1m_19：19天
 c1m_20：20天
 c1m_21：21天
 c1m_22：22天
 c1m_23：23天
 c1m_24：24天
 c1m_25：25天
 c1m_26：26天
 c1m_27：27天
 c1m_28：28天
 c1m_29：29天
 c1m_30：30天
 手机月在线天数
 */
export const push_online_days_30d_dev = [
  {
    value: 'c1m_1',
    label: '1天',
  },
  {
    value: 'c1m_2',
    label: '2天',
  },
  {
    value: 'c1m_3',
    label: '3天',
  },
  {
    value: 'c1m_4',
    label: '4天',
  },
  {
    value: 'c1m_5',
    label: '5天',
  },
  {
    value: 'c1m_6',
    label: '6天',
  },
  {
    value: 'c1m_7',
    label: '7天',
  },
  {
    value: 'c1m_8',
    label: '8天',
  },
  {
    value: 'c1m_9',
    label: '9天',
  },
  {
    value: 'c1m_10',
    label: '10天',
  },
  {
    value: 'c1m_11',
    label: '11天',
  },
  {
    value: 'c1m_12',
    label: '12天',
  },
  {
    value: 'c1m_13',
    label: '13天',
  },
  {
    value: 'c1m_14',
    label: '14天',
  },
  {
    value: 'c1m_15',
    label: '15天',
  },
  {
    value: 'c1m_16',
    label: '16天',
  },
  {
    value: 'c1m_17',
    label: '17天',
  },
  {
    value: 'c1m_18',
    label: '18天',
  },
  {
    value: 'c1m_19',
    label: '19天',
  },
  {
    value: 'c1m_20',
    label: '20天',
  },
  {
    value: 'c1m_21',
    label: '21天',
  },
  {
    value: 'c1m_22',
    label: '22天',
  },
  {
    value: 'c1m_23',
    label: '23天',
  },
  {
    value: 'c1m_24',
    label: '24天',
  },
  {
    value: 'c1m_25',
    label: '25天',
  },
  {
    value: 'c1m_26',
    label: '26天',
  },
  {
    value: 'c1m_27',
    label: '27天',
  },
  {
    value: 'c1m_28',
    label: '28天',
  },
  {
    value: 'c1m_29',
    label: '29天',
  },
  {
    value: 'c1m_30',
    label: '30天',
  }
]


/**
 * 手机周在线天数
 * p7d_1：1天
 p7d_2：2天
 p7d_3：3天
 p7d_4：4天
 p7d_5：5天
 p7d_6：6天
 p7d_7：7天
 */
export const push_online_days_7d_dev = [
  {
    value: 'p7d_1',
    label: '1天',
  },
  {
    value: 'p7d_2',
    label: '2天',
  },
  {
    value: 'p7d_3',
    label: '3天',
  },
  {
    value: 'p7d_4',
    label: '4天',
  },
  {
    value: 'p7d_5',
    label: '5天',
  },
  {
    value: 'p7d_6',
    label: '6天',
  },
  {
    value: 'p7d_7',
    label: '7天',
  },
]


/**
 * 年龄。

 取值范围：

 1：18岁以下
 2：18~23岁
 3：24~34岁
 4：35~44岁
 5：45~54岁
 6：55岁及以上
 */
export const forecast_age_dev = [
  {
    value: '1',
    label: '18岁以下',
  },
  {
    value: '2',
    label: '18~23岁',
  },
  {
    value: '3',
    label: '24~34岁',
  },
  {
    value: '4',
    label: '35~44岁',
  },
  {
    value: '5',
    label: '45~54岁',
  },
  {
    value: '6',
    label: '55岁及以上',
  },
]


/**
 * 外部型号
 * 说明：此字段枚举值约1851个型号，无法一一列举。如果您有需求可以联系华为行业运营提供。
 */
export const terminal_new_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

/**
 * 手机系列
 * 手机系列。

取值范围：

 华为P系列：华为P系列
 华为MATE系列：华为MATE系列
 华为NOVA系列：华为NOVA系列
 华为G系列：华为G系列
 华为畅享系列：华为畅享系列
 华为麦芒系列：华为麦芒系列
 荣耀N系列：荣耀N系列
 荣耀V系列：荣耀V系列
 荣耀PLAY系列：荣耀PLAY系列
 荣耀MAGIC系列：荣耀MAGIC系列
 荣耀畅玩A系列：荣耀畅玩A系列
 荣耀畅玩N系列：荣耀畅玩N系列
 荣耀青春版系列：荣耀青春版系列
 荣耀畅玩C系列：荣耀畅玩C系列
 荣耀畅玩X系列：荣耀畅玩X系列
 荣耀NOTE系列：荣耀NOTE系列
 华为M系列：华为M系列
 华为T系列：华为T系列
 荣耀平板：荣耀平板
 荣耀畅玩平板：荣耀畅玩平板
 华为智慧屏：华为智慧屏
 荣耀智慧屏：荣耀智慧屏
 */
export const series_new_dev = [
  {
    label: '华为P系列',
    value: '华为P系列',
  },
  {
    label: '华为MATE系列',
    value: '华为MATE系列',
  },
  {
    label: '华为NOVA系列',
    value: '华为NOVA系列',
  },
  {
    label: '华为G系列',
    value: '华为G系列',
  },
  {
    label: '华为畅享系列',
    value: '华为畅享系列',
  },
  {
    label: '华为麦芒系列',
    value: '华为麦芒系列',
  },
  {
    label: '荣耀N系列',
    value: '荣耀N系列',
  },
  {
    label: '荣耀V系列',
    value: '荣耀V系列',
  },
  {
    label: '荣耀PLAY系列',
    value: '荣耀PLAY系列',
  },
  {
    label: '荣耀MAGIC系列',
    value: '荣耀MAGIC系列',
  },
  {
    label: '荣耀畅玩A系列',
    value: '荣耀畅玩A系列',
  },
  {
    label: '荣耀畅玩N系列',
    value: '荣耀畅玩N系列',
  },
  {
    label: '荣耀青春版系列',
    value: '荣耀青春版系列',
  },
  {
    label: '荣耀畅玩C系列',
    value: '荣耀畅玩C系列',
  },
  {
    label: '荣耀畅玩X系列',
    value: '荣耀畅玩X系列',
  },
  {
    label: '荣耀NOTE系列',
    value: '荣耀NOTE系列',
  },
  {
    label: '华为M系列',
    value: '华为M系列',
  },
  {
    label: '华为T系列',
    value: '华为T系列',
  },
  {
    label: '荣耀平板',
    value: '荣耀平板',
  },
  {
    label: '荣耀畅玩平板',
    value: '荣耀畅玩平板',
  },
  {
    label: '华为智慧屏',
    value: '华为智慧屏',
  },
  {
    label: '荣耀智慧屏',
    value: '荣耀智慧屏',
  },
]



/**
 * 价格
 * 1：1000以内
2：1000~2000
3：2000~3000
4：3000~5000
5：5000~8000
6：8000以上
7：保密

 */
export const price_new_dev = [
  {
    value: '1',
    label: '1000以内',
  },
  {
    value: '2',
    label: '1000~2000',
  },
  {
    value: '3',
    label: '2000~3000',
  },
  {
    value: '4',
    label: '3000~5000',
  },
  {
    value: '5',
    label: '5000~8000',
  },
  {
    value: '6',
    label: '8000以上',
  },
  {
    value: '7',
    label: '保密',
  },
]



/**
 * gender_new_dev= 性别
  g_m：男
  g_f：女
 */

export const gender_new_dev = [
  {
    value: 'g_m',
    label: '男',
  },
  {
    value: 'g_f',
    label: '女',
  },
]


/**
 * 近30天网游支付金额。

取值范围：

0：[0]
0_1b：(0，100]
1b_5b：(100，500]
5b_2k：(500，2000]
2k+：(2000，+∞)
 */
export const game_payamout_30_dev = [
  {
    value: '0',
    label: '[0]',
  },
  {
    value: '0_1b',
    label: '(0，100]',
  },
  {
    value: '1b_5b',
    label: '(100，500]',
  },
  {
    value: '5b_2k',
    label: '(500，2000]',
  },
  {
    value: '2k+',
    label: '(2000，+∞)+',
  },
]


export const product_new_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


/**
 * 近30天下载游戏个数。

取值范围：

0：[0]
1：[1]
2：[2]
3_4：[3，4]
5_10：[5，10]
11_20：[11，20]
21_50：[21，50]
51_100：[51，100]
100+：(100，+∞)
 */
export const game_dlanum_30_dev = [
  {
    value: '0',
    label: '[0]',
  },
  {
    value: '1',
    label: '[1]',
  },
  {
    value: '2',
    label: '[2]',
  },
  {
    value: '3_4',
    label: '[3，4]',
  },
  {
    value: '5_10',
    label: '[5，10]',
  },
  {
    value: '11_20',
    label: '[11，20]',
  },
  {
    value: '21_50',
    label: '[21，50]',
  },
  {
    value: '51_100',
    label: '[51，100]',
  },
  {
    value: '100+',
    label: '(100，+∞)+',
  },
]


/***
 * 曾经使用过的APP，即为应用ID。 参照文档
   https://developer.huawei.com/consumer/cn/doc/promotion/marketapi-modle-condition-0000001181946369
   说明：此字段枚举值不可超过20个。
 */
export const his_activated_apps_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const daily_installed_apps_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const his_installed_apps_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const thirtdy_app_active_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const app_type_actived_v2_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


/**
 * 应用市场最近活跃距今天数。

取值范围：

0：[0]
1：[1]
2：[2]
3：[3]
4：[4]
5：[5]
6：[6]
7：[7]
8_14：(7，14]
15_30：(14，30]
31_60：(30，60]
61_90：(60，90]
91_365：(90，365]
365+：(365，+∞）
 */
export const hispace_active_state_dev = [
  {
    value: '0',
    label: '[0]',
  },
  {
    value: '1',
    label: '[1]',
  },
  {
    value: '2',
    label: '[2]',
  },
  {
    value: '3',
    label: '[3]',
  },
  {
    value: '4',
    label: '[4]',
  },
  {
    value: '5',
    label: '[5]',
  },
  {
    value: '6',
    label: '[6]',
  },
  {
    value: '7',
    label: '[7]',
  },
  {
    value: '8_14',
    label: '(7，14]',
  },
  {
    value: '15_30',
    label: '(14，30]',
  },
  {
    value: '31_60',
    label: '(30，60]',
  },
  {
    value: '61_90',
    label: '(60，90]',
  },
  {
    value: '91_365',
    label: '(90，365]',
  },
  {
    value: '365+',
    label: '(365，+∞)+',
  },
]


/**
 * 安装应用类别偏好。

取值范围：

主题个性：主题个性
休闲娱乐：休闲娱乐
休闲游戏：休闲游戏
休闲益智：休闲益智
体育竞速：体育竞速
便捷生活：便捷生活
儿童：儿童
出行导航：出行导航
动作冒险：动作冒险
动作射击：动作射击
动漫：动漫
合作壁纸*：合作壁纸*
商务：商务
图书阅读：图书阅读
学习办公：学习办公
实用工具：实用工具
影音娱乐：影音娱乐
拍摄美化：拍摄美化
教育：教育
新闻阅读：新闻阅读
旅游住宿：旅游住宿
棋牌桌游：棋牌桌游
汽车：汽车
电子书籍：电子书籍
社交通讯：社交通讯
经营策略：经营策略
网络游戏：网络游戏
美食：美食
表盘个性：表盘个性
角色扮演：角色扮演
购物比价：购物比价
资讯生活：资讯生活
运动健康：运动健康
金融理财：金融理财
 */
export const hispace_app_install_pref_dev = [

  {
    label: '主题个性',
    value: '主题个性',
  },
  {
    label: '休闲娱乐',
    value: '休闲娱乐',
  },
  {
    label: '休闲游戏',
    value: '休闲游戏',
  },
  {
    label: '休闲益智',
    value: '休闲益智',
  },
  {
    label: '体育竞速',
    value: '体育竞速',
  },
  {
    label: '便捷生活',
    value: '便捷生活',
  },
  {
    label: '儿童',
    value: '儿童',
  },
  {
    label: '出行导航',
    value: '出行导航',
  },
  {
    label: '动作冒险',
    value: '动作冒险',
  },
  {
    label: '动作射击',
    value: '动作射击',
  },
  {
    label: '动漫',
    value: '动漫',
  },
  {
    label: '合作壁纸*',
    value: '合作壁纸*',
  },
  {
    label: '商务',
    value: '商务',
  },
  {
    label: '图书阅读',
    value: '图书阅读',
  },
  {
    label: '学习办公',
    value: '学习办公',
  },
  {
    label: '实用工具',
    value: '实用工具',
  },
  {
    label: '影音娱乐',
    value: '影音娱乐',
  },
  {
    label: '拍摄美化',
    value: '拍摄美化',
  },
  {
    label: '教育',
    value: '教育',
  },
  {
    label: '新闻阅读',
    value: '新闻阅读',
  },
  {
    label: '旅游住宿',
    value: '旅游住宿',
  },
  {
    label: '棋牌桌游',
    value: '棋牌桌游',
  },
  {
    label: '汽车',
    value: '汽车',
  },
  {
    label: '电子书籍',
    value: '电子书籍',
  },
  {
    label: '社交通讯',
    value: '社交通讯',
  },
  {
    label: '经营策略',
    value: '经营策略',
  },
  {
    label: '网络游戏',
    value: '网络游戏',
  },
  {
    label: '美食',
    value: '美食',
  },
  {
    label: '表盘个性',
    value: '表盘个性',
  },
  {
    label: '角色扮演',
    value: '角色扮演',
  },
  {
    label: '购物比价',
    value: '购物比价',
  },
  {
    label: '资讯生活',
    value: '资讯生活',
  },
  {
    label: '运动健康',
    value: '运动健康',
  },
  {
    label: '金融理财',
    value: '金融理财',
  },
]



/**
 * 是否应用市场付费用户。

取值范围：

1：是
0：否
 */
export const hispace_pay_user_cd_dev = [
  {
    value: '1',
    label: '是',
  },
  {
    value: '0',
    label: '否',
  },
]



/**
 * 地址信息
 */
export const latest_province_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


/**
 * 城市
 */
export const city_new_dev_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

/**
1：一线城市
1*：新一线城市
2：二线城市
3：三线城市
4：四线及以下城市
 */
export const active_city_grade_dev = [
  {
    value: '1',
    label: '一线城市',
  },
  {
    value: '1*',
    label: '新一线城市',
  },
  {
    value: '2',
    label: '二线城市',
  },
  {
    value: '3',
    label: '三线城市',
  },
  {
    value: '4',
    label: '四线及以下城市',
  },
]



/**
 * 玩过的游戏元素。
 */
export const game_elements_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


export const game_ip_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const game_theme_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const game_played_game_play_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const game_played_core_play_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

/**
 *

游戏整体沉默时长。

取值范围：

0：[0]
0_7：（0,7]
7_14：（7,14]
14_30：（14,30]
30_60：（30,60]
60+：（60,+∞）


 */
export const game_sdk_overall_silence_duration_up = [
  {
    value: '0',
    label: '[0]',
  },
  {
    label: '0_7',
    value: '(0,7]',
  },
  {
    label: '7_14',
    value: '(7,14]',
  },
  {
    label: '14_30',
    value: '(14,30]',
  },
  {
    label: '30_60',
    value: '(30,60]',
  },
  {
    value: '60+',
    label: '(60,+∞)',
  },
]


/**
 *
 */
export const game_cancel_booking_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]



/**
 *
 游戏沉默天数。

取值范围：
 * 0：[0]
0_7：（0,7]
7_14：（7,14]
14_35：（14,35]
35_60：（35,60]
60+：（60,+∞）
 */
export const game_cps_silence_days_dev = [
  {
    value: '0',
    label: '[0]',
  },
  {
    value: '0_7',
    label: '(0,7]',
  },
  {
    value: '7_14',
    label: '(7,14]',
  },
  {
    value: '14_35',
    label: '(14,35]',
  },
  {
    value: '35_60',
    label: '(35,60]',
  },
  {
    value: '60+',
    label: '(60,+∞)',
  },
]


/**
 *
二次元游戏程度。
取值范围：
1：核心玩家
 */
export const game_comic_game_degree_dev = [
  {
    value: '1',
    label: '核心玩家',
  },
]



/**

近30天竞品游戏平台使用天数。
取值范围：
（0,3]：0_3

（3,7]：3_7

（7,14]：7_14

（14,21]：14_21

（21,30]：21_30
 */
export const game_30dy_plat_usage_days_dev = [
  {
    value: '0_3',
    label: '（0,3]',
  },
  {
    value: '3_7',
    label: '（3,7]',
  },
  {
    value: '7_14',
    label: '（7,14]',
  },
  {
    value: '14_21',
    label: '（14,21]',
  },
  {
    value: '21_30',
    label: '（21,30]',
  },
]


/**
 * 已预约的游戏。

说明：此字段枚举值约4990个，无法一一列举。如果您有需求可以联系华为行业运营提供。
 */
export const game_booking_app_up = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


/**
 * 30天内新安装游戏个数。

取值范围：

1：[1]
2_4：[2,4]
5_10：[5,10]
10+：（10,+∞）
 */
export const game_30dy_app_new_install_cnt_dev = [
  {
    value: '1',
    label: '[1]',
  },
  {
    value: '2_4',
    label: '[2,4]',
  },
  {
    value: '5_10',
    label: '[5,10]',
  },
  {
    value: '10+',
    label: '(10,+∞)',
  },
]


/**
 *
30天内打开过游戏个数。

取值范围：

1：[1]
2_4：[2,4]
5_10：[5,10]
11_20：[11,20]
20+：（20,+∞）
 */
export const game_30dy_app_opened_cnt_dev = [
  {
    value: '[1]',
    label: '1',
  },
  {
    value: '[2,4]',
    label: '2_4',
  },
  {
    value: '5_10',
    label: '[5,10]',
  },
  {
    value: '11_20',
    label: '[11,20]',
  },
  {
    value: '20+',
    label: '(20,+∞)',
  },
]



/**

当前安装游戏个数。

取值范围：

1_4：[1,4]
5_10：[5,10]
11_20：[11,20]：
20+：（20,+∞）

 */
export const game_install_app_cnt_dev = [
  {
    value: '1_4',
    label: '[1,4]',
  },
  {
    value: '5_10',
    label: '[5,10]',
  },
  {
    value: '11_20',
    label: '[11,20]',
  },
  {
    value: '20+',
    label: '(20,+∞)',
  },
]



/**

曾打开过游戏个数。

取值范围：

1_4：[1,4]
5_10：[5,10]
11_50：[11,50]
50+：（50,+∞）
 */
export const game_usage_app_cnt_dev = [
  {
    value: '[1,4]',
    label: '1_4',
  },
  {
    value: '[5,10]',
    label: '5_10',
  },
  {
    value: '11_50',
    label: '[11,50]',
  },
  {
    value: '50+',
    label: '(50,+∞)',
  },
]

/**
 * 90天内使用过的APP。
 */
export const ninetyd_app_active_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


/**
 * 是否剁手党。

取值范围：

1：是
 */
export const consume_purchase_dev = [
  {
    value: '1',
    label: '是',
  },
]


/**
 * 1：音乐爱好者
2：视频爱好者
3：短视频爱好者
4：电子书爱好者
5：听书爱好者
6：夜拍爱好者
7：旅游爱好者
8：摄影爱好者
9：自拍达人
10：运动爱好者
11：手游重度
12：社交达人
13：漫画迷二次元
 */
export const mobile_entertainment_pref_dev = [
  {
    value: '1',
    label: '音乐爱好者',
  },
  {
    value: '2',
    label: '视频爱好者',
  },
  {
    value: '3',
    label: '短视频爱好者',
  },
  {
    value: '4',
    label: '电子书爱好者',
  },
  {
    value: '5',
    label: '听书爱好者',
  },
  {
    value: '6',
    label: '夜拍爱好者',
  },
  {
    value: '7',
    label: '旅游爱好者',
  },
  {
    value: '8',
    label: '摄影爱好者',
  },
  {
    value: '9',
    label: '自拍达人',
  },
  {
    value: '10',
    label: '运动爱好者',
  },
  {
    value: '11',
    label: '手游重度',
  },
  {
    value: '12',
    label: '社交达人',
  },
  {
    value: '13',
    label: '漫画迷二次元',
  },
]



/**
 * 已安装APP分类。

说明：此字段枚举值约120个，无法一一列举。如果您有需求可以联系华为行业运营提供。

示例：游戏_角色扮演_动作、应用_运动健康_运动
 */

export const app_type_installed_v2_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


/**
 * 游戏累计支付金额。

取值范围：

0_5：(0,5]
5_10：(5,10]
10_20：(10,20]
20_50：(20,50]
50_100：(50,100]
100_500：(100,500]
500_1000：(500,1000]
1000_2000：(1000,2000]
2000+}：(2000,+∞)
 */
export const jnt_oprn_iap_30dy_pay_amt_up = [
  {
    value: '0_5',
    label: '(0,5]',
  },
  {
    value: '5_10',
    label: '(5,10]',
  },
  {
    value: '10_20',
    label: '(10,20]',
  },
  {
    value: '20_50',
    label: '(20,50]',
  },
  {
    value: '50_100',
    label: '(50,100]',
  },
  {
    value: '100_500',
    label: '(100,500]',
  },
  {
    value: '500_1000',
    label: '(500,1000]',
  },
  {
    value: '1000_2000',
    label: '(1000,2000]',
  },
  {
    value: '2000+',
    label: '(2000,+∞)',
  },
]


/**
 *
 * 是否是旅游爱好者。

取值范围：

1：是
 */
export const travel_lover_flag = [
  {
    value: '1',
    label: '是',
  },
]



/**
 *
APP当前安装未活跃。

取值范围：

7：近7天未活跃
15：近15天未活跃
30：近30天未活跃
60：近60天未活跃
90+：近90天未活跃
180+：近180天未活跃
90：近90天未活跃（上报天数≥85）
180：近180天未活跃（上报天数≥170）
 */

export const not_actived_seg_dev = [
  {
    value: '7',
    label: '近7天未活跃',
  },
  {
    value: '15',
    label: '近15天未活跃',
  },
  {
    value: '30',
    label: '近30天未活跃',
  },
  {
    value: '60',
    label: '近60天未活跃',
  },
  {
    value: '90+',
    label: '近90天未活跃',
  },
  {
    value: '180+',
    label: '近180天未活跃',
  },
  {
    value: '90',
    label: '近90天未活跃（上报天数≥85）',
  },
  {
    value: '180',
    label: '近180天未活跃（上报天数≥170）',
  },
]


/**
 * 游戏属性偏好。

说明：此字段枚举值约76个，无法一一列举。如果您有需求可以联系华为行业运营提供。

示例：迷宫、机甲、战棋
 */
export const game_play_pref_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


/**

开机天数。
取值范围：
a_0：[0]
a_0_7：(0，7]
a_7_14：(7，14]
a_14_30：(14，30]
a_30_60：(30，60]
a_60_90：(60，90]
a_90_180：(90，180]
a_180_360：(180，360]
a_360_720：(360，720]
a_720+：(720，+∞)
 */
export const active_duration_dev = [
  {
    value: 'a_0',
    label: '[0]',
  },
  {
    value: 'a_0_7',
    label: '(0,7]',
  },
  {
    value: 'a_7_14',
    label: '(7,14]',
  },
  {
    value: 'a_14_30',
    label: '(14,30]',
  },
  {
    value: 'a_30_60',
    label: '(30,60]',
  },
  {
    value: 'a_60_90',
    label: '(60,90]',
  },
  {
    value: 'a_90_180',
    label: '(90,180]',
  },
  {
    value: 'a_180_360',
    label: '(180,360]',
  },
  {
    value: 'a_360_720',
    label: '(360,720]',
  },
  {
    value: 'a_720+',
    label: '(720,+∞)',
  },
]



/**
 * 移动运营商。

取值范围：

在线_p1：中国移动
在线_p2：中国联通
在线_p3：中国电信
在线_p4：未知
 */
export const carrier_score_dev = [
  {
    value: '在线_p1',
    label: '中国移动',
  },
  {
    value: '在线_p2',
    label: '中国联通',
  },
  {
    value: '在线_p3',
    label: '中国电信',
  },
  {
    value: '在线_p4',
    label: '未知',
  },
]

export const cp_new_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const us_hours_30d_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const city_new_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const airfare_purch_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const home_appliances_maintain_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const cleaner_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const marry_love_friend_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const secondhand_trade_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const recent_trips_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const finance_stock_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const finance_fund_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const insurance_dev_v1 = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const financial_bank_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const motion_camera_buying_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const second_house_transaction_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const new_house_transaction_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const school_district_house_transaction_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const smartwatch_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const buy_house_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const tablet_purch_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const menswear_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const ordinary_house_transaction_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const slr_camera_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const car_service_interest_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const financial_microloans_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const probability_role_playing_game_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const probability_business_strategy_game_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const probability_board_game_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const apptype_usage_30d_duration_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const apptype_usage_30d_times_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const female_clothes_buying_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const puz_game_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const audio_entertainment_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const juvenile_cohesion_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const house_property_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const financial_credit_card_apply_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const second_third_score_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const probability_music_interest_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const probability_live_broadcast_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const probability_action_shooting_game_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const probability_sports_racing_game_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const subject_score_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const language_train_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const vocation_interest_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const hobby_train_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const maintain_car_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const decorating_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const video_lover_label = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const short_video_lover_label = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const online_shopping_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const high_consumption = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_country_year_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_country_six_month_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_country_three_month_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_country_one_month_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_city_year_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_city_six_month_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_city_three_month_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const pps_visit_city_one_month_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const city_new_grade_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const network_v2_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const app_interest_v2_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];
export const province_new_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
];


/**
 * 找不到枚举的定向参数
 */
export const consume_spender_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const switch_state_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const resolution_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const ram_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const probability_card_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const probability_video_new_user_payment_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const probability_tower_defense_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const probability_strategy_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


export const probability_role_playing_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const probability_martial_arts_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]



export const probability_legends_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const probability_immortal_xia_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const probability_fishing_payment_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const financial_loan_apply_interests = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]
export const cur_emui_ver_num_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const star_fan_adhesion_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_ecommerce_purchase = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_lower_tiered_city = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_ecommerce_platform = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_high_net_worth = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_internet_age_persion = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_artstyle = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_luxury = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_purchase_fighting_landlord = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_purchase_mahjong = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_purchase_fishing = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_instant_message = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_asking_answers_community = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const career_attributes_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_play = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_making_friends = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_video_chat = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_fashion_brand = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_clothes = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_purchase_themes = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_overseas = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_wholesale = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_home = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_voice_make_friends = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_women_community = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_city_making_friends = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_workplace_social = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_fashion_community = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_women_clothing = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_discount_shopping = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_food = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_drinks = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_blind_date = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_luxury_brand_car = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const hobby_game_type = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const hobby_game_theme = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const hobby_game_carrier = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_new_energy_car = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_loans = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_bhvr_type = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_bhvr_carrier = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_finance = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_curing_car = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_luxury_brand = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_car_produce = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const consume_game_level_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const consume_level_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const career_third_level_type_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const short_video_prefer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const carowner_group = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_business = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_rent_car = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_pregnant_probability = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_purchase_3c_probability = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_prime_credit = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_personal_loan = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_militarynews_prefer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_make_strange_friends = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_game_live = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_entertainment_live = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_credit_card = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const credit_query_service_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const incar_electrical_appliances_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_accessories_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_decoration_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_buy_second_car = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_buy_new_car = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_news_prefer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const int_audio_reader = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const up_realname_verify_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const loan_probability = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const comsumption_level = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const financial_news_prefer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sportsnews_prefer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const novel_reading_perfer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const education_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const user_watch_picbook = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const fitness_slimming_level = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const user_education_language = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const user_education_intelligence = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const user_education_interest = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const game_level = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const game_purchase_score = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const rent_house_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const buy_house_intention = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const cross_industry_exploration_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const e_business_feature_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const general_quality_audience_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const e_business_active_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const hispace_expsoure_cnt = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const health_interest_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const owner_cars_user_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const consume_frequency_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const financial_risk_prefer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const financial_securities_audiences = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const luxury_hotel_prefer = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const radio_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const consume_ability_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const primary_secondary_edu_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const edu_pay_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const mother_baby_nursery_rhyme_score = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const local_life_service_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const mother_baby_services_score = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const parenting_status_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const marriage_status_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const consume_credit_card_level_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_energy_interest_exist_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_price_interest_exist_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_origin_interest_potential_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_price_interest_potential_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_model_potential_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_model_owned_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_brand_interest_potential_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const car_brand_interest_owned_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const parenting_knowledge_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const children_video_audio_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const children_games_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const children_books_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const business_service_job_hunting_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const knowledge_payment_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const children_clothing_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const maternal_health_care_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const owner_house_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_valued_client_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_trust_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_overseas_asset_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_precious_metal_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_crude_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_futures_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_serious_illness_insurance_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_medical_insurance_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_annuity_insurance_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_accident_insurance_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_bond_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_foreign_currency_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_car_loan_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_house_loan_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_goods_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_culture_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_fitness_training_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_outdoor_extreme_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_water_ice_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_running_riding_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_ball_games_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const buy_trip_assistant_service_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const overseas_shopping_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_creadit_card_interests_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_bank_interests_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_crowdfund_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_internet_bank_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_bookkeeping_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_financial_service_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_digital_currency_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_microloans_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const purch_seasonrec_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const purch_sealeisure_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_car_insurance_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_insurance_endowment_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_insurance_life_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const finance_property_insurance_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const book_tickets_pro_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const buy_travel_agents_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const sports_interests_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const purch_outeradv_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const female_skirt_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const female_trousers_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const female_jacket_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const purch_family_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const high_speed_rail_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const probability_anime_lovers_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const home_theater_purch_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const speaker_purch_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const pc_purch_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const game_study_machine_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const rent_shop_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const common_rent_house_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const rent_villa_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const high_end_clothing_luggage_flag_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const nanny_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const maternity_matron_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const house_move_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]

export const house_maintain_dev = [
  {
    value: '1',
    label: `${$t('common.yes')}`,
  }
]


