/**
 * 角色分级常量：与后端 characterType 数值对齐。
 * 资产图谱、设定编辑、绑定报告与分镜绑定弹窗共用，避免各处自行硬编码。
 * 群演（3）允许不出形象，关键帧改用场景图 + 文字提示生成。
 */
export const CHARACTER_TYPE_EXTRA = 3;

export const CHARACTER_TYPE_OPTIONS: Array<{ label: string; value: number }> = [
  { label: '主角', value: 0 },
  { label: '配角', value: 1 },
  { label: '反派', value: 2 },
  { label: '群演', value: 3 },
  { label: '功能性角色', value: 4 },
];

const CHARACTER_TYPE_LABELS: Record<number, string> = {
  0: '主角',
  1: '配角',
  2: '反派',
  3: '群演',
  4: '功能性角色',
};

export function characterTypeLabel(value?: number) {
  if (value === undefined || value === null) {
    return '';
  }
  return CHARACTER_TYPE_LABELS[value] ?? '';
}

export function isExtraCharacter(value?: number) {
  return value === CHARACTER_TYPE_EXTRA;
}
