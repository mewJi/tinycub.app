// contentExec.jsx — Content list (3 views) + 3-step create/edit flow
const { useState: useS, useRef: useR, useEffect: useE } = React;
const { STATUS: CS, STATUS_ORDER: CSO } = window;

// ── image helper (downscale to keep localStorage small) ──
function fileToDataURL(file, max = 1000) {
  return new Promise(resolve => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const sc = Math.min(1, max / Math.max(img.width, img.height));
        const cw = Math.round(img.width * sc), ch = Math.round(img.height * sc);
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
        resolve(cv.toDataURL('image/jpeg', 0.85));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

function StatusBadge({ status, size = 'md' }) {
  const s = CS[status];
  const sm = size === 'sm';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.fg, padding: sm ? '2px 8px' : '4px 10px', borderRadius: 999, fontFamily: 'Nunito', fontWeight: 800, fontSize: sm ? 10 : 11.5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />{s.label}
    </span>
  );
}

function Thumb({ item, size = 54 }) {
  const img = item.idea && item.idea.image;
  return (
    <div style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: '#F2E7D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <window.TinyCub size={size * 0.82} mood="curious" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────────────────
function ContentList({ state, update, view, filter, setFilter, accent, onCreate, onOpen, onOpenAll }) {
  const items = [...state.items].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  const shown = filter ? items.filter(i => i.status === filter) : items;

  const markPosted = (e, id) => {
    e.stopPropagation();
    update(s => { s.items = s.items.map(i => i.id === id ? { ...i, status: 'posted', postedAt: Date.now(), updatedAt: Date.now() } : i); return s; });
  };

  return (
    <div style={{ padding: '0 16px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '4px 2px 14px' }}>
        <div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 22, color: '#3D3A33', lineHeight: 1.1 }}>Content</div>
          <div style={{ fontFamily: 'Nunito', fontSize: 13, fontWeight: 700, color: '#A39A88' }}>{state.items.filter(i => i.status !== 'posted').length} in motion · {state.items.filter(i => i.status === 'posted').length} posted</div>
        </div>
        <button onClick={onOpenAll} className="tc-press" style={{ flexShrink: 0, marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid #E3DCCD', cursor: 'pointer', borderRadius: 999, padding: '6.5px 12.5px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12.5, background: '#fff', color: '#7A7363' }}>
          <window.Icon name="grid" size={14} color="#A39A88" strokeWidth={2.2} /> All ({state.items.length})
        </button>
      </div>
      {/* create button */}
      <button onClick={onCreate} className="tc-press" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: accent, color: '#fff', border: 'none', borderRadius: 18, padding: '15px', fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: `0 6px 16px ${accent}44`, margin: '4px 0 16px' }}>
        <window.Icon name="plus" size={21} color="#fff" strokeWidth={2.5} /> Create content
      </button>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 14, margin: '0 -16px', padding: '0 16px 14px', WebkitOverflowScrolling: 'touch' }}>
        {CSO.map(k => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(filter === k ? null : k)} color={CS[k].fg} bg={CS[k].bg}>
            {CS[k].label} ({state.items.filter(i => i.status === k).length})
          </Chip>
        ))}
      </div>

      {shown.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#B0A894' }}>
          <window.TinyCub size={80} mood="sleepy" />
          <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 15, marginTop: 10 }}>Nothing here yet</div>
          <div style={{ fontFamily: 'Nunito', fontSize: 13, fontWeight: 600 }}>Tap “Create content” to start an idea.</div>
        </div>
      )}

      {view === 'kanban' ? (
        <KanbanView items={items} onOpen={onOpen} markPosted={markPosted} />
      ) : view === 'list' ? (
        <CompactView items={shown} onOpen={onOpen} markPosted={markPosted} accent={accent} />
      ) : (
        <CardsView items={shown} onOpen={onOpen} markPosted={markPosted} accent={accent} />
      )}
    </div>
  );
}

function Chip({ children, active, onClick, color = '#5E6A4E', bg = '#EDEFE8', accent }) {
  // when the label color is white (e.g. Posted), fall back to its solid bg color
  const isWhite = (c) => /^#?fff(fff)?$/i.test(String(c).replace('#', '').slice(0, 6)) || String(c).toLowerCase() === '#ffffff';
  const hl = accent || (isWhite(color) ? bg : color);
  return (
    <button onClick={onClick} style={{
      whiteSpace: 'nowrap', cursor: 'pointer', borderRadius: 999,
      padding: '8px 14px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12.5,
      background: active ? hl : '#fff',
      color: active ? '#fff' : '#A39A88',
      border: active ? `2px solid ${hl}` : '2px solid #ECE6D9',
      boxShadow: active ? `0 2px 8px ${hl}33` : 'none',
    }}>{children}</button>
  );
}

function CardsView({ items, onOpen, markPosted, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {items.map(it => (
        <div key={it.id} onClick={() => onOpen(it)} className="tc-card tc-press" style={{ padding: 13, display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'center' }}>
          <Thumb item={it} size={58} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 15, color: '#3D3A33', lineHeight: 1.2, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title || 'Untitled idea'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusBadge status={it.status} size="sm" />
              {it.scenes.length > 0 && <span style={{ fontFamily: 'Nunito', fontSize: 11, fontWeight: 700, color: '#B0A894' }}>{it.scenes.length} scene{it.scenes.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
          {it.status === 'ready'
            ? <button onClick={(e) => markPosted(e, it.id)} className="tc-press" style={{ flexShrink: 0, border: 'none', background: '#C9842F', color: '#fff', borderRadius: 11, padding: '8px 11px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><window.Icon name="send" size={14} color="#fff" />Post</button>
            : <span style={{ fontFamily: 'Nunito', fontSize: 10.5, fontWeight: 700, color: '#C3BBA8', flexShrink: 0 }}>{window.relTime(it.updatedAt || it.createdAt)}</span>}
        </div>
      ))}
    </div>
  );
}

function CompactView({ items, onOpen, markPosted, accent }) {
  return (
    <div className="tc-card" style={{ padding: '2px 0' }}>
      {items.map((it, i) => (
        <div key={it.id} onClick={() => onOpen(it)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', cursor: 'pointer', borderBottom: i < items.length - 1 ? '1px solid #F1ECE1' : 'none' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: CS[it.status].dot === '#fff' ? CS[it.status].bg : CS[it.status].dot, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: '#3D3A33', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title || 'Untitled idea'}</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 11, fontWeight: 700, color: CS[it.status].fg === '#ffffff' ? '#C9842F' : CS[it.status].fg }}>{CS[it.status].label}</div>
          </div>
          <window.Icon name="next" size={16} color="#CFC7B5" />
        </div>
      ))}
    </div>
  );
}

function KanbanView({ items, onOpen, markPosted }) {
  const cols = CSO;
  return (
    <div style={{ display: 'flex', gap: 11, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 8px', WebkitOverflowScrolling: 'touch' }}>
      {cols.map(k => {
        const colItems = items.filter(i => i.status === k);
        return (
          <div key={k} style={{ flexShrink: 0, width: 168, background: '#F6F2E9', borderRadius: 18, padding: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px 9px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CS[k].dot === '#fff' ? CS[k].fg : CS[k].dot }} />
              <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 12.5, color: '#5C564A' }}>{CS[k].short}</span>
              <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: '#B0A894', marginLeft: 'auto' }}>({colItems.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {colItems.map(it => (
                <div key={it.id} onClick={() => onOpen(it)} style={{ background: '#fff', borderRadius: 13, padding: 10, cursor: 'pointer', boxShadow: '0 1px 3px rgba(80,70,40,.06)' }}>
                  <Thumb item={it} size={'100%'} />
                  <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12.5, color: '#3D3A33', marginTop: 8, lineHeight: 1.25 }}>{it.title || 'Untitled'}</div>
                  {it.status === 'ready' && <button onClick={(e) => markPosted(e, it.id)} style={{ marginTop: 7, width: '100%', border: 'none', background: '#C9842F', color: '#fff', borderRadius: 9, padding: '6px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>Mark posted</button>}
                </div>
              ))}
              {colItems.length === 0 && <div style={{ fontFamily: 'Nunito', fontSize: 11.5, fontWeight: 600, color: '#C3BBA8', textAlign: 'center', padding: '14px 4px' }}>empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ALL CONTENT — full-screen page (opened from the "All" button)
// ─────────────────────────────────────────────────────────
function AllContent({ state, update, accent, onClose, onOpen }) {
  const items = [...state.items].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
  const shown = items;
  const markPosted = (e, id) => {
    e.stopPropagation();
    update(s => { s.items = s.items.map(i => i.id === id ? { ...i, status: 'posted', postedAt: Date.now(), updatedAt: Date.now() } : i); return s; });
  };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, background: '#FFFFFF', display: 'flex', flexDirection: 'column', animation: 'tcslideup .28s cubic-bezier(.2,.7,.2,1)' }}>
      {/* header */}
      <div style={{ paddingTop: 52, flexShrink: 0, background: '#fff', borderBottom: '1px solid #F1ECE1' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px 12px', gap: 10 }}>
          <button onClick={onClose} className="tc-press" style={{ border: 'none', background: '#F2EDE2', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <window.Icon name="x" size={20} color="#5C564A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: '#3D3A33' }}>All content</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 700, color: '#A39A88' }}>{items.length} total · sorted by last updated</div>
          </div>
        </div>
      </div>
      {/* body */}
      <div className="tc-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 28px' }}>
        {shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#B0A894' }}>
            <window.TinyCub size={80} mood="sleepy" />
            <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 15, marginTop: 10 }}>Nothing here yet</div>
          </div>
        ) : (
          <CardsView items={shown} onOpen={onOpen} markPosted={markPosted} accent={accent} />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ContentList, AllContent, StatusBadge, Thumb, fileToDataURL, Chip });
