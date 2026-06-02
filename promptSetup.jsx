// promptSetup.jsx — Prompt Setup (Character DNA + Style DNA) & Character Library
const { useState: usePs } = React;

// ── shared controls ───────────────────────────────────────
const psInp = { width: '100%', boxSizing: 'border-box', border: '1.5px solid #EAE3D4', borderRadius: 13, padding: '12px 13px', fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: '#3D3A33', background: '#fff', outline: 'none' };

function PsField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 13, color: '#5C564A' }}>{label}</span>
        {hint && <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10.5, color: '#B4AC9A' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function PsInput({ value, onChange, placeholder, swatch }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {swatch && <span style={{ position: 'absolute', left: 12, width: 16, height: 16, borderRadius: 5, background: swatch, border: '1px solid rgba(0,0,0,.08)' }} />}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...psInp, paddingLeft: swatch ? 36 : 13 }} />
    </div>
  );
}

function PsChips({ options, selected, onToggle, accent, swatches }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map(o => {
        const on = selected.includes(o);
        const sw = swatches && window.COLOR_SWATCH[o];
        return (
          <button key={o} onClick={() => onToggle(o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: on ? 'none' : '1.5px solid #ECE6D9', cursor: 'pointer', borderRadius: 999, padding: '7px 12px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, background: on ? accent : '#fff', color: on ? '#fff' : '#8A8273' }}>
            {sw && <span style={{ width: 12, height: 12, borderRadius: '50%', background: sw, border: '1px solid rgba(0,0,0,.12)' }} />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

function PsSection({ icon, title, sub, color = '#2A8FB5', soft = '#DBEDF5' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '6px 0 14px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <window.Icon name={icon} size={20} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 16, color: '#3D3A33', lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontFamily: 'Nunito', fontSize: 11.5, fontWeight: 700, color: '#A39A88' }}>{sub}</div>
      </div>
    </div>
  );
}

function SaveBar({ dirty, saved, onSave, onReset, accent }) {
  return (
    <div style={{ display: 'flex', gap: 9, marginTop: 6 }}>
      <button onClick={onReset} className="tc-press" style={{ border: '1.5px solid #E3DCCD', background: '#fff', color: '#7A7363', borderRadius: 13, padding: '12px 15px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Reset</button>
      <button onClick={onSave} className="tc-press" style={{ flex: 1, border: 'none', background: saved ? '#C9842F' : accent, color: '#fff', borderRadius: 13, padding: '12px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        {saved ? <><window.Icon name="check" size={16} color="#fff" strokeWidth={3} /> Saved</> : 'Save'}
      </button>
    </div>
  );
}

// ── Prompt Setup: Character DNA + Style DNA ───────────────
function PromptSetup({ state, update, accent }) {
  const [tab, setTab] = usePs('character');
  return (
    <div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, background: '#F2EDE2', borderRadius: 13, padding: 4 }}>
        {[['character', 'Character DNA'], ['style', 'Style DNA']].map(([k, lb]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 10, padding: '9px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13.5, background: tab === k ? '#fff' : 'transparent', color: tab === k ? '#3D3A33' : '#8A8273', boxShadow: tab === k ? '0 1px 4px rgba(0,0,0,.07)' : 'none' }}>{lb}</button>
        ))}
      </div>
      {tab === 'character' ? <CharacterDNA state={state} update={update} accent={accent} /> : <StyleDNA state={state} update={update} accent={accent} />}
    </div>
  );
}

function CharacterDNA({ state, update, accent }) {
  const base = state.character || window.DEFAULT_CHARACTER;
  const [c, setC] = usePs(base);
  const [saved, setSaved] = usePs(false);
  const set = (k, v) => setC(p => ({ ...p, [k]: v }));
  const togglePers = (p) => setC(prev => ({ ...prev, personality: prev.personality.includes(p) ? prev.personality.filter(x => x !== p) : [...prev.personality, p] }));
  const save = () => { update(s => { s.character = c; return s; }); setSaved(true); setTimeout(() => setSaved(false), 1500); };

  return (
    <div>
      <PsSection icon="target" title="Global Character DNA" sub="Set once · locked into every prompt" color="#C9842F" soft="#F5E3C8" />
      <div style={{ display: 'flex', gap: 9, background: '#FBF3E6', borderRadius: 13, padding: '11px 13px', marginBottom: 16 }}>
        <span style={{ fontSize: 15 }}>🔒</span>
        <div style={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 600, color: '#8C6E4A', lineHeight: 1.45 }}>This is who TinyCub <b>always</b> is. You rarely need to touch it — it keeps the character identical every time.</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}><PsField label="Name"><PsInput value={c.name} onChange={v => set('name', v)} placeholder="TinyCub" /></PsField></div>
        <div style={{ width: 96 }}><PsField label="Age"><PsInput value={c.age} onChange={v => set('age', v)} placeholder="3-4" /></PsField></div>
      </div>
      <PsField label="Identity" hint="one line"><PsInput value={c.oneLiner} onChange={v => set('oneLiner', v)} placeholder="a tiny curious cub boy" /></PsField>
      <PsField label="Body & face"><textarea value={c.body} onChange={e => set('body', e.target.value)} rows={3} style={{ ...psInp, resize: 'none', lineHeight: 1.45 }} /></PsField>
      <PsField label="Hair"><PsInput value={c.hair} onChange={v => set('hair', v)} placeholder="Messy black bangs" /></PsField>
      <PsField label="Hat"><PsInput value={c.hat} onChange={v => set('hat', v)} swatch="#C98A5E" placeholder="Caramel bear hat" /></PsField>
      <PsField label="Shirt"><PsInput value={c.shirt} onChange={v => set('shirt', v)} swatch="#AEC2A0" placeholder="Sage green sleeveless shirt" /></PsField>
      <PsField label="Shorts"><PsInput value={c.shorts} onChange={v => set('shorts', v)} swatch="#F3E4D2" placeholder="Cream shorts" /></PsField>
      <PsField label="Backpack"><PsInput value={c.backpack} onChange={v => set('backpack', v)} swatch="#E3B23C" placeholder="Mustard yellow backpack" /></PsField>
      <PsField label="Personality"><PsChips options={window.PERSONALITY_OPTIONS} selected={c.personality} onToggle={togglePers} accent={accent} /></PsField>

      <div style={{ background: '#fff', border: '1px solid #F1ECE1', borderRadius: 14, padding: '12px 14px', margin: '4px 0 16px' }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 12.5, color: '#5C564A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><window.Icon name="flag" size={14} color="#B0A894" /> Character rules <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: '#B4AC9A' }}>(always on)</span></div>
        {window.CHARACTER_RULES.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '3px 0' }}>
            <window.Icon name="check" size={14} color="#C9842F" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Nunito', fontSize: 12.5, fontWeight: 600, color: '#7A7363', lineHeight: 1.35 }}>{r}</span>
          </div>
        ))}
      </div>
      <SaveBar saved={saved} onSave={save} onReset={() => setC(window.DEFAULT_CHARACTER)} accent={accent} />
    </div>
  );
}

function StyleDNA({ state, update, accent }) {
  const base = state.style || window.DEFAULT_STYLE;
  const [st, setSt] = usePs(base);
  const [saved, setSaved] = usePs(false);
  const toggle = (key, v) => setSt(p => ({ ...p, [key]: p[key].includes(v) ? p[key].filter(x => x !== v) : [...p[key], v] }));
  const save = () => { update(s => { s.style = st; return s; }); setSaved(true); setTimeout(() => setSaved(false), 1500); };

  const COLOR_ALL = Object.keys(window.COLOR_SWATCH);
  const RENDER_ALL = ['cozy storytelling illustration', 'soft atmosphere', 'dreamy mood', 'storybook composition', 'handcrafted feeling', 'gentle warmth', 'quiet stillness'];
  const NEG_ALL = ['anime', 'manga', 'pixar', '3d', 'cgi', 'photorealistic', 'vector art', 'sharp digital painting', 'neon', 'horror'];

  return (
    <div>
      <PsSection icon="pen" title="Global Style DNA" sub="Set once · the look & feel of every image" color="#5E7A2B" soft="#E6EBCD" />
      <PsField label="Art style" hint="one per line">
        <textarea value={st.artStyle.join('\n')} onChange={e => setSt(p => ({ ...p, artStyle: e.target.value.split('\n').filter(x => x.trim()) }))} rows={5} style={{ ...psInp, resize: 'none', lineHeight: 1.5 }} />
      </PsField>
      <PsField label="Color palette"><PsChips options={COLOR_ALL} selected={st.colors} onToggle={v => toggle('colors', v)} accent={accent} swatches /></PsField>
      <PsField label="Rendering feel"><PsChips options={RENDER_ALL} selected={st.rendering} onToggle={v => toggle('rendering', v)} accent={accent} /></PsField>
      <PsField label="Avoid (negative style)"><PsChips options={NEG_ALL} selected={st.negative} onToggle={v => toggle('negative', v)} accent="#C0796A" /></PsField>
      <SaveBar saved={saved} onSave={save} onReset={() => setSt(window.DEFAULT_STYLE)} accent={accent} />
    </div>
  );
}

// ── Character Library: same DNA, different outfit ─────────
function CharacterLibrary({ state, update, accent, onUse }) {
  const lib = state.library || window.DEFAULT_LIBRARY;
  const active = state.activeCharacter || 'classic';
  const setActive = (id) => update(s => { s.activeCharacter = id; return s; });

  return (
    <div>
      <PsSection icon="grid" title="Character Library" sub="Same TinyCub · different outfits" color="#2A8FB5" soft="#DBEDF5" />
      <div style={{ fontFamily: 'Nunito', fontSize: 12.5, fontWeight: 600, color: '#8C8474', lineHeight: 1.45, marginBottom: 16, padding: '0 2px' }}>
        Pick the look for your next scenes. Every version keeps TinyCub's face, age and silhouette — only the outfit changes.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {lib.map(ch => {
          const on = active === ch.id;
          return (
            <div key={ch.id} onClick={() => setActive(ch.id)} className="tc-press" style={{ cursor: 'pointer', borderRadius: 18, padding: 14, background: on ? `${accent}` : '#fff', border: on ? `2px solid ${accent}` : '2px solid #F0EADD', boxShadow: on ? `0 6px 16px ${accent}33` : '0 1px 3px rgba(80,70,40,.05)', position: 'relative' }}>
              {on && <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Icon name="check" size={14} color={accent} strokeWidth={3} /></div>}
              <div style={{ width: 56, height: 56, borderRadius: 16, background: on ? 'rgba(255,255,255,.22)' : '#F6F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 10 }}>{ch.emoji}</div>
              <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15.5, color: on ? '#fff' : '#3D3A33', lineHeight: 1.1 }}>{ch.name}</div>
              <div style={{ fontFamily: 'Nunito', fontSize: 11.5, fontWeight: 700, color: on ? 'rgba(255,255,255,.85)' : '#A39A88', marginTop: 2 }}>{ch.desc}</div>
              {ch.outfit && Object.keys(ch.outfit).length > 0 && (
                <div style={{ fontFamily: 'Nunito', fontSize: 11, fontWeight: 600, color: on ? 'rgba(255,255,255,.8)' : '#9A9284', marginTop: 8, lineHeight: 1.35 }}>
                  + {ch.outfit.extra || ch.outfit.shirt || ch.outfit.backpack}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={onUse} className="tc-press" style={{ width: '100%', marginTop: 16, border: 'none', background: accent, color: '#fff', borderRadius: 15, padding: '14px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 16px ${accent}44` }}>
        <window.Icon name="sparkles" size={18} color="#fff" fill="#fff" strokeWidth={0} /> Use in a scene
      </button>
    </div>
  );
}

Object.assign(window, { PromptSetup, CharacterLibrary, PsField, PsInput, PsChips, PsSection, psInp });
