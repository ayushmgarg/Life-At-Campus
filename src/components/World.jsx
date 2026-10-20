/**
 * The campus. Everything here is drawn as SVG - buildings, trees, roads,
 * vehicles, stray dogs and ambient students - so it scales cleanly and every
 * piece can be animated.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { WORLD, ROAD_NODES } from '../game/config.js';
import { visibleLocations, locById } from '../game/engine.js';
import { useGame } from '../game/store.js';
import Character, { AVATARS, NPC } from './Character.jsx';

/* ------------------------------------------------------------------ */
/* scenery pieces                                                      */
/* ------------------------------------------------------------------ */

function Building({ loc, lit, onClick, active }) {
  const { x, y, w, h, color, roof, name, icon } = loc;
  const left = x - w / 2;
  const top = y - h / 2;
  const windows = [];
  const cols = Math.max(2, Math.floor(w / 52));
  const rows = Math.max(1, Math.floor(h / 55));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = left + 18 + c * ((w - 36) / cols);
      const wy = top + 34 + r * ((h - 40) / rows);
      windows.push(
        <rect
          key={`${r}-${c}`} x={wx} y={wy} width={Math.min(26, (w - 36) / cols - 8)} height="20" rx="3"
          fill={lit ? '#ffd98a' : '#cfd8e6'} opacity={lit ? 0.92 : 0.75}
          className={lit ? 'win-lit' : undefined}
          style={lit ? { animationDelay: `${(r * cols + c) * 0.7}s` } : undefined}
        />,
      );
    }
  }
  return (
    <g className={`building ${active ? 'is-active' : ''}`} onClick={onClick}>
      <ellipse cx={x} cy={top + h + 6} rx={w / 2 + 6} ry="12" fill="#00000016" />
      <rect x={left} y={top} width={w} height={h} rx="10" fill={color} stroke="#00000018" />
      {roof && <rect x={left - 7} y={top - 14} width={w + 14} height="22" rx="7" fill={roof} />}
      {windows}
      <rect x={x - 22} y={top + h - 26} width="44" height="26" rx="4" fill="#00000026" />
      <rect x={x - 18} y={top + h - 22} width="36" height="22" rx="3" fill={roof || '#8a9a86'} opacity="0.85" />
      <g className="sign" transform={`translate(${x}, ${top - (roof ? 26 : 12)})`}>
        <rect x={-(name.length * 3.6 + 22)} y="-16" width={name.length * 7.2 + 44} height="24" rx="12" fill="#ffffffe8" stroke="#00000014" />
        <text x="-6" y="1" textAnchor="end" fontSize="14">{icon}</text>
        <text x="2" y="1" fontSize="12.5" fontWeight="700" fill="#2b3444">{name}</text>
      </g>
    </g>
  );
}

function OpenPlace({ loc, onClick, active, children }) {
  const { x, y, w, h, color, name, icon } = loc;
  return (
    <g className={`building open-place ${active ? 'is-active' : ''}`} onClick={onClick}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="26" fill={color} stroke="#00000014" />
      {children}
      <g className="sign" transform={`translate(${x}, ${y - h / 2 - 8})`}>
        <rect x={-(name.length * 3.6 + 22)} y="-16" width={name.length * 7.2 + 44} height="24" rx="12" fill="#ffffffe8" stroke="#00000014" />
        <text x="-6" y="1" textAnchor="end" fontSize="14">{icon}</text>
        <text x="2" y="1" fontSize="12.5" fontWeight="700" fill="#2b3444">{name}</text>
      </g>
    </g>
  );
}

const Tree = ({ x, y, s = 1, tone = 0 }) => (
  <g className="tree" transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx="0" cy="10" rx="18" ry="6" fill="#00000014" />
    <rect x="-4" y="-10" width="8" height="22" rx="3" fill="#7d5a3c" />
    <circle cx="0" cy="-24" r="22" fill={['#5f9e58', '#6cae63', '#53914f'][tone % 3]} />
    <circle cx="-14" cy="-14" r="14" fill={['#558f50', '#64a25c', '#4b8347'][tone % 3]} />
    <circle cx="14" cy="-15" r="13" fill={['#6aa863', '#74b16b', '#5d9a56'][tone % 3]} />
  </g>
);

const Lamp = ({ x, y, on }) => (
  <g transform={`translate(${x},${y})`}>
    {on && <circle cx="0" cy="-6" r="56" fill="url(#lampGlow)" className="lamp-glow" />}
    <rect x="-2" y="-34" width="4" height="36" rx="2" fill="#4d5566" />
    <circle cx="0" cy="-36" r="6" fill={on ? '#ffdf9b' : '#9aa3b2'} />
  </g>
);

const Bench = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-18" y="-4" width="36" height="7" rx="3" fill="#9a6f46" />
    <rect x="-18" y="-12" width="36" height="5" rx="2.5" fill="#ab7d50" />
    <rect x="-15" y="3" width="4" height="8" rx="2" fill="#6f5436" />
    <rect x="11" y="3" width="4" height="8" rx="2" fill="#6f5436" />
  </g>
);

const Car = ({ color, flip }) => (
  <g transform={`scale(${flip ? -1 : 1},1)`}>
    <ellipse cx="0" cy="13" rx="26" ry="6" fill="#00000018" />
    <rect x="-26" y="-8" width="52" height="20" rx="8" fill={color} />
    <rect x="-13" y="-16" width="27" height="14" rx="6" fill={color} />
    <rect x="-10" y="-14" width="21" height="10" rx="4" fill="#cfe4f2" opacity="0.9" />
    <circle cx="-15" cy="13" r="5.5" fill="#2a2d33" />
    <circle cx="15" cy="13" r="5.5" fill="#2a2d33" />
  </g>
);

const Dog = ({ tone = '#c89a63' }) => (
  <g className="stray">
    <ellipse cx="0" cy="8" rx="13" ry="4" fill="#00000014" />
    <ellipse cx="0" cy="0" rx="12" ry="7" fill={tone} />
    <circle cx="10" cy="-6" r="6" fill={tone} />
    <path d="M6 -11 l3 -5 l3 5z" fill="#00000022" />
    <circle cx="12.5" cy="-7" r="1.2" fill="#2b2118" />
    <path className="tail" d="M-11 -2 q-8 -5 -5 -10" stroke={tone} strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="-8" y="5" width="3" height="6" rx="1.5" fill="#00000022" />
    <rect x="6" y="5" width="3" height="6" rx="1.5" fill="#00000022" />
  </g>
);

/* ------------------------------------------------------------------ */
/* ambient life                                                        */
/* ------------------------------------------------------------------ */

function useWanderers(count, seedPaths) {
  const refs = useRef([]);
  const data = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const route = seedPaths[i % seedPaths.length];
        return {
          route, t: Math.random(), speed: 0.018 + Math.random() * 0.022,
          avatar: AVATARS[(i * 2 + 1) % AVATARS.length], dir: 1,
        };
      }),
    [count, seedPaths],
  );

  useEffect(() => {
    let raf; let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      data.forEach((d, i) => {
        d.t += d.speed * dt * d.dir;
        if (d.t > 1) { d.t = 1; d.dir = -1; } else if (d.t < 0) { d.t = 0; d.dir = 1; }
        const seg = d.route;
        const n = seg.length - 1;
        const f = d.t * n;
        const i0 = Math.min(n - 1, Math.floor(f));
        const local = f - i0;
        const a = seg[i0]; const b = seg[i0 + 1];
        const x = a.x + (b.x - a.x) * local;
        const y = a.y + (b.y - a.y) * local;
        const facing = (b.x - a.x) * d.dir >= 0 ? 1 : -1;
        const el = refs.current[i];
        if (el) {
          el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
          el.dataset.facing = facing;
          const inner = el.firstChild;
          if (inner) inner.setAttribute('transform', `scale(${facing},1)`);
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [data]);

  return { data, refs };
}

/* ------------------------------------------------------------------ */

const VIEW = { w: 1180, h: 738 }; // camera window into the world

const skyFor = (t) => {
  const h = (t % 1440) / 60;
  if (h < 5.3) return { fill: '#101a3c', op: 0.46, night: true };
  if (h < 6.6) return { fill: '#e8935f', op: 0.2, night: true };   // first light
  if (h < 8) return { fill: '#f7c479', op: 0.14, night: false };   // morning
  if (h < 16.3) return { fill: '#fff6dd', op: 0.05, night: false };
  if (h < 18.3) return { fill: '#f0924e', op: 0.2, night: false };  // golden hour
  if (h < 19.6) return { fill: '#6a5392', op: 0.3, night: true };   // dusk
  return { fill: '#101a3c', op: 0.44, night: true };
};

export default function World() {
  // narrow subscriptions: the player's position is written straight to the DOM in
  // the animation loop, so walking does not re-render the whole scene
  const anim = useGame((s) => s.anim);
  const facing = useGame((s) => s.facing);
  const atLocation = useGame((s) => s.atLocation);
  const openLocation = useGame((s) => s.openLocation);
  const profile = useGame((s) => s.profile);
  const meters = useGame((s) => s.meters);
  const timeMin = useGame((s) => s.timeMin);
  const walking = useGame((s) => s.walking);
  const path = useGame((s) => s.path);
  const goTo = useGame((s) => s.goTo);
  const goToPoint = useGame((s) => s.goToPoint);
  const step = useGame((s) => s.step);
  const score = useGame((s) => s.score);

  const sky = skyFor(timeMin);
  const locations = visibleLocations({ profile });
  const overall = score().overall;
  const tier = overall >= 70 ? 'high' : overall >= 50 ? 'mid' : 'low';

  /* main animation loop: moves the player and eases the camera after them */
  const camRef = useRef(null);
  const playerRef = useRef(null);
  const camPos = useRef({ x: WORLD.w / 2 - VIEW.w / 2, y: WORLD.h / 2 - VIEW.h / 2 });
  useEffect(() => {
    let raf; let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      step(dt);
      const p = useGame.getState().pos;
      if (playerRef.current) playerRef.current.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
      // overscan a little past the map edge so the player never sits under a HUD panel
      const OVER = 300;
      const tx = Math.max(-OVER, Math.min(WORLD.w - VIEW.w + OVER, p.x - VIEW.w / 2));
      const ty = Math.max(-OVER, Math.min(WORLD.h - VIEW.h + OVER, p.y - VIEW.h / 2));
      const k = 1 - Math.pow(0.0015, dt); // critically-damped-ish follow
      camPos.current.x += (tx - camPos.current.x) * k;
      camPos.current.y += (ty - camPos.current.y) * k;
      if (camRef.current) {
        camRef.current.setAttribute(
          'transform',
          `translate(${(-camPos.current.x).toFixed(1)},${(-camPos.current.y).toFixed(1)})`,
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const routes = useMemo(
    () => [
      [ROAD_NODES[0], ROAD_NODES[1], ROAD_NODES[2]],
      [ROAD_NODES[4], ROAD_NODES[5], ROAD_NODES[6], ROAD_NODES[7]],
      [ROAD_NODES[1], ROAD_NODES[5]],
      [ROAD_NODES[2], ROAD_NODES[6]],
      [{ x: 980, y: 330 }, { x: 1230, y: 330 }],
      [{ x: 320, y: 760 }, { x: 560, y: 760 }],
    ],
    [],
  );
  const { data: npcs, refs } = useWanderers(9, routes);

  const carRefs = useRef([]);
  useEffect(() => {
    let raf; let last = performance.now();
    const cars = [
      { x: -80, y: 400, speed: 150, color: '#e05c5c', flip: false },
      { x: 1700, y: 428, speed: -130, color: '#4a7fd4', flip: true },
      { x: 600, y: 700, speed: 110, color: '#f0b429', flip: false },
    ];
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      cars.forEach((c, i) => {
        c.x += c.speed * dt;
        if (c.x > WORLD.w + 120) c.x = -120;
        if (c.x < -120) c.x = WORLD.w + 120;
        const el = carRefs.current[i];
        if (el) el.setAttribute('transform', `translate(${c.x.toFixed(1)},${c.y})`);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      className="world"
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid slice"
      onClick={(e) => {
        if (e.target.closest('.building')) return; // handled by the location itself
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const local = pt.matrixTransform(svg.getScreenCTM().inverse());
        goToPoint({ x: local.x + camPos.current.x, y: local.y + camPos.current.y });
      }}
    >
      <defs>
        <radialGradient id="lampGlow">
          <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfe8cf" />
          <stop offset="100%" stopColor="#cfdcbb" />
        </linearGradient>
        <pattern id="zebra" width="26" height="10" patternUnits="userSpaceOnUse">
          <rect width="13" height="10" fill="#ffffff" opacity="0.55" />
        </pattern>
      </defs>

      <g ref={camRef}>
      <rect x="-400" y="-400" width={WORLD.w + 800} height={WORLD.h + 800} fill="url(#grass)" />

      {/* roads */}
      <g className="roads">
        <rect x="0" y="372" width={WORLD.w} height="68" fill="#cfcabc" />
        <rect x="0" y="672" width={WORLD.w} height="60" fill="#cfcabc" />
        <rect x="146" y="0" width="64" height={WORLD.h} fill="#cfcabc" />
        <rect x="570" y="0" width="60" height={WORLD.h} fill="#cfcabc" />
        <rect x="982" y="0" width="58" height={WORLD.h} fill="#cfcabc" />
        <rect x="1302" y="0" width="56" height={WORLD.h} fill="#cfcabc" />
        <g stroke="#ffffff" strokeWidth="3" strokeDasharray="18 16" opacity="0.6">
          <line x1="0" y1="406" x2={WORLD.w} y2="406" />
          <line x1="0" y1="702" x2={WORLD.w} y2="702" />
          <line x1="178" y1="0" x2="178" y2={WORLD.h} />
          <line x1="600" y1="0" x2="600" y2={WORLD.h} />
          <line x1="1011" y1="0" x2="1011" y2={WORLD.h} />
          <line x1="1330" y1="0" x2="1330" y2={WORLD.h} />
        </g>
        <rect x="380" y="372" width="60" height="68" fill="url(#zebra)" />
        <rect x="1130" y="672" width="60" height="60" fill="url(#zebra)" />
      </g>

      {/* scenery */}
      <g>
        <Tree x={90} y={520} s={1.1} tone={0} />
        <Tree x={330} y={430} s={0.9} tone={1} />
        <Tree x={470} y={760} s={1.2} tone={2} />
        <Tree x={880} y={430} s={1} tone={1} />
        <Tree x={930} y={760} s={0.95} tone={0} />
        <Tree x={1480} y={440} s={1.05} tone={2} />
        <Tree x={60} y={880} s={1.15} tone={1} />
        <Tree x={1560} y={900} s={1} tone={0} />
        <Tree x={-120} y={180} s={1.1} tone={2} />
        <Tree x={-180} y={640} s={1} tone={0} />
        <Tree x={-90} y={980} s={1.2} tone={1} />
        <Tree x={1760} y={210} s={1.05} tone={1} />
        <Tree x={1820} y={700} s={1.15} tone={2} />
        <Tree x={420} y={-110} s={1.1} tone={0} />
        <Tree x={1180} y={-140} s={1} tone={2} />
        <Tree x={760} y={1140} s={1.1} tone={1} />
        <Tree x={1420} y={1120} s={1} tone={0} />
        <Bench x={300} y={880} />
        <Bench x={470} y={880} />
        <Bench x={1110} y={470} />
      </g>

      {/* locations */}
      {locations.map((loc) =>
        loc.open ? (
          <OpenPlace
            key={loc.id} loc={loc} active={openLocation === loc.id}
            onClick={() => goTo(loc.id)}
          >
            {loc.id === 'ground' && (
              <g>
                <ellipse cx={loc.x} cy={loc.y} rx="110" ry="66" fill="#c6e3a6" />
                <ellipse cx={loc.x} cy={loc.y} rx="46" ry="26" fill="#dcc9a0" />
                <g className="cricket">
                  <rect x={loc.x - 2} y={loc.y - 22} width="4" height="22" rx="2" fill="#d8c08c" />
                  <circle className="ball" cx={loc.x + 40} cy={loc.y + 6} r="5" fill="#b83c3c" />
                </g>
              </g>
            )}
            {loc.id === 'garden' && (
              <g>
                <circle cx={loc.x - 70} cy={loc.y + 10} r="30" fill="#9cc98a" />
                <circle cx={loc.x + 76} cy={loc.y - 6} r="26" fill="#9cc98a" />
                <g className="stray-a" transform={`translate(${loc.x - 40},${loc.y + 36})`}><Dog /></g>
                <g className="stray-b" transform={`translate(${loc.x + 44},${loc.y + 24})`}><Dog tone="#8d7a68" /></g>
                <g className="stray-c" transform={`translate(${loc.x + 8},${loc.y - 24})`}><Dog tone="#d8b483" /></g>
              </g>
            )}
            {loc.id === 'street' && (
              <g>
                <rect x={loc.x - 100} y={loc.y - 34} width="80" height="40" rx="6" fill="#d9603f" />
                <rect x={loc.x - 104} y={loc.y - 44} width="88" height="12" rx="5" fill="#f0c04a" />
                <rect x={loc.x + 6} y={loc.y - 28} width="76" height="34" rx="6" fill="#4f8bb5" />
                <rect x={loc.x + 2} y={loc.y - 38} width="84" height="12" rx="5" fill="#f0c04a" />
                <g className="steam" opacity="0.5">
                  <circle cx={loc.x - 60} cy={loc.y - 54} r="7" fill="#fff" />
                  <circle cx={loc.x - 50} cy={loc.y - 66} r="5" fill="#fff" />
                </g>
              </g>
            )}
          </OpenPlace>
        ) : (
          <Building
            key={loc.id} loc={loc} lit={sky.night} active={openLocation === loc.id}
            onClick={() => goTo(loc.id)}
          />
        ),
      )}

      {/* lamps */}
      <Lamp x={250} y={372} on={sky.night} />
      <Lamp x={760} y={372} on={sky.night} />
      <Lamp x={1180} y={372} on={sky.night} />
      <Lamp x={420} y={672} on={sky.night} />
      <Lamp x={900} y={672} on={sky.night} />
      <Lamp x={1420} y={672} on={sky.night} />

      {/* cars */}
      {[0, 1, 2].map((i) => (
        <g key={i} ref={(el) => { carRefs.current[i] = el; }}>
          <Car color={['#e05c5c', '#4a7fd4', '#f0b429'][i]} flip={i === 1} />
        </g>
      ))}

      {/* ambient students */}
      {npcs.map((n, i) => (
        <g key={i} ref={(el) => { refs.current[i] = el; }}>
          <g><NPC avatar={n.avatar} /></g>
        </g>
      ))}

      {/* walking route hint */}
      {walking && path.length > 0 && (
        <g className="route">
          <polyline
            points={path.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="#2b3444" strokeWidth="3" strokeDasharray="6 10" opacity="0.35"
          />
          <circle cx={path[path.length - 1].x} cy={path[path.length - 1].y} r="12" className="target-ping" fill="none" stroke="#2b3444" strokeWidth="2" />
        </g>
      )}

      {/* player */}
      <g ref={playerRef}>
        <Character
          avatar={AVATARS[profile.avatar || 0]} anim={anim} facing={facing} scale={1.22}
          meters={meters} scoreTier={tier} label={profile.name || 'You'}
        />
      </g>

      {atLocation && !walking && (
        <g pointerEvents="none" transform={`translate(${locById(atLocation).door.x},${locById(atLocation).door.y})`}>
          <circle r="26" className="here-ring" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.7" />
        </g>
      )}
      </g>

      {/* time-of-day wash, drawn over the camera */}
      <rect width={VIEW.w} height={VIEW.h} fill={sky.fill} opacity={sky.op} pointerEvents="none" />
    </svg>
  );
}
