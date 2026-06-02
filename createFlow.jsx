// createFlow.jsx — the 3-step Draft → Scene → Preview flow
const { useState: useCf, useRef: useCfRef, useEffect: useCfE } = React;
const { STATUS: FS } = window;

const SCENE_HINTS = ['e.g. standing by a tree', 'e.g. laughing with a bug', 'e.g. reaching to touch a beetle', 'e.g. peeking from behind a leaf', 'e.g. tiny hands cupping a flower'];

const STEPS = [
  { n: 1, label: 'Draft idea', icon: 'pen' },
  { n: 2, label: 'Define scenes', icon: 'leaf' },
  { n: 3, label: 'Preview', icon: 'image' },
];

function newDraft() {
  const t = Date.now();
  return { id: 'c' + t, title: '', status: 'idea', idea: { text: '', image: null }, scenes: [], caption: '', kind: 'static', createdAt: t, updatedAt: t, postedAt: null };
}

function deriveStatus(d, submitted) {
  if (d.status === 'posted') return 'posted';
  if (submitted) return 'ready';
  if (d.status === 'ready') return 'ready';
  if (d.scenes.length > 0) return 'scene';
  return 'idea';
}

function CreateFlow({ initial, update, accent, onClose, defaultPlatform }) {
  const [draft, setDraft] = useCf(() => initial ? JSON.parse(JSON.stringify(initial)) : newDraft());
  const [step, setStep] = useCf(initial ? Math.min(3, (initial.scenes.length > 0 ? (initial.caption ? 3 : 2) : 1)) : 1);
  const [platform, setPlatform] = useCf((defaultPlatform || 'Instagram').toLowerCase());
  const [toast, setToast] = useCf(null);
  const fileRef = useCfRef();

  const set = (patch) => setDraft(d => ({ ...d, ...patch, updatedAt: Date.now() }));

  const persist = (submitted = false, close = false) => {
    const status = deriveStatus(draft, submitted);
    const final = { ...draft, status, updatedAt: Date.now(), postedAt: draft.postedAt };
    update(s => {
      const exists = s.items.some(i => i.id === final.id);
      s.items = exists ? s.items.map(i => i.id === final.id ? final : i) : [final, ...s.items];
      return s;
    });
    if (close) { onClose(); return; }
    setDraft(final);
    setToast(submitted ? 'Ready to post! 🎉' : 'Saved');
    setTimeout(() => setToast(null), 1600);
  };

  const onPick = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const url = await window.fileToDataURL(f);
    set({ idea: { ...draft.idea, image: url } });
  };

  const addScene = () => set({ scenes: [...draft.scenes, { id: 's' + Date.now(), text: '' }] });
  const updScene = (id, text) => set({ scenes: draft.scenes.map(s => s.id === id ? { ...s, text } : s) });
  const delScene = (id) => set({ scenes: draft.scenes.filter(s => s.id !== id) });

  const canNext1 = (draft.title.trim() || draft.idea.text.trim());
  const sceneCount = draft.scenes.filter(s => s.text.trim()).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
      {/* header */}
      <div style={{ paddingTop: 52, flexShrink: 0, background: '#fff', borderBottom: '1px solid #F1ECE1' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px 12px', gap: 10 }}>
          <button onClick={() => onClose()} style={{ border: 'none', background: '#F2EDE2', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <window.Icon name="x" size={20} color="#5C564A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 17, color: '#3D3A33' }}>{initial ? 'Edit content' : 'New content'}</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 700, color: '#A39A88' }}>Step {step} of 3 · {STEPS[step - 1].label}</div>
          </div>
          <window.StatusBadge status={deriveStatus(draft, false)} size="sm" />
        </div>
        {/* stepper */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 14px', gap: 6 }}>
          {STEPS.map((s, i) => {
            const active = step === s.n, done = step > s.n;
            return (
              <React.Fragment key={s.n}>
                <button onClick={() => { if (s.n < step || (s.n === 2 && canNext1) || s.n <= step) setStep(s.n); }} style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: active ? accent : done ? '#C9842F' : '#EAE4D6', color: active || done ? '#fff' : '#A39A88', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done ? <window.Icon name="check" size={15} color="#fff" strokeWidth={3} /> : <window.Icon name={s.icon} size={15} color={active ? '#fff' : '#A39A88'} />}
                  </div>
                  {active && <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 12.5, color: accent }}>{s.label}</span>}
                </button>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.n ? '#C9842F' : '#EAE4D6', borderRadius: 2 }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 20px' }}>
        {step === 1 && (
          <Step1 draft={draft} set={set} fileRef={fileRef} onPick={onPick} accent={accent} />
        )}
        {step === 2 && (
          <Step2 draft={draft} addScene={addScene} updScene={updScene} delScene={delScene} accent={accent} />
        )}
        {step === 3 && (
          <Step3 draft={draft} set={set} platform={platform} setPlatform={setPlatform} accent={accent} />
        )}
      </div>

      {/* footer actions */}
      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid #F1ECE1', padding: '12px 16px 28px', display: 'flex', gap: 10 }}>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="tc-press" style={{ border: '1.5px solid #E3DCCD', background: '#fff', color: '#7A7363', borderRadius: 14, padding: '14px 18px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Back</button>
        )}
        <button onClick={() => persist(false, true)} className="tc-press" style={{ border: '1.5px solid #E3DCCD', background: '#fff', color: '#7A7363', borderRadius: 14, padding: '14px 16px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Save</button>
        <div style={{ flex: 1 }} />
        {step < 3 ? (
          <button disabled={step === 1 && !canNext1} onClick={() => { persist(false); setStep(step + 1); }} className="tc-press" style={{ border: 'none', background: (step === 1 && !canNext1) ? '#D8D1C2' : accent, color: '#fff', borderRadius: 14, padding: '14px 22px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, cursor: (step === 1 && !canNext1) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            Next <window.Icon name="next" size={17} color="#fff" strokeWidth={2.5} />
          </button>
        ) : (
          <button onClick={() => persist(true, true)} className="tc-press" style={{ border: 'none', background: '#C9842F', color: '#fff', borderRadius: 14, padding: '14px 22px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 6px 16px rgba(201,132,47,.4)' }}>
            <window.Icon name="check" size={18} color="#fff" strokeWidth={3} /> Submit
          </button>
        )}
      </div>

      {toast && (
        <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', background: '#3D3A33', color: '#fff', padding: '10px 18px', borderRadius: 999, fontFamily: 'Fredoka', fontWeight: 500, fontSize: 14, zIndex: 80, boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}>{toast}</div>
      )}
    </div>
  );
}

// ── Step 1 ────────────────────────────────────────────────
function Step1({ draft, set, fileRef, onPick, accent }) {
  return (
    <div>
      <Lead title="Capture the idea" body="Jot down a moment from Tawan's day. Type it out, or upload a reference photo / sketch to draw from." />
      <Field label="Title">
        <input value={draft.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Stomping in tiny puddles"
          style={inp} />
      </Field>
      <Field label="The idea">
        <textarea value={draft.idea.text} onChange={e => set({ idea: { ...draft.idea, text: e.target.value } })} placeholder="What happened? What made it sweet or funny? Just 1–2 lines is plenty."
          rows={4} style={{ ...inp, resize: 'none', lineHeight: 1.45 }} />
      </Field>
      <Field label="Reference photo / sketch (optional)">
        {draft.idea.image ? (
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
            <img src={draft.idea.image} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => set({ idea: { ...draft.idea, image: null } })} style={{ position: 'absolute', top: 10, right: 10, border: 'none', background: 'rgba(0,0,0,.55)', color: '#fff', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><window.Icon name="trash" size={17} color="#fff" /></button>
          </div>
        ) : (
          <button onClick={() => fileRef.current.click()} className="tc-press" style={{ width: '100%', border: '2px dashed #D8CFBC', background: '#F7F4EC', borderRadius: 16, padding: '26px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: '#DBEDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Icon name="upload" size={22} color="#2A8FB5" /></div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 14, color: '#5C564A' }}>Upload a reference</div>
            <div style={{ fontFamily: 'Nunito', fontSize: 12, fontWeight: 600, color: '#A39A88' }}>photo or sketch · stays private</div>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
      </Field>
    </div>
  );
}

// ── Step 2 ────────────────────────────────────────────────
function Step2({ draft, addScene, updScene, delScene, accent }) {
  return (
    <div>
      <Lead title="Break it into scenes" body="Add as many scenes as you like — each one is a little beat in the drawing. Free text, no rules." />
      {draft.idea.text && (
        <div style={{ background: '#fff', border: '1px solid #F1ECE1', borderRadius: 14, padding: '11px 13px', marginBottom: 16, display: 'flex', gap: 9 }}>
          <window.Icon name="pen" size={16} color="#B0A894" style={{ marginTop: 2 }} />
          <div style={{ fontFamily: 'Nunito', fontSize: 13, color: '#7A7363', lineHeight: 1.4, fontStyle: 'italic' }}>{draft.idea.text}</div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {draft.scenes.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, border: '1px solid #F1ECE1', padding: '6px 6px 6px 12px' }}>
            <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, color: '#fff', background: '#8DA84B', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <input value={s.text} onChange={e => updScene(s.id, e.target.value)} placeholder={SCENE_HINTS[i % SCENE_HINTS.length]} autoFocus={!s.text}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: '#3D3A33', padding: '8px 0' }} />
            <button onClick={() => delScene(s.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8, flexShrink: 0 }}><window.Icon name="trash" size={17} color="#C3BBA8" /></button>
          </div>
        ))}
      </div>
      <button onClick={addScene} className="tc-press" style={{ width: '100%', marginTop: 12, border: `1.5px dashed ${accent}88`, background: `${accent}11`, color: accent, borderRadius: 14, padding: '14px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <window.Icon name="plus" size={18} color={accent} strokeWidth={2.5} /> Add scene
      </button>
      {draft.scenes.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 18, fontFamily: 'Nunito', fontSize: 13, fontWeight: 600, color: '#B0A894' }}>Add your first scene to mark this as <b style={{ color: '#5E7A2B' }}>Scene created</b>.</div>
      )}
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────
function Step3({ draft, set, platform, setPlatform, accent }) {
  return (
    <div>
      <Lead title="Preview & caption" body="See exactly how this lands on the feed, then write the caption. Submit when it's ready to post." />
      <Field label="Caption">
        <textarea value={draft.caption} onChange={e => set({ caption: e.target.value })} placeholder="Write a warm, short caption… add a few #hashtags too."
          rows={3} style={{ ...inp, resize: 'none', lineHeight: 1.45 }} />
      </Field>
      <div style={{ display: 'flex', gap: 7, margin: '4px 0 14px' }}>
        {[['instagram', 'Instagram'], ['facebook', 'Facebook']].map(([k, lb]) => (
          <button key={k} onClick={() => setPlatform(k)} style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 12, padding: '11px', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, background: platform === k ? '#3D3A33' : '#F2EDE2', color: platform === k ? '#fff' : '#7A7363' }}>{lb}</button>
        ))}
      </div>
      <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 18px rgba(80,70,40,.12)', border: '1px solid #EFE9DD' }}>
        {platform === 'instagram' ? <window.InstagramPost item={draft} /> : <window.FacebookPost item={draft} />}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, background: '#fff', borderRadius: 12, padding: '10px 12px' }}>
        <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12.5, color: '#7A7363' }}>Format</span>
        {[['static', 'Static'], ['reel', 'Reel']].map(([k, lb]) => (
          <button key={k} onClick={() => set({ kind: k })} style={{ border: 'none', cursor: 'pointer', borderRadius: 999, padding: '6px 13px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, background: draft.kind === k ? '#E1EDD8' : '#F2EDE2', color: draft.kind === k ? '#2E8A5F' : '#A39A88' }}>{lb}</button>
        ))}
      </div>
    </div>
  );
}

// ── small bits ────────────────────────────────────────────
const inp = { width: '100%', boxSizing: 'border-box', border: '1.5px solid #EAE3D4', borderRadius: 14, padding: '13px 14px', fontFamily: 'Nunito', fontWeight: 600, fontSize: 14.5, color: '#3D3A33', background: '#fff', outline: 'none' };
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 500, fontSize: 13, color: '#7A7363', marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}
function Lead({ title, body }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 20, color: '#3D3A33', lineHeight: 1.15 }}>{title}</div>
      <div style={{ fontFamily: 'Nunito', fontSize: 13.5, color: '#8C8474', lineHeight: 1.45, marginTop: 5 }}>{body}</div>
    </div>
  );
}

Object.assign(window, { CreateFlow });
