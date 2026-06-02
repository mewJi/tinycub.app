// mascot.jsx — TinyCub: a little kid in a caramel bear hat (matches brand art).
// Props: size, mood ('happy'|'sleepy'|'curious'|'wave'), bg (circle bg), magnify (bool)
function TinyCub({ size = 96, mood = 'happy', bg = null, magnify = false, style = {} }) {
  const caramel = '#C9842F';
  const caramelDark = '#9C6322';
  const ink = '#2B2722';
  const cream = '#F7EDD9';
  const glassRim = '#2E8FB0';
  const glassLens = '#BFE4F1';

  const eyes = {
    happy: <g>
      <circle cx="42" cy="63" r="2.8" fill={ink} /><circle cx="60" cy="63" r="2.8" fill={ink} />
    </g>,
    curious: <g>
      <circle cx="42" cy="63" r="2.9" fill={ink} /><circle cx="60" cy="63" r="2.4" fill={ink} />
    </g>,
    sleepy: <g>
      <path d="M38 63q4 3 8 0" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M56 63q4 3 8 0" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>,
    wave: <g>
      <circle cx="42" cy="63" r="2.8" fill={ink} /><circle cx="60" cy="63" r="2.8" fill={ink} />
    </g>,
  }[mood] || null;

  const mouth = {
    happy: <path d="M47 71q4 4 8 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />,
    wave: <path d="M47 71q4 4 8 0" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />,
    curious: <path d="M48 72q3 1.5 6 0" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />,
    sleepy: <path d="M49 72h4" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />,
  }[mood];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', ...style }}>
      {bg && <circle cx="50" cy="50" r="50" fill={bg} />}
      {/* kid side-ears peeking out */}
      <ellipse cx="22" cy="62" rx="5" ry="6.5" fill={cream} stroke={ink} strokeWidth="2.2" />
      <ellipse cx="78" cy="62" rx="5" ry="6.5" fill={cream} stroke={ink} strokeWidth="2.2" />
      {/* face */}
      <ellipse cx="50" cy="61" rx="26" ry="25" fill={cream} stroke={ink} strokeWidth="2.6" />
      {/* bear-hat ears */}
      <circle cx="30" cy="27" r="12" fill={caramel} stroke={ink} strokeWidth="2.6" />
      <circle cx="70" cy="27" r="12" fill={caramel} stroke={ink} strokeWidth="2.6" />
      <circle cx="30" cy="28" r="5" fill={caramelDark} />
      <circle cx="70" cy="28" r="5" fill={caramelDark} />
      {/* hat cap */}
      <path d="M19 53 C19 22 81 22 81 53 Q50 66 19 53 Z" fill={caramel} stroke={ink} strokeWidth="2.6" strokeLinejoin="round" />
      {/* brim underside */}
      <path d="M21 54 Q50 67 79 54 Q50 73 21 54 Z" fill={ink} opacity="0.9" />
      {/* bear snout dots on cap */}
      <ellipse cx="41" cy="48" rx="3" ry="3.4" fill={caramelDark} />
      <ellipse cx="59" cy="48" rx="3" ry="3.4" fill={caramelDark} />
      {eyes}
      {/* tiny nostrils */}
      {mood !== 'sleepy' && <g fill={ink} opacity="0.5"><circle cx="48.5" cy="68" r="0.9" /><circle cx="51.5" cy="68" r="0.9" /></g>}
      {mouth}
      {/* optional magnifying glass over the left eye */}
      {magnify && (
        <g>
          <line x1="33" y1="76" x2="27" y2="86" stroke={glassRim} strokeWidth="5" strokeLinecap="round" />
          <circle cx="42" cy="64" r="14" fill={glassLens} opacity="0.6" stroke={glassRim} strokeWidth="3.4" />
          <path d="M36 60q3 -4 8 -4" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.85" />
        </g>
      )}
    </svg>
  );
}

Object.assign(window, { TinyCub });
