/**
 * The player character: a hand-built SVG rig (no sprite sheet), so every limb
 * can be animated per activity and the look reacts to the meters.
 */
import React from 'react';

export const AVATARS = [
  { skin: '#e8b98c', hair: '#2f2a27', shirt: '#4e7cf0', pants: '#2c3350', hairStyle: 'short' },
  { skin: '#c78a5a', hair: '#1d1a19', shirt: '#e4674f', pants: '#34405c', hairStyle: 'bun' },
  { skin: '#f0cfae', hair: '#5a3826', shirt: '#2fae8f', pants: '#444a63', hairStyle: 'long' },
  { skin: '#9c6a42', hair: '#15110f', shirt: '#f0b429', pants: '#2f3b4a', hairStyle: 'curls' },
  { skin: '#e2b089', hair: '#7a4a9e', shirt: '#8e6fe0', pants: '#2a2f45', hairStyle: 'short' },
  { skin: '#b07c4f', hair: '#262020', shirt: '#36b7cf', pants: '#2b3448', hairStyle: 'bun' },
];

function Hair({ style, color }) {
  switch (style) {
    case 'bun':
      return (
        <g fill={color}>
          <path d="M-11 -4 a11 11 0 0 1 22 0 q-11 -7 -22 0z" />
          <path d="M-11 -4 q11 -12 22 0 l0 -3 q-11 -11 -22 0z" />
          <circle cx="0" cy="-15" r="5.2" />
        </g>
      );
    case 'long':
      return (
        <g fill={color}>
          <path d="M-11 -3 a11 11 0 0 1 22 0 q-11 -8 -22 0z" />
          <path d="M-11.5 -3 q-1.5 13 1 18 l4 0 q-3 -9 -2 -18z" />
          <path d="M11.5 -3 q1.5 13 -1 18 l-4 0 q3 -9 2 -18z" />
        </g>
      );
    case 'curls':
      return (
        <g fill={color}>
          <circle cx="-7" cy="-7" r="5" />
          <circle cx="0" cy="-10" r="5.4" />
          <circle cx="7" cy="-7" r="5" />
          <circle cx="-10" cy="-2" r="4" />
          <circle cx="10" cy="-2" r="4" />
        </g>
      );
    default:
      return (
        <g fill={color}>
          <path d="M-11 -3 a11 11 0 0 1 22 0 q-11 -9 -22 0z" />
          <path d="M-11 -2 q-1 -10 6 -12 l2 3 q-6 2 -5 9z" />
        </g>
      );
  }
}

const Zzz = () => (
  <g className="zzz">
    <text x="16" y="-18" fontSize="13" fill="#8fa8d8" fontWeight="700">z</text>
    <text x="24" y="-28" fontSize="16" fill="#8fa8d8" fontWeight="700">Z</text>
    <text x="34" y="-40" fontSize="20" fill="#8fa8d8" fontWeight="700">Z</text>
  </g>
);

function Props({ anim }) {
  switch (anim) {
    case 'study':
      return (
        <g>
          <rect x="-16" y="12" width="32" height="7" rx="2" fill="#f2f0ea" stroke="#b9b2a4" strokeWidth="1" />
          <rect x="-13" y="6" width="26" height="8" rx="2" fill="#dfe7f6" stroke="#9fb0cf" strokeWidth="1" />
          <circle className="spark" cx="20" cy="-2" r="2.4" fill="#f4c23c" />
        </g>
      );
    case 'phone':
      return (
        <g className="phone-hand">
          <rect x="4" y="2" width="9" height="14" rx="2" fill="#20242e" />
          <rect x="5" y="3.5" width="7" height="11" rx="1" fill="#79d7ff" opacity="0.9" />
          <g className="phone-glow" opacity="0.55">
            <path d="M8 2 l-7 -8 l16 0 z" fill="#8fe0ff" />
          </g>
        </g>
      );
    case 'eat':
      return (
        <g>
          <ellipse cx="0" cy="20" rx="13" ry="4.5" fill="#f6f2e8" stroke="#cdbfa6" />
          <ellipse cx="0" cy="19" rx="8" ry="3" fill="#e8a44e" />
          <circle className="bite" cx="9" cy="6" r="3" fill="#e8a44e" />
        </g>
      );
    case 'gym':
      return (
        <g className="weights">
          <rect x="-22" y="2" width="44" height="3" rx="1.5" fill="#4a4f5c" />
          <rect x="-26" y="-3" width="7" height="13" rx="2" fill="#2f3440" />
          <rect x="19" y="-3" width="7" height="13" rx="2" fill="#2f3440" />
        </g>
      );
    case 'pet':
      return (
        <g transform="translate(22, 14)">
          <g className="dog-body">
            <ellipse cx="0" cy="0" rx="12" ry="7" fill="#c89a63" />
            <circle cx="10" cy="-6" r="6" fill="#c89a63" />
            <path d="M6 -11 l3 -5 l3 5z" fill="#a87c49" />
            <circle cx="12" cy="-7" r="1.2" fill="#2b2118" />
            <path className="tail" d="M-11 -2 q-8 -5 -5 -10" stroke="#c89a63" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="-8" y="5" width="3" height="7" rx="1.5" fill="#a87c49" />
            <rect x="6" y="5" width="3" height="7" rx="1.5" fill="#a87c49" />
          </g>
          <text className="heart" x="-4" y="-18" fontSize="13">💛</text>
        </g>
      );
    case 'social':
      return (
        <g>
          <g className="bubble" transform="translate(20,-26)">
            <rect x="-14" y="-11" width="30" height="20" rx="8" fill="#fff" stroke="#d6cfc0" />
            <path d="M-6 9 l-4 7 l10 -7z" fill="#fff" stroke="#d6cfc0" />
            <circle cx="-5" cy="-1" r="2" fill="#8b93a7" />
            <circle cx="1" cy="-1" r="2" fill="#8b93a7" />
            <circle cx="7" cy="-1" r="2" fill="#8b93a7" />
          </g>
        </g>
      );
    case 'class':
      return (
        <g>
          <rect x="-14" y="10" width="28" height="6" rx="2" fill="#e9e3d6" stroke="#c3b9a6" />
          <rect x="-22" y="-2" width="7" height="12" rx="2" fill="#6f8ad6" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * @param {string} anim walk|idle|study|eat|gym|sleep|phone|pet|social|class|walkloop
 */
export default function Character({
  avatar = AVATARS[0], anim = 'idle', facing = 1, scale = 1, meters, scoreTier = 'mid', label,
}) {
  const tired = meters && meters.energy < 28;
  const stressed = meters && meters.stress > 70;
  const hungry = meters && meters.fullness < 25;
  const sleeping = anim === 'sleep';

  return (
    <g className={`char char-${anim} tier-${scoreTier}`} transform={`scale(${scale})`}>
      <ellipse className="char-shadow" cx="0" cy="34" rx="15" ry="5" fill="#000" opacity="0.16" />
      <g className="char-body" transform={`scale(${facing},1)`}>
        <g className={sleeping ? 'lie' : undefined}>
          {/* legs */}
          <g className="leg leg-back">
            <rect x="-8" y="10" width="7" height="19" rx="3" fill={avatar.pants} />
            <rect x="-9" y="26" width="9" height="5" rx="2.4" fill="#2a2a2f" />
          </g>
          <g className="leg leg-front">
            <rect x="1" y="10" width="7" height="19" rx="3" fill={avatar.pants} />
            <rect x="0" y="26" width="9" height="5" rx="2.4" fill="#33333a" />
          </g>
          {/* torso */}
          <g className="torso">
            <rect x="-10" y="-5" width="20" height="18" rx="6" fill={avatar.shirt} />
            <rect x="-10" y="6" width="20" height="4" rx="2" fill="#00000018" />
            {/* backpack strap */}
            <path d="M-5 -4 q2 9 0 15" stroke="#00000022" strokeWidth="2.4" fill="none" />
            <path d="M5 -4 q-2 9 0 15" stroke="#00000022" strokeWidth="2.4" fill="none" />
          </g>
          {/* arms */}
          <g className="arm arm-back">
            <rect x="-14" y="-3" width="5.5" height="16" rx="2.7" fill={avatar.shirt} />
            <circle cx="-11.2" cy="13" r="3" fill={avatar.skin} />
          </g>
          <g className="arm arm-front">
            <rect x="8.5" y="-3" width="5.5" height="16" rx="2.7" fill={avatar.shirt} />
            <circle cx="11.2" cy="13" r="3" fill={avatar.skin} />
          </g>
          {/* head */}
          <g className="head">
            <rect x="-3" y="-9" width="6" height="6" rx="2" fill={avatar.skin} />
            <circle cx="0" cy="-14" r="10.5" fill={avatar.skin} />
            <Hair style={avatar.hairStyle} color={avatar.hair} />
            {sleeping || tired ? (
              <g stroke="#2b2420" strokeWidth="1.5" strokeLinecap="round" fill="none">
                <path d="M-6 -14 q3 2.5 6 0" />
                <path d="M0.5 -14 q3 2.5 6 0" />
              </g>
            ) : (
              <g className="eyes" fill="#2b2420">
                <circle cx="-3.4" cy="-14.5" r="1.5" />
                <circle cx="3.4" cy="-14.5" r="1.5" />
              </g>
            )}
            <path
              d={stressed ? 'M-3 -9 q3 -2.5 6 0' : 'M-3 -9.5 q3 2.8 6 0'}
              stroke="#8a5a4a" strokeWidth="1.3" fill="none" strokeLinecap="round"
            />
          </g>
        </g>
        <Props anim={anim} />
      </g>

      {sleeping && <Zzz />}
      {stressed && !sleeping && <text className="emote" x="-22" y="-26" fontSize="14">💢</text>}
      {hungry && !sleeping && <text className="emote emote-2" x="18" y="-30" fontSize="14">🍽️</text>}
      {tired && !sleeping && !stressed && <text className="emote" x="-24" y="-28" fontSize="14">💤</text>}
      {label && (
        <g transform="translate(0,-40)">
          <rect x={-label.length * 3.4 - 6} y="-12" width={label.length * 6.8 + 12} height="16" rx="8" fill="#1d2230cc" />
          <text x="0" y="0" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{label}</text>
        </g>
      )}
    </g>
  );
}

/** Lightweight ambient student (no meters, fewer parts). */
export function NPC({ avatar, facing = 1, anim = 'walk', scale = 0.85 }) {
  return (
    <g className={`char char-${anim} npc`} transform={`scale(${scale})`}>
      <ellipse cx="0" cy="33" rx="13" ry="4.5" fill="#000" opacity="0.13" />
      <g transform={`scale(${facing},1)`}>
        <g className="leg leg-back"><rect x="-7" y="10" width="6" height="19" rx="3" fill={avatar.pants} /></g>
        <g className="leg leg-front"><rect x="1" y="10" width="6" height="19" rx="3" fill={avatar.pants} /></g>
        <rect x="-9" y="-4" width="18" height="17" rx="6" fill={avatar.shirt} />
        <g className="arm arm-back"><rect x="-13" y="-2" width="5" height="15" rx="2.5" fill={avatar.shirt} /></g>
        <g className="arm arm-front"><rect x="8" y="-2" width="5" height="15" rx="2.5" fill={avatar.shirt} /></g>
        <circle cx="0" cy="-13" r="9.5" fill={avatar.skin} />
        <Hair style={avatar.hairStyle} color={avatar.hair} />
      </g>
    </g>
  );
}
