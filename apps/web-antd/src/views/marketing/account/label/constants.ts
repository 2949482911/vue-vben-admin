/** 标签展示色盘：按标签名稳定取色，保证同一标签各处颜色一致 */
const LABEL_PALETTE = [
  'blue',
  'purple',
  'cyan',
  'green',
  'orange',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
];

export function getLabelColor(name?: string): string {
  if (!name) {
    return 'default';
  }
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return LABEL_PALETTE[hash % LABEL_PALETTE.length]!;
}
