// Theme Engine — matches the style preview exactly
// Theme = structure/effects | Region = color palette (p = primary, grad = header gradient)

export const THEMES = {
  festive: { id: "festive", name: "Festive Indian",  emoji: "🪷", desc: "Warm gradients, gold shimmer", dark: false },
  glass:   { id: "glass",   name: "Glassmorphism",   emoji: "🔮", desc: "Frosted glass, blur effects",  dark: true  },
  neon:    { id: "neon",    name: "Neon Glow",        emoji: "⚡", desc: "Electric accents, dark bg",   dark: true  },
  fintech: { id: "fintech", name: "Premium Fintech", emoji: "💎", desc: "Clean, minimal, sharp",        dark: false },
};

export const DEFAULT_THEME = "festive";

export function getThemeStyles(themeId, regionColors) {
  const c   = regionColors || {};
  const p   = c.primary    || "#6B21A8";
  const grad = c.headerGrad || "linear-gradient(135deg,#581C87,#3B0764)";

  switch (themeId) {

    // ══════════════════════════════════════════════════════════════
    // 🔮 GLASSMORPHISM — frosted dark purple, blur, translucent
    // ══════════════════════════════════════════════════════════════
    case "glass": {
      const pr = hexToRgba(p, 1);
      return {
        isDark: true,
        // Page
        pageBg: `linear-gradient(160deg, #0d0020 0%, ${adjustHex(p,-55)} 50%, #0a0015 100%)`,
        // Header
        headerBg: hexToRgba(p, 0.38),
        headerBackdrop: "blur(20px)",
        headerBorder: `1px solid ${hexToRgba(p,0.25)}`,
        headerShadow: `0 8px 32px ${hexToRgba(p,0.3)}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        headerTextColor: "#fff",
        headerTextShadow: `0 0 20px ${hexToRgba(p,0.8)}`,
        headerChipBg: hexToRgba(p, 0.2),
        headerChipBorder: `1px solid ${hexToRgba(p,0.3)}`,
        headerChipColor: lighten(p, 80),
        headerBtnBg: "rgba(255,255,255,0.12)",
        headerBtnBorder: "1px solid rgba(255,255,255,0.15)",
        // Festive banner
        festiveStripBg: hexToRgba(p, 0.5),
        // Sidebar
        sidebarBg: "transparent",
        sidebarCardBg: hexToRgba(p, 0.35),
        sidebarCardBackdrop: "blur(20px)",
        sidebarCardBorder: `1px solid ${hexToRgba(p,0.3)}`,
        sideSectionBg: "rgba(255,255,255,0.06)",
        sideSectionBorder: `1px solid ${hexToRgba(p,0.2)}`,
        sideTitleColor: lighten(p, 80),
        catBtnColor: "rgba(255,255,255,0.75)",
        quickBtnBg: hexToRgba(p, 0.18),
        quickBtnBorder: `1px solid ${hexToRgba(p,0.25)}`,
        quickBtnColor: "rgba(255,255,255,0.7)",
        sideNoteBg: hexToRgba(p, 0.35),
        // Chat
        chatBg: "rgba(255,255,255,0.04)",
        msgScrollBg: "transparent",
        // Bot bubble
        botBubbleBg: "rgba(255,255,255,0.09)",
        botBubbleBackdrop: "blur(14px)",
        botBubbleBorder: `1px solid ${hexToRgba(p,0.22)}`,
        botBubbleRadius: "4px 18px 18px 18px",
        botBubbleColor: "rgba(255,255,255,0.88)",
        // User bubble
        userBubbleBg: hexToRgba(p, 0.55),
        userBubbleBackdrop: "blur(14px)",
        userBubbleBorder: `1px solid ${hexToRgba(p,0.4)}`,
        userBubbleRadius: "18px 4px 18px 18px",
        userBubbleColor: "#f0e8ff",
        // Avatar
        avatarBg: `linear-gradient(135deg, ${p}, ${lighten(p,30)})`,
        avatarBorder: `1.5px solid ${hexToRgba(p,0.45)}`,
        avatarShadow: `0 4px 12px ${hexToRgba(p,0.55)}`,
        avatarAnimation: "breathe",
        // Input
        inputAreaBg: hexToRgba(p, 0.18),
        inputBg: "rgba(255,255,255,0.09)",
        inputBorder: `1.5px solid ${hexToRgba(p,0.35)}`,
        inputColor: "#fff",
        inputPlaceholder: "rgba(255,255,255,0.4)",
        // Scheme cards
        cardBg: "rgba(255,255,255,0.08)",
        cardBackdrop: "blur(20px)",
        cardBorder: `1px solid ${hexToRgba(p,0.22)}`,
        cardRadius: "20px",
        cardShadow: "none",
        cardHoverShadow: `0 20px 40px ${hexToRgba(p,0.35)}`,
        cardHeaderBg: `linear-gradient(135deg, ${hexToRgba(p,0.8)}, ${hexToRgba(adjustHex(p,-25),0.8)})`,
        cardNumColor: "rgba(255,255,255,0.92)",
        cardNameColor: lighten(p, 70),
        cardDetailColor: "rgba(255,255,255,0.58)",
        cardTagBg: hexToRgba(p, 0.18),
        cardTagBorder: `1px solid ${hexToRgba(p,0.28)}`,
        cardTagColor: lighten(p, 70),
        cardTapColor: lighten(p, 55),
        // RichMessage inline scheme items
        richCardBg: "rgba(255,255,255,0.08)",
        richCardBorder: `1.5px solid ${hexToRgba(p,0.15)}`,
        richCardLeftBorder: `3px solid ${lighten(p,40)}`,
        richCardBackdrop: "blur(8px)",
        richPrimaryColor: lighten(p, 70),
        richSubColor: "rgba(255,255,255,0.58)",
        richTextColor: "rgba(255,255,255,0.88)",
        richBulletColor: lighten(p, 55),
        richBadgeBg: hexToRgba(p, 0.6),
        // CSS extras (applied via <style> tag)
        extraCSS: `
          @keyframes breathe-${p.replace('#','')} {
            0%,100%{box-shadow:0 4px 12px ${hexToRgba(p,0.5)};}
            50%{box-shadow:0 4px 20px ${hexToRgba(p,0.85)},0 0 0 5px ${hexToRgba(p,0.15)};}
          }
        `,
      };
    }

    // ══════════════════════════════════════════════════════════════
    // ⚡ NEON GLOW — deep dark, electric purple+cyan glow
    // ══════════════════════════════════════════════════════════════
    case "neon": return {
      isDark: true,
      pageBg: "#050510",
      headerBg: "#0d0d1a",
      headerBackdrop: "none",
      headerBorder: `1px solid ${hexToRgba(p,0.22)}`,
      headerShadow: `0 0 30px ${hexToRgba(p,0.18)}`,
      headerTextColor: "#fff",
      headerTextShadow: `0 0 20px ${hexToRgba(p,0.8)}`,
      headerChipBg: "rgba(6,182,212,0.08)",
      headerChipBorder: "1px solid rgba(6,182,212,0.3)",
      headerChipColor: "#06b6d4",
      headerBtnBg: "transparent",
      headerBtnBorder: `1px solid ${hexToRgba(p,0.4)}`,
      // Neon sweep animation on header bottom edge
      headerNeonSweep: true,
      festiveStripBg: "#0d0d1a",
      sidebarBg: "transparent",
      sidebarCardBg: "#0d0d1a",
      sidebarCardBackdrop: "none",
      sidebarCardBorder: `1px solid ${hexToRgba(p,0.3)}`,
      sideSectionBg: "#0a0a18",
      sideSectionBorder: `1px solid ${hexToRgba(p,0.2)}`,
      sideTitleColor: "#a78bfa",
      catBtnColor: "rgba(255,255,255,0.65)",
      quickBtnBg: hexToRgba(p, 0.1),
      quickBtnBorder: `1px solid ${hexToRgba(p,0.28)}`,
      quickBtnColor: "rgba(255,255,255,0.6)",
      sideNoteBg: hexToRgba(p, 0.25),
      chatBg: "#080814",
      msgScrollBg: "transparent",
      // Bot bubble — dark card with top neon line
      botBubbleBg: "#0d0d1a",
      botBubbleBackdrop: "none",
      botBubbleBorder: `1px solid ${hexToRgba(p,0.25)}`,
      botBubbleRadius: "4px 16px 16px 16px",
      botBubbleColor: "rgba(255,255,255,0.82)",
      botBubbleTopLine: `linear-gradient(90deg, ${p}, transparent)`,
      // User bubble
      userBubbleBg: `linear-gradient(135deg, ${hexToRgba(p,0.3)}, rgba(6,182,212,0.15))`,
      userBubbleBackdrop: "none",
      userBubbleBorder: `1px solid ${hexToRgba(p,0.3)}`,
      userBubbleRadius: "16px 4px 16px 16px",
      userBubbleColor: "#c4b5fd",
      userBubbleTextShadow: `0 0 10px ${hexToRgba(p,0.3)}`,
      // Avatar — dark with neon ring glow
      avatarBg: "#0d0d1a",
      avatarBorder: `1.5px solid ${p}`,
      avatarShadow: `0 0 12px ${hexToRgba(p,0.65)}, inset 0 0 8px ${hexToRgba(p,0.1)}`,
      avatarAnimation: "neon-pulse",
      inputAreaBg: "#0a0a15",
      inputBg: "#0d0d1a",
      inputBorder: `1.5px solid ${hexToRgba(p,0.3)}`,
      inputColor: "#fff",
      inputPlaceholder: "rgba(255,255,255,0.3)",
      // Scheme cards
      cardBg: "#0d0d1a",
      cardBackdrop: "none",
      cardBorder: `1px solid ${hexToRgba(p,0.28)}`,
      cardRadius: "16px",
      cardShadow: "none",
      cardHoverShadow: `0 0 30px ${hexToRgba(p,0.35)}, 0 0 60px rgba(6,182,212,0.1)`,
      cardHeaderBg: `linear-gradient(90deg, ${hexToRgba(p,0.22)}, rgba(6,182,212,0.08))`,
      cardNumColor: "#fff",
      cardNameColor: "#a78bfa",
      cardDetailColor: "rgba(255,255,255,0.42)",
      cardTagBg: "rgba(6,182,212,0.06)",
      cardTagBorder: "1px solid rgba(6,182,212,0.3)",
      cardTagColor: "#06b6d4",
      cardTapColor: p,
      // RichMessage
      richCardBg: "#0d0d1a",
      richCardBorder: `1.5px solid ${hexToRgba(p,0.2)}`,
      richCardLeftBorder: `3px solid ${p}`,
      richCardBackdrop: "none",
      richPrimaryColor: "#a78bfa",
      richSubColor: "rgba(255,255,255,0.42)",
      richTextColor: "rgba(255,255,255,0.82)",
      richBulletColor: p,
      richBadgeBg: hexToRgba(p, 0.5),
    };

    // ══════════════════════════════════════════════════════════════
    // 💎 PREMIUM FINTECH — crisp white, sharp shadows, minimal
    // ══════════════════════════════════════════════════════════════
    case "fintech": return {
      isDark: false,
      pageBg: "#f4f2ff",
      headerBg: "#ffffff",
      headerBackdrop: "none",
      headerBorder: "1px solid #f3f4f6",
      headerShadow: `0 1px 3px rgba(0,0,0,0.08), 0 4px 16px ${hexToRgba(p,0.06)}`,
      headerTextColor: "#1a0030",
      headerChipBg: "#f8f7ff",
      headerChipBorder: "1px solid #ede9fe",
      headerChipColor: "#7c3aed",
      headerBtnBg: "#f8f7ff",
      headerBtnBorder: "1px solid #ede9fe",
      festiveStripBg: grad,
      sidebarBg: "transparent",
      sidebarCardBg: grad,
      sidebarCardBackdrop: "none",
      sidebarCardBorder: "none",
      sideSectionBg: "#ffffff",
      sideSectionBorder: "1px solid #f0ecff",
      sideTitleColor: p,
      catBtnColor: "#555",
      quickBtnBg: hexToRgba(p, 0.06),
      quickBtnBorder: `1px solid ${hexToRgba(p,0.15)}`,
      quickBtnColor: "#555",
      sideNoteBg: grad,
      chatBg: "#ffffff",
      chatAreaShadow: "0 4px 20px rgba(0,0,0,0.06)",
      msgScrollBg: "transparent",
      botBubbleBg: `linear-gradient(135deg, ${adjustHex(p,-30)} 0%, ${adjustHex(p,-10)} 100%)`,
      botBubbleBackdrop: "none",
      botBubbleBorder: "none",
      botBubbleRadius: "4px 16px 16px 16px",
      botBubbleColor: "#ffffff",
      userBubbleBg: grad,
      userBubbleBackdrop: "none",
      userBubbleBorder: "none",
      userBubbleRadius: "16px 4px 16px 16px",
      userBubbleColor: "#fff",
      avatarBg: `linear-gradient(135deg, ${p}, ${lighten(p,20)})`,
      avatarBorder: "none",
      avatarShadow: `0 4px 12px ${hexToRgba(p,0.25)}`,
      avatarAnimation: "none",
      inputAreaBg: "#fff",
      inputBg: "#fff",
      inputBorder: "2px solid #e5e7eb",
      inputColor: "#333",
      inputPlaceholder: "#aaa",
      cardBg: "#ffffff",
      cardBackdrop: "none",
      cardBorder: "1px solid #f3f4f6",
      cardRadius: "16px",
      cardShadow: "0 2px 8px rgba(0,0,0,0.04)",
      cardHoverShadow: `0 12px 32px ${hexToRgba(p,0.12)}`,
      cardHeaderBg: grad,
      cardNumColor: "rgba(255,255,255,0.92)",
      cardNameColor: p,
      cardDetailColor: "#777",
      cardTagBg: hexToRgba(p, 0.06),
      cardTagBorder: `1px solid ${hexToRgba(p,0.15)}`,
      cardTagColor: p,
      cardTapColor: lighten(p, 18),
      richCardBg: "rgba(255,255,255,0.12)",
      richCardBorder: "1.5px solid rgba(255,255,255,0.18)",
      richCardLeftBorder: "3px solid #ffd700",
      richCardBackdrop: "none",
      richPrimaryColor: "#ffd700",
      richSubColor: "rgba(255,255,255,0.72)",
      richTextColor: "#ffffff",
      richBulletColor: "#ffd700",
      richBadgeBg: "rgba(255,255,255,0.2)",
    };

    // ══════════════════════════════════════════════════════════════
    // 🪷 FESTIVE INDIAN — warm gradients, gold shimmer, cultural
    // ══════════════════════════════════════════════════════════════
    case "festive":
    default: return {
      isDark: false,
      pageBg: "linear-gradient(160deg, #fdf4ff 0%, #f5f0ff 50%, #fef3ff 100%)",
      // Header: rich gradient with gold border + animated gold shimmer strip + scrolling flowers
      headerBg: grad,
      headerBackdrop: "none",
      headerBorder: "1px solid rgba(255,215,0,0.2)",
      headerShadow: `0 8px 32px ${hexToRgba(p,0.4)}`,
      headerTextColor: "#fff",
      headerTextShadow: "0 2px 8px rgba(0,0,0,0.3)",
      headerChipBg: "rgba(255,215,0,0.15)",
      headerChipBorder: "1px solid rgba(255,215,0,0.3)",
      headerChipColor: "#ffd700",
      headerBtnBg: "rgba(255,215,0,0.15)",
      headerBtnBorder: "1px solid rgba(255,215,0,0.3)",
      headerFestiveStrip: true, // gold shimmer top + flowers bottom
      festiveStripBg: grad,
      sidebarBg: "transparent",
      sidebarCardBg: grad,
      sidebarCardBackdrop: "none",
      sidebarCardBorder: "1px solid rgba(255,215,0,0.15)",
      sideSectionBg: "#ffffff",
      sideSectionBorder: `1px solid ${hexToRgba(p,0.12)}`,
      sideTitleColor: p,
      catBtnColor: "#444",
      quickBtnBg: hexToRgba(p, 0.07),
      quickBtnBorder: `1px solid ${hexToRgba(p,0.15)}`,
      quickBtnColor: "#555",
      sideNoteBg: grad,
      chatBg: "linear-gradient(160deg, #fdf4ff 0%, #fffbff 60%)",
      chatAreaShadow: "0 4px 30px rgba(107,33,168,0.1)",
      msgScrollBg: "transparent",
      // Bot bubble: rich purple gradient for white text
      botBubbleBg: "linear-gradient(135deg, #581C87 0%, #7c1d6f 100%)",
      botBubbleBackdrop: "none",
      botBubbleBorder: "1px solid rgba(255,215,0,0.25)",
      botBubbleRadius: "4px 18px 18px 18px",
      botBubbleColor: "#fff",
      botBubbleShadow: `0 2px 12px ${hexToRgba(p,0.2)}`,
      // User bubble: deep gradient
      userBubbleBg: `linear-gradient(135deg, #581C87, #7c1d6f)`,
      userBubbleBackdrop: "none",
      userBubbleBorder: "1px solid rgba(255,215,0,0.2)",
      userBubbleRadius: "18px 4px 18px 18px",
      userBubbleColor: "#fff",
      userBubbleShadow: `0 4px 16px ${hexToRgba(p,0.35)}`,
      // Avatar: gradient with gold ring
      avatarBg: `linear-gradient(135deg, #581C87, #9333ea)`,
      avatarBorder: "2px solid rgba(255,215,0,0.4)",
      avatarShadow: `0 4px 12px ${hexToRgba(p,0.3)}, 0 0 0 4px rgba(255,215,0,0.08)`,
      avatarAnimation: "breathe",
      inputAreaBg: "#fafafa",
      inputBg: "#fff",
      inputBorder: `2px solid ${hexToRgba(p,0.2)}`,
      inputColor: "#333",
      inputPlaceholder: "#aaa",
      // Cards: white with fdf4ff gradient, gold shimmer on header
      cardBg: "linear-gradient(160deg, #fff 0%, #fdf4ff 100%)",
      cardBackdrop: "none",
      cardBorder: `1px solid ${hexToRgba(p,0.15)}`,
      cardRadius: "20px",
      cardShadow: `0 4px 16px ${hexToRgba(p,0.08)}`,
      cardHoverShadow: `0 16px 40px ${hexToRgba(p,0.2)}`,
      cardHoverBorder: "1px solid rgba(255,215,0,0.4)",
      cardHeaderBg: `linear-gradient(135deg, #581C87, #7c1d6f)`,
      cardNumColor: "#ffd700",
      cardNameColor: p,
      cardDetailColor: "#666",
      cardTagBg: "linear-gradient(135deg, rgba(107,33,168,0.08), rgba(255,215,0,0.06))",
      cardTagBorder: `1px solid ${hexToRgba(p,0.15)}`,
      cardTagColor: "#7c3aed",
      cardTapColor: "#9333ea",
      cardGoldShimmer: true,
      richCardBg: "rgba(255,255,255,0.12)",
      richCardBorder: `1.5px solid rgba(255,215,0,0.25)`,
      richCardLeftBorder: `3px solid #ffd700`,
      richCardBackdrop: "none",
      richPrimaryColor: "#ffd700",
      richSubColor: "rgba(255,255,255,0.75)",
      richTextColor: "#fff",
      richBulletColor: "#ffd700",
      richBadgeBg: `linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,255,255,0.15))`,
    };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  try {
    const h = hex.replace("#","");
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch { return `rgba(107,33,168,${alpha})`; }
}
function adjustHex(hex, amount) {
  try {
    const h = hex.replace("#","");
    const cl = v => Math.max(0,Math.min(255,v));
    const r = cl(parseInt(h.substring(0,2),16)+amount);
    const g = cl(parseInt(h.substring(2,4),16)+amount);
    const b = cl(parseInt(h.substring(4,6),16)+amount);
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  } catch { return hex; }
}
function lighten(hex, amount) { return adjustHex(hex, amount); }
