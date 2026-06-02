// overview.jsx — Overview Tracker screen
const { useMemo: useMemoOv } = React;
const { STATUS: ST, STATUS_ORDER: SO, PHASES: PH, lastSunday: lastSun, WEEK: WK } = window;

function ProgressRing({ pct, size = 84, stroke = 9, color = '#2A8FB5', track = '#EAE4D6', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

function Card({ children, style = {}, onClick }) {
  return <div onClick={onClick} className="tc-card" style={style}>{children}</div>;
}
function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 2px 9px' }}>
      <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 12.5, letterSpacing: 0.5, textTransform: 'uppercase', color: '#A39A88' }}>{children}</div>
      {right}
    </div>
  );
}

function Overview({ state, update, stats, accent, heroStyle = 'ring', onNav, onOpenItem }) {
  const task = window.todayTask();
  const tone = window.TONE_COLOR[task.tone];
  const { phase, phaseIndex } = stats;

  // weekly posted map for streak strip (last 6 weeks, with dates)
  const weeks = useMemoOv(() => {
    const posted = new Set(state.items.filter(i => i.status === 'posted' && i.postedAt)
      .map(i => Math.floor(lastSun(i.postedAt).getTime() / WK)));
    const baseSun = lastSun(Date.now());
    const thisW = Math.floor(baseSun.getTime() / WK);
    const arr = [];
    for (let k = 5; k >= 0; k--) {
      const d = new Date(baseSun.getTime() - k * WK);
      arr.push({ idx: thisW - k, has: posted.has(thisW - k), isThis: k === 0, label: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) });
    }
    return arr;
  }, [state.items]);
  const postedThisWeek = weeks[weeks.length - 1].has;

  const onPlan = stats.delta >= 0;
  const deltaLabel = stats.delta === 0 ? 'Right on plan'
    : stats.delta > 0 ? `${stats.delta} post${stats.delta > 1 ? 's' : ''} ahead`
    : `${-stats.delta} post${-stats.delta < -1 ? 's' : ''} behind`;

  return (
    <div style={{ padding: '0 16px 28px' }}>
      {/* greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 2px 14px' }}>
        <window.TinyCub size={52} mood="wave" bg="#DBEDF5" />
        <div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 22, color: '#3D3A33', lineHeight: 1.1 }}>TinyCub</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#A39A88', whiteSpace: 'nowrap' }}>Month {stats.monthNum} · Week {stats.weeksElapsed}</div>
        </div>
      </div>

      {/* today's notification banner */}
      <Card onClick={() => onNav('notifications')} style={{ padding: 0, overflow: 'hidden', marginBottom: 14, cursor: 'pointer', border: `1.5px solid ${tone.accent}33` }}>
        <div style={{ display: 'flex', gap: 12, padding: 14, background: tone.bg }}>
          <div style={{ fontSize: 26, lineHeight: 1 }}>{task.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.6, color: tone.accent }}>Today · {task.tag}</span>
            </div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, color: tone.fg }}>{task.title}</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 12.5, color: tone.fg, opacity: 0.82, lineHeight: 1.35, marginTop: 2 }}>{task.body}</div>
          </div>
          <window.Icon name="next" size={18} color={tone.accent} style={{ alignSelf: 'center' }} />
        </div>
      </Card>

      {/* phase hero */}
      <SectionLabel>Where you are</SectionLabel>
      <Card style={{ marginBottom: 14, background: `linear-gradient(140deg, ${phase.soft} 0%, #ffffff 70%)` }}>
        {heroStyle === 'bar' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: phase.color, color: '#fff', padding: '3px 10px', borderRadius: 999, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 11.5 }}>
                <window.Icon name="flag" size={13} color="#fff" /> Phase {phase.n} of 3
              </div>
              <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 26, color: phase.color, lineHeight: 1 }}>{stats.phaseTimePct}<span style={{ fontSize: 15 }}>%</span></span>
            </div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 20, color: '#3D3A33', lineHeight: 1.1 }}>{phase.name}</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 12.5, color: '#8C8474', margin: '3px 0 12px', lineHeight: 1.35 }}>{phase.tagline}</div>
            <div style={{ height: 12, borderRadius: 999, background: '#EFEADF', overflow: 'hidden' }}>
              <div style={{ width: `${stats.phaseTimePct}%`, height: '100%', borderRadius: 999, background: phase.color, transition: 'width .7s cubic-bezier(.2,.7,.2,1)' }} />
            </div>
            <div style={{ fontFamily: 'Nunito', fontSize: 11, fontWeight: 700, color: '#A39A88', marginTop: 6 }}>Month {stats.monthInPhase} of {stats.phaseLenMonths} in this phase</div>
          </div>
        ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProgressRing pct={stats.phaseTimePct} color={phase.color} size={92} stroke={10}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 22, color: phase.color, lineHeight: 1 }}>{stats.phaseTimePct}%</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 9.5, fontWeight: 700, color: '#A39A88', textTransform: 'uppercase', letterSpacing: 0.4 }}>elapsed</div>
          </ProgressRing>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: phase.color, color: '#fff', padding: '3px 10px', borderRadius: 999, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 11.5, marginBottom: 6 }}>
              <window.Icon name="flag" size={13} color="#fff" /> Phase {phase.n} of 3
            </div>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 19, color: '#3D3A33', lineHeight: 1.1 }}>{phase.name}</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 12.5, color: '#8C8474', marginTop: 3, lineHeight: 1.35 }}>{phase.tagline}</div>
          </div>
        </div>
        )}
        {/* pacing row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <MiniStat label="Month in phase" value={`${stats.monthInPhase} / ${stats.phaseLenMonths}`} />
          <MiniStat label="Posts shipped" value={`${stats.postedCount} / ${stats.expected}`} />
          <MiniStat label="Pace" value={deltaLabel} color={onPlan ? '#5E7A2B' : '#9C641C'}
            bg={onPlan ? '#E6EBCD' : '#F5E3C8'} />
        </div>
      </Card>

      {/* content by status */}
      <SectionLabel right={<span onClick={() => onNav('content')} style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: accent, cursor: 'pointer' }}>See all →</span>}>Content pipeline</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 14 }}>
        {SO.map(k => {
          const s = ST[k];
          return (
            <Card key={k} onClick={() => onNav('content', k)} style={{ padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: s.fg }}>{stats.counts[k]}</span>
              </div>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 13.5, color: '#3D3A33' }}>{s.label}</div>
                <div style={{ fontFamily: 'Nunito', fontSize: 11, fontWeight: 700, color: '#B0A894' }}>{k === 'posted' ? 'live on socials' : 'in progress'}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* streak / consistency */}
      <SectionLabel>Posting streak</SectionLabel>
      <Card style={{ marginBottom: 14 }}>
        {/* headline + what it means */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FBE7BD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <window.Icon name="fire" size={28} color="#D98A1E" fill="#F6C667" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 30, color: '#A0700F', lineHeight: 1 }}>{stats.streak}</span>
              <span style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 15, color: '#5C564A' }}>week{stats.streak !== 1 ? 's' : ''} in a row</span>
            </div>
            <div style={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 600, color: '#A39A88', lineHeight: 1.35, marginTop: 3 }}>Post once a week (every Sunday) to keep the streak alive.</div>
          </div>
        </div>

        {/* this week status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', borderRadius: 13, marginTop: 13, background: postedThisWeek ? '#E6EBCD' : '#FBE7BD' }}>
          <window.Icon name={postedThisWeek ? 'check' : 'clock'} size={17} color={postedThisWeek ? '#5E7A2B' : '#A0700F'} strokeWidth={postedThisWeek ? 3 : 2} />
          <div style={{ flex: 1, fontFamily: 'Nunito', fontWeight: 800, fontSize: 12.5, color: postedThisWeek ? '#5E7A2B' : '#A0700F', lineHeight: 1.3 }}>
            {postedThisWeek ? 'This week: posted — nice, streak kept!' : 'This week: not posted yet — your post day is Sunday'}
          </div>
        </div>

        {/* last 6 weeks */}
        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, color: '#B4AC9A', margin: '16px 0 10px' }}>Last 6 weeks · ✓ = posted that week</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {weeks.map(w => (
            <div key={w.idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: w.has ? '#C9842F' : '#F0ECE3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: w.isThis ? '2px solid #ECA728' : '2px solid transparent' }}>
                {w.has ? <window.Icon name="check" size={16} color="#fff" strokeWidth={3} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CFC7B5' }} />}
              </div>
              <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 9.5, color: w.isThis ? '#A0700F' : '#B4AC9A' }}>{w.isThis ? 'This wk' : w.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* phase roadmap */}
      <SectionLabel>The plan</SectionLabel>
      <Card>
        {PH.map((p, i) => {
          const isCurrent = i === phaseIndex;
          const isPast = i < phaseIndex;
          return (
            <div key={p.key} style={{ display: 'flex', gap: 12, paddingBottom: i < PH.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isPast || isCurrent ? p.color : '#EEEAE0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, flexShrink: 0, boxShadow: isCurrent ? `0 0 0 4px ${p.soft}` : 'none' }}>
                  {isPast ? <window.Icon name="check" size={15} color="#fff" strokeWidth={3} /> : p.n}
                </div>
                {i < PH.length - 1 && <div style={{ width: 2, flex: 1, background: '#EEEAE0', marginTop: 4, minHeight: 18 }} />}
              </div>
              <div style={{ flex: 1, paddingTop: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: isCurrent ? '#3D3A33' : '#9A9284' }}>{p.name}</span>
                  {isCurrent && <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.5, color: p.color, background: p.soft, padding: '2px 7px', borderRadius: 999 }}>You are here</span>}
                </div>
                <div style={{ fontFamily: 'Nunito', fontSize: 11.5, fontWeight: 700, color: '#B0A894', marginBottom: 3 }}>Months {p.months}</div>
                <div style={{ fontFamily: 'Nunito', fontSize: 12.5, color: '#8C8474', lineHeight: 1.35 }}>{p.tagline}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function MiniStat({ label, value, color = '#3D3A33', bg = '#F6F2E9' }) {
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 14, padding: '9px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, color, lineHeight: 1.05 }}>{value}</div>
      <div style={{ fontFamily: 'Nunito', fontSize: 9.5, fontWeight: 700, color: '#A39A88', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { Overview, ProgressRing, Card, SectionLabel });
