// app.jsx — TinyCub shell: tabs, routing, create FAB, tweaks, scaling stage
const { useState: useA, useEffect: useAE, useMemo: useAM } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2A8FB5",
  "heroStyle": "ring",
  "contentView": "cards",
  "previewPlatform": "Instagram"
}/*EDITMODE-END*/;

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'home' },
  { key: 'content', label: 'Content', icon: 'grid' },
  { key: 'prompt', label: 'Prompt', icon: 'sparkles' },
  { key: 'notifications', label: 'Alerts', icon: 'bell' },
];

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [state, update, reset] = window.useStore();
  const [tab, setTab] = useA('overview');
  const [filter, setFilter] = useA(null);
  const [flow, setFlow] = useA(null); // null | {item} | 'new'
  const [allOpen, setAllOpen] = useA(false);
  const stats = useAM(() => window.computeStats(state), [state]);
  const accent = t.accent || '#2A8FB5';

  const goContent = (f = null) => { setFilter(f); setTab('content'); };
  const openCreate = () => setFlow({ item: null });
  const openItem = (item) => setFlow({ item });

  const hasNudges = stats.counts.ready > 0 || stats.counts.scene > 0 || stats.counts.idea > 0 || stats.delta < 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      {allOpen && <window.AllContent state={state} update={update} accent={accent} onClose={() => setAllOpen(false)} onOpen={(it) => { setAllOpen(false); openItem(it); }} />}
      {flow ? (
        <window.CreateFlow initial={flow.item} update={update} accent={accent} onClose={() => setFlow(null)} defaultPlatform={t.previewPlatform} />
      ) : (
        <>
          <div className="tc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 54 }}>
            {tab === 'overview' && <window.Overview state={state} update={update} stats={stats} accent={accent} heroStyle={t.heroStyle} onNav={(s, f) => s === 'content' ? goContent(f) : setTab(s)} onOpenItem={openItem} />}
            {tab === 'content' && <window.ContentList state={state} update={update} view={t.contentView} filter={filter} setFilter={setFilter} accent={accent} onCreate={openCreate} onOpen={openItem} onOpenAll={() => setAllOpen(true)} />}
            {tab === 'prompt' && <window.PromptGen state={state} update={update} accent={accent} />}
            {tab === 'notifications' && <window.Notifications state={state} stats={stats} accent={accent} onNav={(s, f) => s === 'content' ? goContent(f) : setTab(s)} onCreate={openCreate} />}
          </div>

          {/* bottom tab bar */}
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 40, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderTop: '1px solid #F0EADD', paddingBottom: 26, paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'relative' }}>
              {TABS.slice(0, 2).map(tb => <TabBtn key={tb.key} tb={tb} active={tab === tb.key} accent={accent} onClick={() => setTab(tb.key)} />)}
              <div style={{ width: 64, flexShrink: 0 }} />
              {TABS.slice(2).map(tb => <TabBtn key={tb.key} tb={tb} active={tab === tb.key} accent={accent} dot={tb.key === 'notifications' && hasNudges} onClick={() => setTab(tb.key)} />)}
            </div>
            {/* center create FAB */}
            <button onClick={openCreate} className="tc-press" style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', width: 58, height: 58, borderRadius: '50%', border: '4px solid #FFFFFF', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 8px 20px ${accent}55` }}>
              <window.Icon name="plus" size={28} color="#fff" strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}

      {/* Tweaks */}
      <window.TweaksPanel>
        <window.TweakSection label="Brand color" />
        <window.TweakColor label="Accent" value={t.accent} options={['#2A8FB5', '#C9842F', '#ECA728', '#7E9A3E']} onChange={v => setTweak('accent', v)} />
        <window.TweakSection label="Overview" />
        <window.TweakRadio label="Phase progress" value={t.heroStyle} options={['ring', 'bar']} onChange={v => setTweak('heroStyle', v)} />
        <window.TweakSection label="Content list" />
        <window.TweakRadio label="View" value={t.contentView} options={['cards', 'kanban', 'list']} onChange={v => setTweak('contentView', v)} />
        <window.TweakSection label="Post preview" />
        <window.TweakRadio label="Default" value={t.previewPlatform} options={['Instagram', 'Facebook']} onChange={v => setTweak('previewPlatform', v)} />
        <window.TweakSection label="Data" />
        <window.TweakButton label="Reset demo data" onClick={() => { if (confirm('Reset all content & progress to the demo seed?')) reset(); }} />
      </window.TweaksPanel>
    </div>
  );
}

function TabBtn({ tb, active, accent, onClick, dot }) {
  return (
    <button onClick={onClick} style={{ flex: 1, border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '2px 0', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <window.Icon name={tb.icon} size={24} color={active ? accent : '#B3AB99'} strokeWidth={active ? 2.4 : 2} fill={active ? `${accent}22` : 'none'} />
        {dot && <span style={{ position: 'absolute', top: -2, right: -3, width: 9, height: 9, borderRadius: '50%', background: '#ECA728', border: '2px solid #fff' }} />}
      </div>
      <span style={{ fontFamily: 'Nunito', fontWeight: active ? 800 : 700, fontSize: 10.5, color: active ? accent : '#B3AB99' }}>{tb.label}</span>
    </button>
  );
}

// ── Scaling stage: fit the phone to the viewport ──────────
function Stage() {
  return <App />;
}

ReactDOM.createRoot(
  document.getElementById('root')
).render(<Stage />);

ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);
