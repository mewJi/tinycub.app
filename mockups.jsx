// mockups.jsx — realistic Instagram & Facebook post previews
const { useState: useStateMk } = React;

const HANDLE = 'tinycub.daily';
const DISPLAY = 'TinyCub';

// shared image canvas: uploaded ref image, or a cute placeholder scene
function PostCanvas({ item, ratio = '1 / 1' }) {
  const img = item && item.idea && item.idea.image;
  const scenes = (item && item.scenes) || [];
  if (img) {
    return (
      <div style={{ width: '100%', aspectRatio: ratio, background: '#000', overflow: 'hidden' }}>
        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: '100%', aspectRatio: ratio, position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(120% 100% at 50% 22%, #FBF3E6 0%, #F2E7D5 55%, #E9DBC4 100%)',
    }}>
      {/* soft scene blobs */}
      <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: '#DBEDF5', filter: 'blur(2px)', left: -30, bottom: -30, opacity: 0.8 }} />
      <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: '#FBE7BD', right: 18, top: 24, opacity: 0.85 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, textAlign: 'center' }}>
        <window.TinyCub size={104} mood="happy" />
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15, color: '#7A5E44', maxWidth: '90%', lineHeight: 1.2 }}>
          {item && item.title ? item.title : 'Your TinyCub scene'}
        </div>
        {scenes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', maxWidth: '94%' }}>
            {scenes.slice(0, 3).map(s => (
              <span key={s.id} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10.5, fontWeight: 700, color: '#9C7B59', background: 'rgba(255,255,255,0.6)', padding: '3px 8px', borderRadius: 999 }}>{s.text}</span>
            ))}
          </div>
        )}
        <span style={{ position: 'absolute', bottom: 8, fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(122,94,68,0.45)', letterSpacing: 0.4 }}>PLACEHOLDER ART</span>
      </div>
    </div>
  );
}

function CubAvatar({ size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#DBEDF5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <window.TinyCub size={size * 0.92} mood="happy" />
    </div>
  );
}

function captionParts(caption) {
  const text = caption || '';
  // split out hashtags for styling
  return text;
}

// ── Instagram ─────────────────────────────────────────────
function InstagramPost({ item }) {
  const caption = (item && item.caption) || '';
  return (
    <div style={{ background: '#fff', fontFamily: '-apple-system, system-ui, sans-serif', color: '#1a1a1a', width: '100%' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px' }}>
        <div style={{ padding: 2, borderRadius: '50%', background: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)' }}>
          <div style={{ padding: 1.5, borderRadius: '50%', background: '#fff' }}><CubAvatar size={30} /></div>
        </div>
        <div style={{ flex: 1, lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{HANDLE}</div>
          <div style={{ fontSize: 11, color: '#737373' }}>Original audio</div>
        </div>
        <window.Icon name="dots" size={18} color="#262626" />
      </div>
      <PostCanvas item={item} ratio="1 / 1" />
      {/* actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px 4px' }}>
        <window.Icon name="heart" size={24} color="#262626" />
        <window.Icon name="comment" size={23} color="#262626" />
        <window.Icon name="share" size={22} color="#262626" />
        <div style={{ flex: 1 }} />
        <window.Icon name="bookmark" size={23} color="#262626" />
      </div>
      <div style={{ padding: '0 12px 12px', fontSize: 13, lineHeight: 1.45 }}>
        <div style={{ fontWeight: 700, marginBottom: 3 }}>142 likes</div>
        <div style={{ wordBreak: 'break-word' }}>
          <span style={{ fontWeight: 700 }}>{HANDLE}</span>{' '}
          {caption ? renderCaption(caption) : <span style={{ color: '#bbb' }}>Write a caption…</span>}
        </div>
        <div style={{ color: '#737373', fontSize: 11, marginTop: 6 }}>View all 18 comments</div>
        <div style={{ color: '#a8a8a8', fontSize: 10, marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Just now</div>
      </div>
    </div>
  );
}

// ── Facebook ──────────────────────────────────────────────
function FacebookPost({ item }) {
  const caption = (item && item.caption) || '';
  return (
    <div style={{ background: '#fff', fontFamily: '-apple-system, system-ui, sans-serif', color: '#050505', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 12px 8px' }}>
        <CubAvatar size={40} />
        <div style={{ flex: 1, lineHeight: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{DISPLAY}</div>
          <div style={{ fontSize: 11.5, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
            Just now · <span style={{ fontSize: 12 }}>🌐</span>
          </div>
        </div>
        <window.Icon name="dots" size={18} color="#65676b" />
      </div>
      <div style={{ padding: '0 12px 10px', fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word' }}>
        {caption ? renderCaption(caption, '#1877F2') : <span style={{ color: '#bbb' }}>Write something about this post…</span>}
      </div>
      <PostCanvas item={item} ratio="4 / 5" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', fontSize: 12.5, color: '#65676b', borderBottom: '1px solid #e4e6eb' }}>
        <span>👍❤️ 86</span><span>18 comments · 4 shares</span>
      </div>
      <div style={{ display: 'flex', padding: '3px 8px' }}>
        {[['heart', 'Like'], ['comment', 'Comment'], ['share', 'Share']].map(([ic, lb]) => (
          <div key={lb} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 0', color: '#65676b', fontSize: 13.5, fontWeight: 700 }}>
            <window.Icon name={ic} size={19} color="#65676b" />{lb}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderCaption(caption, tagColor = '#00376b') {
  // color hashtags
  const parts = caption.split(/(\s+)/);
  return parts.map((p, i) =>
    p.startsWith('#')
      ? <span key={i} style={{ color: tagColor }}>{p}</span>
      : <span key={i}>{p}</span>
  );
}

Object.assign(window, { InstagramPost, FacebookPost, PostCanvas, CubAvatar });
