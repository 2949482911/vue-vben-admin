<script setup lang="ts" name="BytedancePromotionDrawer">
import { nextTick, ref } from 'vue';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import MaterialSelector from '#/views/marketing/creation/components/material/MaterialSelector.vue';

const { formFields } = defineProps({
  formFields: { type: Array, default: () => [] },
});

/**
 * 产品主图素材选择器模态框
 * 仅选择图片、多选模式
 */
const [ProductImageModal, productImageModalApi] = useVbenModal({
  connectedComponent: MaterialSelector,
});

/** 当前已选的产品主图 image_ids，用于回显到素材选择器 */
const currentProductImageIds = ref<string[]>([]);

/**
 * 打开产品主图素材选择器
 * 注入 materialType='image' 限制只选图片，preSelectedIds 回显已选素材
 */
function openProductImageModal() {
  productImageModalApi.setData({
    materialType: 'image',
    preSelectedIds: currentProductImageIds.value,
  });
  productImageModalApi.open();
}

/**
 * 素材选择器确认回调：接收选中的图片素材，更新表单 v-model 绑定的 product_image_button 字段
 * MaterialSelector 会 emit (selectedMaterials, currentMaterialGroupIndex)
 */
function onProductImageSelected(selectedMaterials: Array<{ id: string; name: string }>, _groupIndex?: number) {
  const imageIds = selectedMaterials.map((m) => String(m.id));
  currentProductImageIds.value = imageIds;
  // 通过 formApi 更新 product_image_button 字段，触发 v-model → ProductImageButtonField 自动展示已选数量
  formApi.setValues({ product_image_button: imageIds,});
}

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
});

const [Drawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  class: 'w-[30vw]',
  closeOnPressEscape: true,
  onOpenChange: async (isOpen: boolean) => {
    if (isOpen) {
      const promotion = drawerApi.getData();

      // 同步当前已选主图 ID，用于后续打开素材选择器时回显（防御非数组值）
      const rawImageIds = promotion?.promotion_materials?.product_info?.image_ids;
      currentProductImageIds.value = Array.isArray(rawImageIds) ? rawImageIds.map(String) : [];

      // 动态注入 ProductImageButtonField 的 componentProps（只注入 openProductImageModal 回调）
      const schemaWithProductImage = (formFields as any[]).map((f: any) => {
        if (f.fieldName === 'product_image_button') {
          return {
            ...f,
            componentProps: {
              openProductImageModal,
            },
          };
        }
        return f;
      });

      formApi.setState({ schema: schemaWithProductImage });
      await nextTick();

      // native_setting 平铺
      const ns = promotion.native_setting || {};

      // brand_info 平铺
      const bi = promotion.brand_info || {};

      const flattenedData = {
        ...promotion,

        // native_setting 平铺
        native_setting_aweme_setting_type: ns.aweme_setting_type,
        native_setting_aweme_id: ns.aweme_id,
        native_setting_aweme_ids: ns.aweme_ids,
        native_setting_anchor_related_type: ns.anchor_related_type,

        // 产品主图：通过 v-model 的 product_image_button 字段管理（防御非数组值）
        product_image_button: Array.isArray(promotion.promotion_materials?.product_info?.image_ids)
          ? promotion.promotion_materials.product_info.image_ids
          : [],
        // 素材信息 产品信息
        promotion_materials_product_info_titles: promotion.promotion_materials?.product_info?.titles,
        promotion_materials_product_info_selling_points: promotion.promotion_materials?.product_info?.selling_points,
        // 行动号召
        promotion_materials_call_to_action_buttons: promotion.promotion_materials?.call_to_action_buttons,
        // 智能生成行动号召按钮
        promotion_materials_intelligent_generation: promotion.promotion_materials?.intelligent_generation,

        // brand_info 平铺
        brand_info_yuntu_category_id: bi.yuntu_category_id,
        brand_info_cdp_brand_id: bi.cdp_brand_id,
        brand_info_ecom_brand_id: bi.ecom_brand_id,
        brand_info_brand_name_id: bi.brand_name_id,
        brand_info_cdp_brand_name: bi.cdp_brand_name,
        brand_info_sub_brand_names: bi.sub_brand_names,
        brand_info_sub_brand_name_ids: bi.sub_brand_name_ids,
      };

      // 过滤 undefined/null：只在值明确存在时才传入表单，让 schema defaultValue 生效
      // 注意：0、false、'' 等是合法的表单值，不应被过滤
      const filteredData: Record<string, any> = {};
      for (const [key, value] of Object.entries(flattenedData)) {
        if (value !== undefined && value !== null) {
          filteredData[key] = value;
        }
      }

      // 移除嵌套对象字段（非表单平铺字段名）
      const nestedKeys = [
        'promotion_materials', 'promotion_related_product', 'native_setting',
        'brand_info', 'keywords', 'shop_multi_roi_goals',
      ];
      nestedKeys.forEach((k) => delete filteredData[k]);

      await formApi.setValues(filteredData);
    }
  },
  onConfirm: async () => {
    const isValidate = await formApi.validate();
    if (!isValidate.valid) return;
    const currentValues = await formApi.getValues();

    const promotion = {
      ...currentValues,

      // native_setting 还原
      native_setting: {
        aweme_setting_type: currentValues.native_setting_aweme_setting_type || '',
        aweme_id: currentValues.native_setting_aweme_id || '',
        aweme_ids: currentValues.native_setting_aweme_ids || [],
        anchor_related_type: currentValues.native_setting_anchor_related_type || 'OFF',
      },

      // 素材信息（product_image_button 通过 v-model 存储 image_ids）
      promotion_materials: {
        product_info: {
          titles: currentValues.promotion_materials_product_info_titles || [],
          image_ids: Array.isArray(currentValues.product_image_button) ? currentValues.product_image_button : [],
          selling_points: currentValues.promotion_materials_product_info_selling_points || [],
          local_material_image_ids: currentValues.promotion_materials_product_info_titles || [],
        },
        call_to_action_buttons: currentValues.promotion_materials_call_to_action_buttons || [],
        intelligent_generation: currentValues.promotion_materials_intelligent_generation || 'OFF',
      },
      // brand_info 还原
      brand_info: {
        yuntu_category_id: currentValues.brand_info_yuntu_category_id || 0,
        cdp_brand_id: currentValues.brand_info_cdp_brand_id || 0,
        ecom_brand_id: currentValues.brand_info_ecom_brand_id || 0,
        brand_name_id: currentValues.brand_info_brand_name_id || 0,
        cdp_brand_name: currentValues.brand_info_cdp_brand_name || '',
        sub_brand_names: currentValues.brand_info_sub_brand_names || [],
        sub_brand_name_ids: currentValues.brand_info_sub_brand_name_ids || [],
      },
    };

    // 清除表单平铺字段，避免污染外部数据模型（这些字段已在嵌套对象中还原）
    const flatFormKeys = [
      'product_image_button',
      'native_setting_aweme_setting_type', 'native_setting_aweme_id',
      'native_setting_aweme_ids', 'native_setting_anchor_related_type',
      'promotion_materials_product_info_titles',
      'promotion_materials_product_info_selling_points',
      'promotion_materials_call_to_action_buttons',
      'promotion_materials_intelligent_generation',
      'brand_info_yuntu_category_id', 'brand_info_cdp_brand_id',
      'brand_info_ecom_brand_id', 'brand_info_brand_name_id',
      'brand_info_cdp_brand_name', 'brand_info_sub_brand_names',
      'brand_info_sub_brand_name_ids',
    ];
    flatFormKeys.forEach((key) => delete (promotion as any)[key]);

    drawerApi.setData(promotion);
    await drawerApi.close();
  },
  onClosed() {
    formApi.resetForm();
    drawerApi.close();
  },
  onCancel() {
    formApi.resetForm();
    drawerApi.close();
  },
});
</script>

<template>
  <div>
    <Drawer title="广告配置">
      <Form></Form>
    </Drawer>

    <!-- 产品主图素材选择器 -->
    <ProductImageModal
      @update:material="onProductImageSelected"
    />
  </div>
</template>
