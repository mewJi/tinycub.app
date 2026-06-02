// promptData.jsx — TinyCub prompt architecture: DNA layers, library, assembler

// ── Part 1: Global Character DNA (set once) ───────────────
const DEFAULT_CHARACTER = {
  name: 'TinyCub',
  oneLiner: 'a tiny curious cub boy',
  age: '3-4',
  body: 'oversized round head, tiny body, short limbs, soft rounded face, small dot eyes, tiny curved mouth, small round ears',
  hair: 'Messy black bangs',
  hat: 'Caramel bear hat with two rounded bear ears and a stitched bear face',
  shirt: 'Sage green sleeveless shirt',
  shorts: 'Cream shorts',
  backpack: 'Mustard yellow backpack',
  personality: ['curious', 'observant', 'gentle', 'quiet', 'wonder-filled', 'adventurous'],
};
const PERSONALITY_OPTIONS = ['curious', 'observant', 'gentle', 'quiet', 'wonder-filled', 'adventurous', 'playful', 'brave', 'shy', 'dreamy', 'kind', 'cheerful'];
const CHARACTER_RULES = [
  'Always preserve TinyCub identity',
  'Never redesign the character',
  'Never change age or facial proportions',
  'Never change hairstyle',
  'Never change clothing colors',
  'Never change the bear hat design',
  'Always maintain the same silhouette',
];

// ── Part 2: Global Style DNA (set once) ───────────────────
const DEFAULT_STYLE = {
  artStyle: ["Whimsical children's book illustration", 'Hand-drawn colored pencil and ink', 'Visible paper texture', 'Soft imperfect sketch lines', 'Slightly wobbly handmade outlines'],
  colors: ['warm cream', 'soft sage green', 'buttercream yellow', 'pale lavender', 'dusty blue', 'soft caramel brown'],
  rendering: ['cozy storytelling illustration', 'soft atmosphere', 'dreamy mood', 'storybook composition', 'handcrafted feeling'],
  negative: ['anime', 'manga', 'pixar', '3d', 'cgi', 'photorealistic', 'vector art', 'sharp digital painting'],
};
const COLOR_SWATCH = {
  'warm cream': '#F6ECD8', 'soft sage green': '#AEC2A0', 'buttercream yellow': '#F1DE9A',
  'pale lavender': '#D9CFE6', 'dusty blue': '#A9C0D0', 'soft caramel brown': '#C98A5E',
  'peach': '#F0B391', 'blush pink': '#EBB7B0', 'mint': '#B6D9C2', 'terracotta': '#C97B5A',
};

// ── Part 3: Scene Builder (changes each time) ─────────────
const DEFAULT_SCENE = {
  action: 'Playing with a kitty',
  environment: 'Wildflower meadow',
  mood: 'Dreamy',
  weather: 'Golden hour',
  camera: 'Wide shot',
};
const SCENE_OPTIONS = {
  action: ['Playing with a kitty', 'Chasing a butterfly', 'Reading under a tree', 'Splashing in puddles', 'Picking flowers', 'Watching the stars', 'Sharing a snack', 'Building a sandcastle'],
  environment: ['Wildflower meadow', 'Cozy bedroom', 'Quiet forest', 'Seaside beach', 'Rainy street', 'Small cafe', 'Snowy hill', 'Garden balcony'],
  mood: ['Dreamy', 'Peaceful', 'Joyful', 'Curious', 'Cozy', 'Playful', 'Nostalgic', 'Calm'],
  weather: ['Golden hour', 'Soft sunny', 'Gentle rain', 'Light snow', 'Overcast', 'Sunset glow', 'Starry night', 'Morning mist'],
  camera: ['Wide shot', 'Close-up', 'Medium shot', "Bird's-eye view", 'Low angle', 'Over-the-shoulder'],
};
const CAMERA_COMPOSITION = {
  'Wide shot': 'TinyCub appears small compared to the vast landscape',
  "Bird's-eye view": 'seen gently from above, TinyCub small within the scene',
  'Close-up': 'a tender close-up on TinyCub, soft focus background',
  'Medium shot': 'TinyCub framed from the knees up, balanced in the scene',
  'Low angle': 'a low, heroic angle that makes the little cub feel grand',
  'Over-the-shoulder': 'framed just behind TinyCub, sharing the little one\u2019s view',
};

// ── Part 4: Character Library (same DNA, different outfit) ─
const DEFAULT_LIBRARY = [
  { id: 'classic', name: 'Classic', emoji: '🐻', desc: 'The everyday TinyCub', outfit: {} },
  { id: 'explorer', name: 'Explorer', emoji: '🧭', desc: 'Ready for adventure', outfit: { backpack: 'Bigger mustard explorer backpack with a tiny compass', extra: 'small binoculars around the neck' } },
  { id: 'winter', name: 'Winter', emoji: '❄️', desc: 'Bundled up warm', outfit: { shirt: 'Chunky cream knit sweater', shorts: 'Sage green knit leggings', extra: 'soft caramel scarf and mittens' } },
  { id: 'rainy', name: 'Rainy Day', emoji: '🌧️', desc: 'Splash-ready', outfit: { extra: 'buttercream yellow raincoat and little rubber boots', backpack: 'tiny umbrella instead of backpack' } },
  { id: 'camping', name: 'Camping', emoji: '🏕️', desc: 'Out in the wild', outfit: { shirt: 'Sage green flannel shirt', extra: 'rolled sleeping mat on the backpack', backpack: 'mustard backpack with a tin cup clipped on' } },
  { id: 'astronaut', name: 'Astronaut', emoji: '🚀', desc: 'Off to the stars', outfit: { shirt: 'Cream puffy space suit with sage trim', extra: 'round bubble helmet (bear ears still visible on top)', backpack: 'small jetpack' } },
];

// ── Assemble the real backend prompt ──────────────────────
function assemblePrompt({ character, style, scene, override, activeOutfit, target }) {
  const c = character, ov = (override && override.enabled) ? override : null, of = activeOutfit || {};
  const pick = (key, base) => (ov && ov[key]) ? ov[key] : (of[key] || base);

  const hat = ov && ov.hat === 'None' ? 'no hat' : pick('hat', c.hat);
  const shirt = pick('shirt', c.shirt);
  const shorts = pick('shorts', c.shorts);
  const backpack = pick('backpack', c.backpack);
  const age = (ov && ov.age) ? ov.age : c.age + ' years old';
  const extra = [of.extra, ov && ov.accessory].filter(Boolean).join(', ');

  const charBlock = `[${c.name} Character DNA]
${c.name} is ${c.oneLiner}.
Appearance: ${age}, ${c.body}, ${c.hair.toLowerCase()}.
Outfit: ${hat}, ${shirt.toLowerCase()}, ${shorts.toLowerCase()}, ${backpack.toLowerCase()}${extra ? ', ' + extra : ''}.
Personality: ${c.personality.join(', ')}.
Rules: ${CHARACTER_RULES.join('; ').toLowerCase()}.`;

  const styleBlock = `[Style DNA]
${style.artStyle.join('. ')}.
Colors: ${style.colors.join(', ')}.
Rendering: ${style.rendering.join(', ')}.
Avoid: ${style.negative.join(', ')}.`;

  const comp = CAMERA_COMPOSITION[scene.camera] || '';
  const sceneBlock = `Scene:
${c.name} is ${scene.action.toLowerCase()}.
Environment: ${scene.environment}.
Weather: ${scene.weather}.
Mood: ${scene.mood}.
Camera: ${scene.camera}.${comp ? `\nComposition: ${comp}.` : ''}`;

  let prompt = `${charBlock}\n\n${styleBlock}\n\n${sceneBlock}`;
  if (target === 'midjourney') prompt += `\n\n--ar 1:1 --niji 6 --style expressive`;
  return prompt;
}

function defaultCaption(scene) {
  return `Little ${'TinyCub'} ${scene.action.toLowerCase()} 🌿`;
}

Object.assign(window, {
  DEFAULT_CHARACTER, PERSONALITY_OPTIONS, CHARACTER_RULES,
  DEFAULT_STYLE, COLOR_SWATCH, DEFAULT_SCENE, SCENE_OPTIONS, CAMERA_COMPOSITION,
  DEFAULT_LIBRARY, assemblePrompt, defaultCaption,
});
