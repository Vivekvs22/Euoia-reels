// The sprout: a pixel seedling in a terracotta pot. 13 × 20 square pixels (rows -3..16; feet = bottom of row 16).
// Leaves act as arms (droop / n / up / wave); eyes on the pot carry the acting; `grow` 0→1 unfurls a third leaf.
export const POT = '#C8643B';
const PAL = { P: POT, p: '#9C4826', R: '#DE8456', r: '#B8562F', d: '#5A3A28', E: '#2A1E18', s: '#3F7F2A', G: '#7DBE4E', g: '#4F9634', b: '#F09A8A', w: '#FFFFFF' };

// leaves + stem, rows 0..8 (13 columns, stem in column 6)
const LEAVES = {
  n: ['.............', '.......GGG...', '......sGGGG..', '......sgGG...', '..GGG.s......', '.GGGGgs......', '..GG..s......', '......s......', '......s......'],
  up: ['..G.......G..', '..GG.....GG..', '...GG...GG...', '...gGG.GGg...', '.....gsg.....', '......s......', '......s......', '......s......', '......s......'],
  wave: ['.........G...', '........GG...', '.......GGg...', '......sG.....', '..GGG.s......', '.GGGGgs......', '..GG..s......', '......s......', '......s......'],
  droop: ['.............', '.............', '......s......', '......sgG....', '.....gsGGG...', '....GGs.GGG..', '...GGGs..G...', '....G.s......', '......s......'],
};
const POTROWS = ['..ddddddddd..', '.RRRRRRRRRRR.', '.rrrrrrrrrrr.', '..PPPPPPPPP..', '..PPPPPPPPP..', '..PPPPPPPPP..', '...PPPPPPP...', '...ppppppp...'];   // rows 9..16
const EYES = {
  n: [[4, 13], [4, 14], [8, 13], [8, 14]], l: [[3, 13], [3, 14], [7, 13], [7, 14]], r: [[5, 13], [5, 14], [9, 13], [9, 14]],
  u: [[4, 12], [4, 13], [8, 12], [8, 13]], d: [[4, 14], [4, 15], [8, 14], [8, 15]], wide: [[4, 12], [4, 13], [4, 14], [8, 12], [8, 13], [8, 14]],
  blink: [[4, 14], [8, 14]], shut: [[3, 14], [4, 14], [5, 14], [7, 14], [8, 14], [9, 14]],
  happy: [[3, 14], [4, 13], [5, 14], [7, 14], [8, 13], [9, 14]],
};

export function grid({ eyes = 'n', leaves = 'n', grow = 0 } = {}) {
  const P = new Map(), put = (c, r, v) => P.set(c + ',' + r, v);
  (LEAVES[leaves] || LEAVES.n).forEach((row, r) => [...row].forEach((ch, c) => ch !== '.' && put(c, r, ch)));
  POTROWS.forEach((row, i) => [...row].forEach((ch, c) => ch !== '.' && put(c, 9 + i, ch)));
  // third leaf: the stem climbs, a bud, then a leaf unfurls to the upper left
  if (grow > .15) put(6, 1, 's');
  if (grow > .3) { put(6, 0, 's'); put(6, -1, 's'); }
  if (grow > .45) put(6, -2, 'G');
  if (grow > .6) { put(5, -2, 'G'); put(5, -1, 'g'); }
  if (grow > .75) { put(4, -2, 'G'); put(4, -3, 'G'); put(5, -3, 'G'); }
  if (grow > .9) { put(3, -3, 'G'); put(7, -2, 'g'); put(3, -2, 'G'); }
  for (const [c, r] of EYES[eyes] || EYES.n) put(c, r, 'E');
  if (eyes === 'happy') { put(2, 15, 'b'); put(10, 15, 'b'); }
  return [...P].map(([k, v]) => { const [c, r] = k.split(',').map(Number); return [c, r, v]; });
}

// x,y = middle of the pot's base (world coords); px = pixel size; sq>0 squash, <0 stretch; clipY: hide everything below this world y (peeking from behind)
export function sprite({ x, y, px = 6, flip = false, sq = 0, op = 1, clipY = null, shadow = 0, ...pose }) {
  const G = grid(pose); let s = '';
  for (let [c, r, v] of G) { if (flip) c = 12 - c; s += `<rect x="${c}" y="${r + 3}" width="1.04" height="1.04" fill="${PAL[v]}"/>`; }
  const sy = 1 - sq, sx = 1 + sq * .6, w = 13 * px * sx, h = 20 * px * sy, top = y - h;
  const clip = clipY != null ? `clip-path:inset(0 -20px ${Math.max(0, y - clipY) / h * 100}% -20px);` : '';
  const sh = shadow > 0 ? `<div style="position:absolute;left:${x - 4.5 * px}px;top:${y - px * .35}px;width:${9 * px}px;height:${px * .7}px;border-radius:50%;background:rgba(10,40,25,${.18 * shadow})"></div>` : '';
  return sh + `<svg class="px" viewBox="0 0 13 20" width="${w}" height="${h}" style="left:${x - w / 2}px;top:${top}px;opacity:${op};${clip}" shape-rendering="crispEdges" preserveAspectRatio="none">${s}</svg>`;
}

export function pixart(rows, { x, y, px = 6, pal, op = 1 }) {
  let s = ''; rows.forEach((row, r) => [...row].forEach((ch, c) => { if (pal[ch]) s += `<rect x="${c}" y="${r}" width="1.04" height="1.04" fill="${pal[ch]}"/>`; }));
  const W = rows[0].length, H = rows.length;
  return `<svg class="px" viewBox="0 0 ${W} ${H}" width="${W * px}" height="${H * px}" style="left:${x}px;top:${y}px;opacity:${op}" shape-rendering="crispEdges">${s}</svg>`;
}
export const SPARK = (x, y, px = 6, col = '#F2C14E', op = 1) => pixart(['..y..', '..y..', 'yy.yy', '..y..', '..y..'], { x: x - 2.5 * px, y: y - 2.5 * px, px, op, pal: { y: col } });
export const NOTE = (x, y, px = 5, op = 1) => pixart(['..kkk', '..k.k', '..k.k', 'kkk.k', 'kkkkk', '.kk..'], { x, y, px, op, pal: { k: '#0C3B2E' } });
export const SWEAT = (x, y, px = 5, op = 1) => pixart(['.b.', 'bbb', 'bbb', '.b.'], { x, y, px, op, pal: { b: '#9CC7E8' } });
export function dust(x, y, t, px = 5, n = 6, seed = 1, col = '#CBD5C0') {
  if (t <= 0 || t >= 1) return ''; let s = '';
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, k = (i >> 1) + 1, e = 1 - Math.pow(1 - t, 2);
    const dx = side * (14 + k * 12 + ((seed * 7 + i * 13) % 7)) * e, dy = -(6 + k * 4) * Math.sin(Math.PI * t * .9), sz = px * (1 - t * .7);
    s += `<div style="position:absolute;left:${x + dx - sz / 2}px;top:${y + dy - sz}px;width:${sz}px;height:${sz}px;background:${col};opacity:${1 - t}"></div>`;
  }
  return s;
}
