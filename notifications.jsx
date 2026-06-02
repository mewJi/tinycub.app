// notifications.jsx — today's nudge + smart reminders + weekly rhythm
const { DAY_TASKS: DT, TONE_COLOR: TC } = window;

function Notifications({ state, stats, accent, onNav, onCreate }) {
  const today = new Date();
  const dow = today.getDay();
  const task = DT[dow];
  const tone = TC[task.tone];

  // smart nudges from current state
  const nudges = [];
  if (stats.counts.ready > 0) nudges.push({ icon: 'send', color: '#A0700F', bg: '#FBE7BD', title: `${stats.counts.ready} piece${stats.counts.ready > 1 ? 's' : ''} ready to post`, body: 'Sitting in the “Ready to post” lane — share one on your next post day.', cta: 'Open content', go: () => onNav('content', 'ready') });
  if (stats.counts.scene > 0) nudges.push({ icon: 'scan', color: '#5E7A2B', bg: '#E6EBCD', title: `${stats.counts.scene} scene${stats.counts.scene > 1 ? 's' : ''} waiting to be drawn`, body: 'Scenes are defined — time to sketch, scan and caption.', cta: 'Open content', go: () => onNav('content', 'scene') });
  if (stats.counts.idea > 0) nudges.push({ icon: 'pen', color: '#246F8B', bg: '#DBEDF5', title: `${stats.counts.idea} idea${stats.counts.idea > 1 ? 's' : ''} need scenes`, body: 'Turn a raw idea into scenes to move it forward.', cta: 'Open content', go: () => onNav('content', 'idea') });
  if (stats.delta < 0) nudges.push({ icon: 'clock', color: '#9C641C', bg: '#F5E3C8', title: `${-stats.delta} post${-stats.delta > 1 ? 's' : ''} behind plan`, body: 'You’re aiming for 1 post a week. A quick draft today helps you catch up.', cta: 'Create content', go: onCreate });

  // weekly rhythm Mon..Sun
  const order = [1, 2, 3, 4, 5, 6, 0];
  const dayShort = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

  return (
    <div style={{ padding: '0 16px 96px' }}>
      <div style={{ padding: '4px 2px 14px' }}>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 22, color: '#3D3A33' }}>Today</div>
        <div style={{ fontFamily: 'Nunito', fontSize: 13, fontWeight: 700, color: '#A39A88' }}>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* today hero */}
      <div style={{ borderRadius: 22, overflow: 'hidden', marginBottom: 18, boxShadow: '0 8px 22px rgba(80,70,40,.1)' }}>
        <div style={{ background: tone.bg, padding: '20px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 30 }}>{task.emoji}</span>
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.7, color: tone.accent, background: '#ffffffaa', padding: '4px 10px', borderRadius: 999 }}>{task.tag}</span>
          </div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 24, color: tone.fg, lineHeight: 1.1 }}>{task.title}</div>
          <div style={{ fontFamily: 'Nunito', fontSize: 14, color: tone.fg, opacity: 0.85, lineHeight: 1.45, marginTop: 7 }}>{task.body}</div>
          <button onClick={task.action === 'ready' && dow === 0 ? () => onNav('content', 'ready') : onCreate} className="tc-press" style={{ marginTop: 15, border: 'none', background: tone.fg, color: '#fff', borderRadius: 13, padding: '12px 18px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {dow === 0 ? 'Pick a post to share' : 'Start now'} <window.Icon name="arrowRight" size={17} color="#fff" />
          </button>
        </div>
      </div>

      {/* smart nudges */}
      {nudges.length > 0 && (
        <>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12.5, letterSpacing: 0.5, textTransform: 'uppercase', color: '#A39A88', margin: '4px 2px 10px' }}>Needs your attention</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {nudges.map((n, i) => (
              <div key={i} onClick={n.go} className="tc-card tc-press" style={{ padding: 13, display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Icon name={n.icon} size={20} color={n.color} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 14.5, color: '#3D3A33', lineHeight: 1.2 }}>{n.title}</div>
                  <div style={{ fontFamily: 'Nunito', fontSize: 12.5, fontWeight: 600, color: '#8C8474', lineHeight: 1.35, marginTop: 2 }}>{n.body}</div>
                </div>
                <window.Icon name="next" size={17} color="#CFC7B5" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* weekly rhythm */}
      <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12.5, letterSpacing: 0.5, textTransform: 'uppercase', color: '#A39A88', margin: '4px 2px 10px' }}>Your weekly rhythm</div>
      <div className="tc-card" style={{ padding: '6px 0' }}>
        {order.map((d, i) => {
          const t = DT[d]; const tn = TC[t.tone]; const isToday = d === dow;
          return (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < order.length - 1 ? '1px solid #F4EFE5' : 'none', background: isToday ? '#F7F4EC' : 'transparent' }}>
              <div style={{ width: 38, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, color: isToday ? accent : '#7A7363' }}>{dayShort[d]}</div>
              </div>
              <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: tn.accent, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13.5, color: '#3D3A33', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span>{t.emoji}</span>{t.title}
                  {isToday && <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.4, color: '#fff', background: accent, padding: '2px 7px', borderRadius: 999 }}>Today</span>}
                </div>
                <div style={{ fontFamily: 'Nunito', fontSize: 11.5, fontWeight: 600, color: '#A39A88', marginTop: 1 }}>{t.tag}</div>
              </div>
            </div>
          );
        })}
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '12px 14px', margin: '4px 8px 8px', background: '#DBEDF5', borderRadius: 13 }}>
          <window.TinyCub size={34} mood="happy" />
          <div style={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 700, color: '#246F8B', lineHeight: 1.35 }}>1 post / week = 4–5 a month. Consistency is the whole game in Phase 1.</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Notifications });
