function normalizeHex(hex: string) {
  const value = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return "#C2410C";
}

function hexToRgb(hex: string) {
  const safe = normalizeHex(hex).slice(1);
  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mix(hex: string, target: string, weight: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex(
    a.r + (b.r - a.r) * weight,
    a.g + (b.g - a.g) * weight,
    a.b + (b.b - a.b) * weight
  );
}

export function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function readableTextColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#1F1A17" : "#FFFFFF";
}

export function themeStyles(primaryColor: string) {
  const color = normalizeHex(primaryColor);
  const dark = mix(color, "#1F140D", 0.52);
  const deeper = mix(color, "#120C08", 0.76);
  const soft = mix(color, "#FFF8F1", 0.9);
  const softer = mix(color, "#FFFCF8", 0.96);
  const muted = mix(color, "#F4E7DA", 0.78);
  const textOnPrimary = readableTextColor(color);

  return {
    color,
    dark,
    deeper,
    soft,
    softer,
    muted,
    textOnPrimary,
    pageBackground: {
      backgroundImage: `radial-gradient(circle at top right, ${withAlpha(color, 0.18)}, transparent 28%), radial-gradient(circle at left 30%, ${withAlpha(color, 0.09)}, transparent 24%), linear-gradient(180deg, ${softer} 0%, #ffffff 42%, ${soft} 100%)`
    },
    heroOverlay: {
      backgroundImage: `linear-gradient(90deg, ${withAlpha(deeper, 0.94)}, ${withAlpha(dark, 0.7)} 52%, ${withAlpha(color, 0.26)})`
    },
    sectionSurface: {
      backgroundImage: `linear-gradient(180deg, ${withAlpha(soft, 0.96)} 0%, #ffffff 100%)`,
      borderColor: withAlpha(color, 0.16)
    },
    softPanel: {
      backgroundImage: `linear-gradient(180deg, ${withAlpha(color, 0.08)} 0%, ${withAlpha(muted, 0.7)} 100%)`,
      borderColor: withAlpha(color, 0.18)
    },
    softBg: {
      backgroundColor: withAlpha(color, 0.1),
      color
    },
    softBorder: {
      borderColor: withAlpha(color, 0.18)
    },
    chip: {
      backgroundColor: withAlpha(color, 0.12),
      color
    },
    button: {
      backgroundColor: color,
      color: textOnPrimary
    },
    buttonGhost: {
      borderColor: withAlpha(color, 0.24),
      color
    },
    buttonSoft: {
      backgroundColor: withAlpha(color, 0.12),
      color
    },
    accentText: {
      color
    },
    accentRing: {
      borderColor: withAlpha(color, 0.34)
    },
    elevatedShadow: {
      boxShadow: `0 20px 48px ${withAlpha(color, 0.16)}`
    }
  };
}
