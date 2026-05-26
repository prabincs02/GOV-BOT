// Rich message renderer — fully theme-aware
export default function RichMessage({ content, colors, themeStyles }) {
  const c  = colors || {};
  const th = themeStyles || {};

  // Use rich* keys from themeEngine, with sensible fallbacks
  const textColor    = th.richTextColor    || th.botBubbleColor || "#333";
  const subColor     = th.richSubColor     || "#666";
  const primaryColor = th.richPrimaryColor || c.primary || "#6B21A8";
  const bulletColor  = th.richBulletColor  || c.primary || "#7c3aed";
  const cardBg       = th.richCardBg       || "#f8f4ff";
  const cardBorder   = th.richCardBorder   || `1.5px solid ${c.primary || "#7c3aed"}20`;
  const cardLeft     = th.richCardLeftBorder || `3px solid ${c.primary || "#7c3aed"}`;
  const cardBackdrop = th.richCardBackdrop || "none";
  const badgeBg      = th.richBadgeBg      || c.primary || "#6B21A8";
  const hrColor      = th.isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb";

  const lines = (content || "").split("\n");
  const rendered = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    // ── KEY FIX: capture startI BEFORE any inner loop that advances i ──
    // Using i after inner loops causes duplicate keys because multiple
    // elements end up sharing the same final i value.
    const startI = i;

    if (!line) {
      rendered.push(<div key={`empty-${startI}`} style={{ height: 6 }} />);
      i++; continue;
    }

    if (/^---+$/.test(line)) {
      rendered.push(<hr key={`hr-${startI}`} style={{ border: "none", borderTop: `1px solid ${hrColor}`, margin: "8px 0" }} />);
      i++; continue;
    }

    // Numbered scheme item — inner loop advances i through detail lines
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      const title = line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "");
      const details = [];
      while (i + 1 < lines.length && (lines[i+1].trim().startsWith("-") || lines[i+1].trim().startsWith("•") || lines[i+1].trim().startsWith("Reply"))) {
        i++;
        const d = lines[i].trim().replace(/^[-•]\s*/, "");
        if (d && !d.startsWith("Reply")) details.push(d);
      }
      rendered.push(
        <div key={`num-${startI}`} style={{
          background: cardBg,
          borderTop: cardBorder,
          borderRight: cardBorder,
          borderBottom: cardBorder,
          borderLeft: cardLeft,
          borderRadius: 8,
          padding: "8px 12px",
          marginBottom: 6,
          backdropFilter: cardBackdrop,
          WebkitBackdropFilter: cardBackdrop,
        }}>
          <div style={{ fontWeight: 700, color: primaryColor, fontSize: 13, marginBottom: details.length ? 4 : 0 }}>
            <span style={{
              background: badgeBg,
              color: "#fff",
              borderRadius: 4,
              padding: "1px 6px",
              fontSize: 11,
              marginRight: 6,
              display: "inline-block",
            }}>{num}</span>
            {title}
          </div>
          {details.map((d, j) => (
            <div key={`detail-${startI}-${j}`} style={{ fontSize: 12, color: subColor, lineHeight: 1.5 }}>
              {d.includes("₹") || d.includes("Rs.") || d.toLowerCase().includes("benefit") ? "💰 "
               : d.toLowerCase().includes("who can") ? "👤 " : "• "}
              {d}
            </div>
          ))}
        </div>
      );
      i++; continue;
    }

    // Bullet points — inner loop advances i through all consecutive bullets
    if (/^[-•]\s/.test(line)) {
      const bullets = [];
      while (i < lines.length && /^[-•]\s/.test(lines[i].trim())) {
        bullets.push(lines[i].trim().replace(/^[-•]\s*/, ""));
        i++;
      }
      rendered.push(
        <ul key={`ul-${startI}`} style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
          {bullets.map((b, j) => (
            <li key={`li-${startI}-${j}`} style={{ fontSize: 13, color: textColor, lineHeight: 1.6, display: "flex", gap: 6, marginBottom: 2 }}>
              <span style={{ color: bulletColor, flexShrink: 0 }}>✦</span>
              <span dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      continue; // i already advanced by the while loop above
    }

    // Bold header / section title
    if (/^\*\*.+\*\*$/.test(line) || (line.endsWith(":") && line.length < 60 && !line.startsWith("Reply"))) {
      rendered.push(
        <div key={`hdr-${startI}`} style={{ fontWeight: 700, fontSize: 13, color: primaryColor, marginTop: 8, marginBottom: 3 }}>
          {line.replace(/\*\*/g, "")}
        </div>
      );
      i++; continue;
    }

    if (/^(Reply|Type|---)/i.test(line) || /^[A-F]\.\s/.test(line)) {
      i++; continue;
    }

    rendered.push(
      <p key={`p-${startI}`} style={{ fontSize: 13, color: textColor, lineHeight: 1.65, margin: "2px 0" }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
      />
    );
    i++;
  }

  return <div style={{ fontFamily: "'Noto Sans', sans-serif" }}>{rendered}</div>;
}
