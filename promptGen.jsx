// promptGen.jsx — Scene Builder + Final Prompt, layered on Character/Style DNA
const { useState: usePg, useRef: usePgRef } = React;

const TARGETS = [['midjourney', 'Midjourney'], ['chatgpt', 'ChatGPT image']];

function PromptGen({ state, update, accent }) {
  const [view, setView] = usePg('form'); // form | setup | library | history
  const [scene, setScene] = usePg(() => state.scene || window.DEFAULT_SCENE);
  const [override, setOverride] = usePg(() => state.override || { enabled: false, hat: '', accessory: '', age: '' });
  const [target, setTarget] = usePg('midjourney');
  const [loading, setLoading] = usePg(false);
  const [result, setResult] = usePg(null);
  const [copied, setCopied] = usePg(null);

  const character = state.character || window.DEFAULT_CHARACTER;
  const style = state.style || window.DEFAULT_STYLE;
  const library = state.library || window.DEFAULT_LIBRARY;
  const activeCh = library.find(c => c.id === (state.activeCharacter || 'classic')) || library[0];
  const historyCount = (state.promptHistory || []).length;

  const setSc = (k, v) => { const n = { ...scene, [k]: v }; setScene(n); update(s => { s.scene = n; return s; }); };
  const setOv = (k, v) => { const n = { ...override, [k]: v }; setOverride(n); update(s => { s.override = n; return s; }); };
  const copy = (text, key) => { navigator.clipboard && navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); };

  const generate = async () => {
    setLoading(true); setResult(null);
    const prompt = window.assemblePrompt({ character, style, scene, override, activeOutfit: activeCh.outfit, target });
    // deterministic prompt is the source of truth; AI just writes a caption
    let caption = window.defaultCaption(scene);
    let hashtags = ['#TinyCub', '#cubdiaries', '#handdrawn', '#childrensbook', '#cozyart'];
    try {
      if (window.claude && window.claude.complete) {
        const ask = `Write a warm, short Instagram caption (1-2 sentences, friendly, a little playful, may include 1 emoji) for an illustration of ${character.name} who is ${scene.action.toLowerCase()} in a ${scene.environment.toLowerCase()}, ${scene.mood.toLowerCase()} mood. Then 5-7 lowercase hashtags starting with #TinyCub.
Return ONLY minified JSON: {"caption":"...","hashtags":["#TinyCub", ...]}`;
        const raw = await window.claude.complete({ messages: [{ role: 'user', content: ask }] });
        let txt = String(raw).trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
        const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
        if (j.caption) caption = j.caption;
        if (Array.isArray(j.hashtags)) hashtags = j.hashtags;
      }
    } catch (e) { /* keep defaults */ }

    const res = { prompt, caption, hashtags, character: activeCh.name };
    setResult(res);
    update(s => {
      const cut = Date.now() - (window.TWO_MONTHS || 60 * 86400000);
      const entry = { ...res, scene: { ...scene }, target, character: activeCh.name, at: Date.now() };
      s.promptHistory = [entry, ...(s.promptHistory || [])].filter(h => (h.at || 0) >= cut);
      return s;
    });
    setLoading(false);
  };

  return (
    <div style={{ padding: '0 16px 96px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 2px 14px' }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#FBE7BD,#DBEDF5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Icon name="sparkles" size={24} color="#C2702E" fill="#C2702E" strokeWidth={0} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 19, color: '#3D3A33', lineHeight: 1.1 }}>Prompt Gen</div>
          <div style={{ fontFamily: 'Nunito', fontSize: 12.5, fontWeight: 600, color: '#A39A88' }}>Character-locked AI prompts, scene by scene</div>
        </div>
      </div>

      {/* menu tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['form', 'Scene', 'image'], ['setup', 'Setup', 'target'], ['library', 'Library', 'grid'], ['history', 'History', 'clock']].map(([k, lb, ic]) => (
          <button key={k} onClick={() => setView(k)} className="tc-press" style={{ flex: 1, position: 'relative', border: view === k ? 'none' : '1.5px solid #ECE6D9', cursor: 'pointer', borderRadius: 13, padding: '10px 4px', background: view === k ? '#3D3A33' : '#fff', color: view === k ? '#fff' : '#7A7363', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <window.Icon name={ic} size={18} color={view === k ? '#fff' : '#A39A88'} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10.5 }}>{lb}</span>
            {k === 'history' && historyCount > 0 && <span style={{ position: 'absolute', top: 5, right: 6, fontFamily: 'Nunito', fontWeight: 800, fontSize: 9, color: view === k ? '#3D3A33' : '#fff', background: view === k ? '#fff' : accent, borderRadius: 999, minWidth: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{historyCount}</span>}
          </button>
        ))}
      </div>

      {view === 'setup' && <window.PromptSetup state={state} update={update} accent={accent} />}
      {view === 'library' && <window.CharacterLibrary state={state} update={update} accent={accent} onUse={() => setView('form')} />}
      {view === 'history' && <HistoryView state={state} update={update} accent={accent} copy={copy} copied={copied} onUse={(h) => { if (h.scene) setScene(h.scene); if (h.target) setTarget(h.target); setResult({ prompt: h.prompt, caption: h.caption, hashtags: h.hashtags }); setView('form'); }} />}

      {view === 'form' && (
        <SceneBuilder
          scene={scene} setSc={setSc} override={override} setOv={setOv}
          target={target} setTarget={setTarget} activeCh={activeCh}
          loading={loading} result={result} copied={copied} copy={copy}
          generate={generate} accent={accent} onLibrary={() => setView('library')}
        />
      )}
    </div>
  );
}

// ── Scene Builder ─────────────────────────────────────────
function SceneBuilder({ scene, setSc, override, setOv, target, setTarget, activeCh, loading, result, copied, copy, generate, accent, onLibrary }) {
  const O = window.SCENE_OPTIONS;
  return (
    <div>
      {/* active character chip */}
      <div onClick={onLibrary} className="tc-press" style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1.5px solid #EFE9DD', borderRadius: 15, padding: '11px 13px', marginBottom: 16, cursor: 'pointer' }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F6F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{activeCh.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4, color: '#B0A894' }}>Active character</div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: '#3D3A33' }}>TinyCub · {activeCh.name}</div>
        </div>
        <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: accent }}>Change</span>
      </div>

      <PgPick label="Action" value={scene.action} options={O.action} onChange={v => setSc('action', v)} accent={accent} freeText />
      <PgPick label="Environment" value={scene.environment} options={O.environment} onChange={v => setSc('environment', v)} accent={accent} freeText />
      <PgPick label="Mood" value={scene.mood} options={O.mood} onChange={v => setSc('mood', v)} accent={accent} />
      <PgPick label="Weather / light" value={scene.weather} options={O.weather} onChange={v => setSc('weather', v)} accent={accent} />
      <PgPick label="Camera" value={scene.camera} options={O.camera} onChange={v => setSc('camera', v)} accent={accent} />

      {/* override (advanced) */}
      <OverridePanel override={override} setOv={setOv} accent={accent} />

      <PgField label="Generate for">
        <div style={{ display: 'flex', gap: 8 }}>
          {TARGETS.map(([k, lb]) => (
            <button key={k} onClick={() => setTarget(k)} style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 12, padding: '12px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, background: target === k ? '#3D3A33' : '#F2EDE2', color: target === k ? '#fff' : '#7A7363' }}>{lb}</button>
          ))}
        </div>
      </PgField>

      <button onClick={generate} disabled={loading} className="tc-press" style={{ width: '100%', marginTop: 6, border: 'none', background: loading ? '#D8D1C2' : accent, color: '#fff', borderRadius: 16, padding: '15px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: loading ? 'none' : `0 6px 16px ${accent}44` }}>
        {loading ? <><Spinner /> Building prompt…</> : <><window.Icon name="sparkles" size={20} color="#fff" fill="#fff" strokeWidth={0} /> Generate final prompt</>}
      </button>

      {result && (
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ResultCard title="Final prompt" subtitle={target === 'midjourney' ? 'Midjourney' : 'ChatGPT / DALL·E'} text={result.prompt} onCopy={() => copy(result.prompt, 'p')} copied={copied === 'p'} accent={accent} mono />
          <ResultCard title="Instagram caption" caption={result.caption} hashtags={result.hashtags} onCopy={() => copy(result.caption + '\n\n' + (result.hashtags || []).join(' '), 'c')} copied={copied === 'c'} accent={accent} />
        </div>
      )}
    </div>
  );
}

// pick = chips + optional free text input
function PgPick({ label, value, options, onChange, accent, freeText }) {
  return (
    <PgField label={label}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: freeText ? 9 : 0 }}>
        {options.map(o => {
          const on = value === o;
          return <button key={o} onClick={() => onChange(o)} style={{ border: on ? 'none' : '1.5px solid #ECE6D9', cursor: 'pointer', borderRadius: 999, padding: '8px 13px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12.5, background: on ? accent : '#fff', color: on ? '#fff' : '#8A8273' }}>{o}</button>;
        })}
      </div>
      {freeText && <input value={value} onChange={e => onChange(e.target.value)} placeholder={`or type your own ${label.toLowerCase()}…`} style={{ ...window.psInp }} />}
    </PgField>
  );
}

function OverridePanel({ override, setOv, accent }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #EFE9DD', borderRadius: 15, padding: '4px 14px 14px', marginBottom: 16 }}>
      <div onClick={() => setOv('enabled', !override.enabled)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', cursor: 'pointer' }}>
        <window.Icon name="edit" size={17} color="#2A8FB5" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: '#3D3A33' }}>Character override</div>
          <div style={{ fontFamily: 'Nunito', fontSize: 11.5, fontWeight: 700, color: '#A39A88' }}>Tweak the outfit for this one scene</div>
        </div>
        <div style={{ width: 44, height: 26, borderRadius: 999, background: override.enabled ? accent : '#E3DCCD', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 3, left: override.enabled ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
        </div>
      </div>
      {override.enabled && (
        <div style={{ paddingTop: 4 }}>
          <PgField label="Hat" hint="e.g. None"><input value={override.hat} onChange={e => setOv('hat', e.target.value)} placeholder="leave blank to keep bear hat" style={window.psInp} /></PgField>
          <PgField label="Accessory"><input value={override.accessory} onChange={e => setOv('accessory', e.target.value)} placeholder="e.g. raincoat, scarf" style={window.psInp} /></PgField>
          <div style={{ marginBottom: 2 }}><PgField label="Age" hint="e.g. baby version"><input value={override.age} onChange={e => setOv('age', e.target.value)} placeholder="leave blank to keep default age" style={window.psInp} /></PgField></div>
        </div>
      )}
    </div>
  );
}

// ── History ───────────────────────────────────────────────
function HistoryView({ state, update, accent, copy, copied, onUse }) {
  const hist = (state.promptHistory || []).slice().sort((a, b) => (b.at || 0) - (a.at || 0));
  const del = (at) => update(s => { s.promptHistory = (s.promptHistory || []).filter(h => h.at !== at); return s; });
  const clearAll = () => { if (confirm('Clear all prompt history?')) update(s => { s.promptHistory = []; return s; }); };
  if (hist.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '46px 20px', color: '#B0A894' }}>
        <window.TinyCub size={84} mood="sleepy" />
        <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 16, marginTop: 12, color: '#5C564A' }}>No history yet</div>
        <div style={{ fontFamily: 'Nunito', fontSize: 13, fontWeight: 600, marginTop: 3 }}>Generated prompts are saved here for 2 months.</div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px' }}>
        <div style={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 700, color: '#A39A88' }}>{hist.length} saved · kept 2 months</div>
        <button onClick={clearAll} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: '#C0796A' }}>Clear all</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {hist.map(h => {
          const ck = 'h' + h.at;
          const sceneLine = h.scene ? `${h.scene.action} · ${h.scene.environment}` : (h.elements || 'TinyCub scene');
          return (
            <div key={h.at} className="tc-card" style={{ padding: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, color: '#A39A88', background: '#F2EDE2', padding: '2px 8px', borderRadius: 999 }}>{h.target === 'midjourney' ? 'Midjourney' : 'ChatGPT'}</span>
                {h.character && <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10.5, color: '#8C8474' }}>{h.character}</span>}
                <span style={{ marginLeft: 'auto', fontFamily: 'Nunito', fontWeight: 700, fontSize: 10.5, color: '#C3BBA8' }}>{window.relTime(h.at)}</span>
              </div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 13.5, color: '#3D3A33', marginBottom: 6, lineHeight: 1.25 }}>{sceneLine}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11.5, color: '#7A7363', lineHeight: 1.45, maxHeight: 52, overflow: 'hidden' }}>{h.prompt}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
                <button onClick={() => copy(h.prompt, ck)} className="tc-press" style={{ flex: 1, border: 'none', cursor: 'pointer', background: copied === ck ? '#E6EBCD' : `${accent}15`, color: copied === ck ? '#5E7A2B' : accent, borderRadius: 11, padding: '9px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <window.Icon name={copied === ck ? 'check' : 'copy'} size={14} color={copied === ck ? '#5E7A2B' : accent} strokeWidth={copied === ck ? 3 : 2} />{copied === ck ? 'Copied' : 'Copy'}
                </button>
                <button onClick={() => onUse(h)} className="tc-press" style={{ border: '1.5px solid #E3DCCD', cursor: 'pointer', background: '#fff', color: '#7A7363', borderRadius: 11, padding: '9px 13px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12 }}>Reuse</button>
                <button onClick={() => del(h.at)} className="tc-press" style={{ border: 'none', cursor: 'pointer', background: '#F7EBE7', borderRadius: 11, padding: '9px 11px' }}><window.Icon name="trash" size={15} color="#C0796A" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── shared bits ───────────────────────────────────────────
function ResultCard({ title, subtitle, text, caption, hashtags, onCopy, copied, accent, mono }) {
  return (
    <div className="tc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 10px', borderBottom: '1px solid #F1ECE1' }}>
        <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14.5, color: '#3D3A33' }}>{title}</span>
        {subtitle && <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, color: '#A39A88', background: '#F2EDE2', padding: '2px 7px', borderRadius: 999 }}>{subtitle}</span>}
        <button onClick={onCopy} style={{ marginLeft: 'auto', border: 'none', cursor: 'pointer', background: copied ? '#E6EBCD' : `${accent}18`, color: copied ? '#5E7A2B' : accent, borderRadius: 10, padding: '7px 11px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          <window.Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? '#5E7A2B' : accent} strokeWidth={copied ? 3 : 2} />{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ padding: '12px 14px', fontFamily: mono ? 'ui-monospace, Menlo, monospace' : 'Nunito', fontWeight: mono ? 400 : 600, fontSize: mono ? 11.5 : 13.5, color: '#4A463D', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
        {caption !== undefined ? (
          <>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600 }}>{caption}</div>
            {hashtags && hashtags.length > 0 && <div style={{ marginTop: 8, color: accent }}>{hashtags.join(' ')}</div>}
          </>
        ) : text}
      </div>
    </div>
  );
}

function Spinner() {
  return <span style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'tcspin .7s linear infinite' }} />;
}
function PgField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 13, color: '#5C564A' }}>{label}</span>
        {hint && <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10.5, color: '#B4AC9A' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { PromptGen });
