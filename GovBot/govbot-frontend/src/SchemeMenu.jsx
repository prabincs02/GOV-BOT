// SchemeMenu — Smart card renderer for scheme lists and sub-menus
// Native-language aware: cards appear regardless of reply language
export default function SchemeMenu({ content, onSelect, colors, onApply, lastScheme, onSchemeSelected, onBackToList, themeStyles, isDarkTheme, themeId, useNativeLang }) {
  const c = colors;
  const th = themeStyles || {};

  const lines = content.split('\n');
  const items = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s+(.+)/);
    if (match) {
      if (current) items.push(current);
      current = { num: match[1], title: match[2].replace(/\*\*/g, '').trim(), details: [] };
    } else if (current && (line.trim().startsWith('-') || line.trim().startsWith('•'))) {
      const detail = line.trim().replace(/^[-•]\s*/, '');
      if (detail) current.details.push(detail);
    }
  }
  if (current) items.push(current);
  if (items.length < 2) return null;

  // ── CRITICAL: detect sub-menu response FIRST (before scheme list check) ──────
  // The AI always says "You selected X. What would you like to know?" for sub-menus
  const isSubMenuResponse = /You selected .+?\. What would you like to know/i.test(content);

  // ── Also detect sub-menus when re-shown after answering a sub-option ─────────
  // (AI shows the sub-menu again after answering, without "You selected" header)
  const hasSubMenuOptions = items.length <= 7 && items.length >= 3 &&
    items.some(item => /eligib|document|required doc|benefit|helpline|apply|how to apply/i.test(item.title)) &&
    items.every(item => !/scheme|yojana|bima|mudra|awas|ujjwala|ayushman|scholarship|samriddhi|mission|pradhan|nrega|pmay|gruha|rythu|kudumbashree|kalaignar|pudhumai/i.test(item.title));

  const isSubMenu = isSubMenuResponse || hasSubMenuOptions;

  // ── Scheme list: only when NOT a sub-menu ────────────────────────────────────
  const isSchemeList = !isSubMenu && (
    items.some(item => {
      const t = item.title;
      return (
        /scheme|yojana|bima|kisan|mudra|awas|ujjwala|ayushman|pension|scholarship|credit|solar|laptop|meal|breakfast|samriddhi|mission|pradhan|mukhya|nrega|svamitva|pm-|pmay|pmkvy|nsp|jan dhan|gruha|rythu|aarogyasri|arogya|vidya|suraksha|jeevan|fasal|karunya|snehapoorvam|kudumbashree|yuvakeralam|anna|shakti|yuva nidhi|arivu|atal|nidhi|thodu|vasathi|ammavodi|cheyutha|amma|kalaignar|pudhumai|mukhyamantri|cm |chief minister|karshaka|jyothi|lakshmi|vikas|welfare/i.test(t) ||
        t.startsWith('🏛️')
      );
    }) || items.length >= 4
  );

  if (!isSchemeList && !isSubMenu) return null;

  // ── Scheme name: prop → parse "You selected X" → bold name fallback ─────────
  const effectiveSchemeName =
    (lastScheme && lastScheme.trim()) ||
    (content.match(/You selected ([^.\n]+?)[.\n]/i)?.[1]?.trim().replace(/[*_]/g, '') ?? '') ||
    (content.match(/(?:about|for) \*\*([^*\n]{4,60}?)\*\*/i)?.[1]?.trim() ?? '');

  const schemeIcons = ['🌾','🏥','🏠','🎓','💼','👴','👧','💳','🌱','🛡️','🍚','💡','🔆','🍳','👩','🏛️','📚','🩺'];
  const subMenuIcons = ['✅','📋','💰','📞','🚀','🔗','📄'];

  const handleCardClick = (item) => {
    if (isSubMenu) {
      const isApplyOption = /apply/i.test(item.title) || item.num === '6';
      if (isApplyOption && onApply && effectiveSchemeName) {
        onApply(effectiveSchemeName);
        return;
      }
      const descriptive = {
        '1': `What are the eligibility criteria for ${effectiveSchemeName}?`,
        '2': `What documents are needed to apply for ${effectiveSchemeName}?`,
        '3': `What is the exact benefit amount for ${effectiveSchemeName}?`,
        '4': `Explain step by step how to apply for ${effectiveSchemeName}`,
        '5': `What is the helpline number and official website for ${effectiveSchemeName}?`,
        '6': `I want to apply for ${effectiveSchemeName} now`,
      };
      onSelect(descriptive[item.num] || `${item.title} for ${effectiveSchemeName}`);
    } else {
      onSelect(item.num);
      if (onSchemeSelected) onSchemeSelected(item.title.replace(/^🏛️[^:]+:\s*/, '').trim());
    }
  };

  return (
    <div style={{ ...sm.wrap, color: th.cardDetailColor || 'inherit' }}>
      <div style={sm.headerRow}>
        <div style={{ ...sm.label, color: th.sideTitleColor || c.primary }}>
          {isSubMenu ? '📌 CHOOSE WHAT TO KNOW:' : '🔢 TAP A SCHEME TO EXPLORE:'}
        </div>
        {isSubMenu && onBackToList && (
          <button style={{ ...sm.navBtn, borderColor: c.primary + '60', color: c.primary }} onClick={onBackToList}>
            ← All Schemes
          </button>
        )}
      </div>

      <div style={sm.grid}>
        {items.map((item, i) => {
          const isApplyCard = isSubMenu && (/apply/i.test(item.title) || item.num === '6');
          const cardBg = isApplyCard ? '#f0fdf4' : (th.cardBg || '#fff');
          const cardBorderFull = isApplyCard ? '1.5px solid #16a34a' : (th.cardBorder || `1.5px solid ${c.primary}`);
          const cardBackdrop = !isApplyCard ? (th.cardBackdrop || 'none') : 'none';
          const nameColor = isApplyCard ? '#16a34a' : (th.cardNameColor || c.primary);
          const tapColor = isApplyCard ? '#16a34a' : (th.cardTapColor || c.primary);
          const tagBg = th.cardTagBg || c.primary + '15';
          const tagColor = th.cardTagColor || c.primary;
          const detailColor = th.cardDetailColor || '#666';
          const cardRadius = th.cardRadius || 12;
          return (
            <button
              key={i}
              className={themeId === 'neon' ? 'neon-scheme-card' : ''}
              style={{
                ...sm.card,
                border: cardBorderFull,
                borderRadius: cardRadius,
                background: cardBg,
                backdropFilter: cardBackdrop,
                WebkitBackdropFilter: cardBackdrop,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = th.cardHoverShadow || `0 6px 20px ${c.primary}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = th.cardShadow || '0 2px 8px rgba(0,0,0,0.07)';
              }}
              onClick={() => handleCardClick(item)}
            >
              <div
                className={!isApplyCard && themeId === 'festive' ? 'card-festive-header' : ''}
                style={{ ...sm.cardHeader, background: isApplyCard ? 'linear-gradient(135deg,#16a34a,#15803d)' : (th.cardHeaderBg || c.headerGrad) }}
              >
                <span style={{ ...sm.num, color: isApplyCard ? '#fff' : (th.cardNumColor || '#fff') }}>{item.num}</span>
                <span style={sm.icon}>{isSubMenu ? (subMenuIcons[i] || '📌') : (schemeIcons[i % schemeIcons.length] || '📋')}</span>
              </div>
              <div style={sm.cardBody}>
                {item.title.startsWith('🏛️') && (
                  <div style={{ ...sm.stateTag, background: tagBg, color: tagColor, border: th.cardTagBorder || 'none' }}>
                    🏛️ {item.title.match(/🏛️\s*([^:]+):/)?.[1]?.trim() || 'State'}
                  </div>
                )}
                <div style={{ ...sm.title, color: nameColor }}>
                  {item.title.replace(/^🏛️[^:]+:\s*/, '').trim()}
                </div>
                {item.details.slice(0, 2).map((d, j) => (
                  <div key={j} style={{ ...sm.detail, color: detailColor }}>
                    {d.length > 55 ? d.slice(0, 53) + '…' : d}
                  </div>
                ))}
              </div>
              <div style={{ ...sm.tapHint, color: tapColor }}>
                {isApplyCard ? '🚀 Apply →' : 'Tap →'}
              </div>
            </button>
          );
        })}
      </div>

      {isSubMenu && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {onApply && effectiveSchemeName && (
            <button
              style={{ ...sm.applyBtn, background: c.primary, flex: 2 }}
              onClick={() => onApply(effectiveSchemeName)}
            >
              🚀 Apply for {effectiveSchemeName} Now →
            </button>
          )}
          {onBackToList && (
            <button
              style={{ ...sm.applyBtn, background: 'transparent', border: `2px solid ${c.primary}`, color: c.primary, flex: 1 }}
              onClick={onBackToList}
            >
              📋 More
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const sm = {
  wrap: { marginTop: 14 },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' },
  navBtn: { background: 'none', border: '1px solid', borderRadius: 20, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700, flexShrink: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  card: {
    border: '1.5px solid', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
    textAlign: 'left', padding: 0,
    transition: 'transform 0.15s, box-shadow 0.15s',
    fontFamily: "'Noto Sans', sans-serif",
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    display: 'flex', flexDirection: 'column',
  },
  cardHeader: { padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  num: { color: '#fff', fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 20, lineHeight: 1 },
  icon: { fontSize: 18 },
  cardBody: { padding: '8px 8px 4px', flex: 1 },
  stateTag: { fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, display: 'inline-block', marginBottom: 4 },
  title: { fontWeight: 700, fontSize: 11, marginBottom: 4, lineHeight: 1.35 },
  detail: { fontSize: 10, color: '#666', lineHeight: 1.35, marginBottom: 2 },
  tapHint: { fontSize: 10, fontWeight: 700, padding: '4px 8px 6px', opacity: 0.75, flexShrink: 0 },
  applyBtn: { padding: '10px', borderRadius: 12, border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: "'Baloo 2', cursive", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
};
