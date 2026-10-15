/**
 * 图表配色：从 vben 设计 token 取色，保证与站内主题一致。
 *
 * ECharts 画在 canvas 上（zrender 解析颜色），它 **只按逗号切分** `hsl(...)`，
 * 而 vben token 是空格分隔的 HSL 通道串（如 `212 100% 45%`），直接丢给 ECharts
 * 会解析成 NaN（表现为悬浮准线/颜色消失）。因此这里统一转成 hex 再返回。
 */

/** HSL 通道串（`H S% L%`，H 可带 deg）→ hex；解析失败返回 null */
function hslChannelsToHex(channels: string): null | string {
  const m = channels
    .trim()
    .match(/^(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%$/i);
  if (!m) {
    return null;
  }
  const h = (((parseFloat(m[1]!) % 360) + 360) % 360) / 360;
  const s = parseFloat(m[2]!) / 100;
  const l = parseFloat(m[3]!) / 100;

  const hue2rgb = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * v);
  };
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(hue2rgb(0))}${toHex(hue2rgb(8))}${toHex(hue2rgb(4))}`;
}

/** 读取 vben token（HSL 通道串）并转为 ECharts 可解析的颜色 */
function readToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') {
    return fallback;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) {
    return fallback;
  }
  // 已是具体颜色（#/rgb/hsl…）时原样返回；HSL 通道串则转 hex
  if (/^(#|rgb|hsl|oklch|color\()/i.test(raw)) {
    return raw;
  }
  return hslChannelsToHex(raw) ?? fallback;
}

/** 本看板补充的两个强调色（vben 无内置 token），与卡片的 tint 保持一致 */
export const ACCENT_CYAN = hslChannelsToHex('187 78% 38%') ?? '#159bac';
export const ACCENT_VIOLET = hslChannelsToHex('258 84% 62%') ?? '#7e4def';

/** 图表调色板（主色 / 成功 / 警告 / 危险 + 两个强调色），全部为 hex */
export function chartPalette() {
  return {
    primary: readToken('--primary', '#1a73e8'),
    success: readToken('--success', '#12a150'),
    warning: readToken('--warning', '#d97706'),
    danger: readToken('--destructive', '#e5484d'),
    cyan: ACCENT_CYAN,
    violet: ACCENT_VIOLET,
  };
}
