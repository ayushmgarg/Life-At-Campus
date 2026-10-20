import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { METERS, MODIFIERS, WEEK_LENGTH } from '../game/config.js';
import {
  CATEGORY_LABELS, DAY_NAMES, fmtTime, scoreDrivers, visibleLocations, weakest,
} from '../game/engine.js';
import { CATEGORY_KEYS, MODELS, overallFor, weightsFor } from '../scoring/model.js';
import { useGame } from '../game/store.js';
import cohort from '../data/cohort.json';

const CAT_COLORS = {
  sleep: '#6284f4', diet: '#e9b95b', activity: '#23b8a7',
  screen: '#9b72e8', academic: '#ee8d79', wellbeing: '#5bb7d0', social: '#e2719f',
};
export { CAT_COLORS };

export function ScorePanel() {
  // these slices change whenever time or state advances, which is exactly when
  // the score needs recomputing (not on every animation frame)
  useGame((s) => s.today);
  useGame((s) => s.meters);
  useGame((s) => s.timeMin);
  useGame((s) => s.history);
  const model = useGame((s) => s.model);
  const setModel = useGame((s) => s.setModel);
  const day = useGame((s) => s.day);
  const [showDrivers, setShowDrivers] = useState(false);

  const score = useGame.getState().score();
  const keys = CATEGORY_KEYS[model];
  const weights = weightsFor(model);
  const overall = overallFor(score, model);
  const cohortMean = model === 'extended' ? cohort.means.overallExtended : cohort.means.overall;
  const weak = weakest(score, model);
  const vsCohort = overall - cohortMean;
  const drivers = scoreDrivers(score, cohort, model);

  return (
    <div className="panel score-panel">
      <div className="score-head">
        <div>
          <div className="panel-label">Lifestyle Score</div>
          <div className="score-sub">week so far · day {day}/{WEEK_LENGTH}</div>
        </div>
        <motion.div
          key={overall}
          initial={{ scale: 0.86, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          className="score-big"
          style={{ color: overall >= 70 ? '#23b8a7' : overall >= 50 ? '#e9a93b' : '#e05c5c' }}
        >
          {overall}
          <span>/100</span>
        </motion.div>
      </div>

      <div className="model-switch" role="group" aria-label="scoring model">
        {Object.values(MODELS).map((m) => (
          <button
            key={m.id}
            className={model === m.id ? 'on' : ''}
            onClick={() => setModel(m.id)}
            title={m.note}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="cohort-line">
        <span className={vsCohort >= 0 ? 'up' : 'down'}>
          {vsCohort >= 0 ? '▲' : '▼'} {Math.abs(vsCohort).toFixed(1)}
        </span>
        vs survey cohort average ({cohortMean}, n={cohort.n})
      </div>

      <div className="cats">
        {keys.map((k) => (
          <div className={`cat ${k === weak ? 'is-weak' : ''}`} key={k}>
            <div className="cat-top">
              <span className="cat-name">{CATEGORY_LABELS[k]}</span>
              <span className="cat-weight">{Math.round(weights[k] * 100)}%</span>
              <span className="cat-val">{score[k]}</span>
            </div>
            <div className="bar">
              <motion.div
                className="bar-fill"
                animate={{ width: `${score[k]}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{ background: CAT_COLORS[k] }}
              />
              <div className="bar-mark" style={{ left: `${cohort.means[k]}%` }} title={`cohort average ${cohort.means[k]}`} />
            </div>
          </div>
        ))}
      </div>

      <button className="drivers-toggle" onClick={() => setShowDrivers((v) => !v)}>
        {showDrivers ? 'Hide' : 'What is moving the score'} {showDrivers ? '▴' : '▾'}
      </button>
      {showDrivers && (
        <div className="drivers">
          {drivers.slice(0, 4).map((d) => (
            <div className="driver" key={d.key}>
              <span className="driver-name">{d.label}</span>
              <span className={`driver-pts ${d.points >= 0 ? 'up' : 'down'}`}>
                {d.points >= 0 ? '+' : ''}{d.points}
              </span>
            </div>
          ))}
          <div className="legend-line">points of the overall score vs the cohort average</div>
        </div>
      )}

      <div className="legend-line">dashed mark = average of the {cohort.n} survey responses</div>
    </div>
  );
}

/** Active conditions: illness, injury, exam week, no money, cracked phone. */
export function StatusBar() {
  const modifiers = useGame((s) => s.modifiers);
  if (!modifiers.length) return null;
  return (
    <div className="status-bar">
      {modifiers.map((m) => {
        const def = MODIFIERS[m.id];
        if (!def) return null;
        return (
          <motion.div
            key={m.id}
            className="status-chip"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            title={def.note}
          >
            <span>{def.icon}</span> {def.label}
            <i>{m.daysLeft}d</i>
          </motion.div>
        );
      })}
    </div>
  );
}

export function MeterBar() {
  const meters = useGame((s) => s.meters);
  return (
    <div className="panel meters">
      {Object.entries(METERS).map(([k, m]) => {
        const v = meters[k];
        const bad = m.good === 'high' ? v < 28 : v > 72;
        return (
          <div className={`meter ${bad ? 'is-bad' : ''}`} key={k}>
            <span className="meter-icon">{m.icon}</span>
            <div className="meter-body">
              <div className="meter-label">{m.label}</div>
              <div className="bar sm">
                <motion.div
                  className="bar-fill"
                  animate={{ width: `${v}%` }}
                  transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                  style={{ background: m.color }}
                />
              </div>
            </div>
            <span className="meter-val">{Math.round(v)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Clock() {
  const timeMin = useGame((s) => s.timeMin);
  const day = useGame((s) => s.day);
  const profile = useGame((s) => s.profile);
  const attendance = useGame((s) => s.attendancePct)();
  const assignments = useGame((s) => s.assignments);
  const h = ((timeMin % 1440) / 1440) * 360;
  return (
    <div className="panel clock-panel">
      <svg viewBox="0 0 64 64" className="dial">
        <circle cx="32" cy="32" r="28" fill="#fff" stroke="#e3ddcf" strokeWidth="3" />
        <circle cx="32" cy="32" r="28" fill="none" stroke="#e9b95b" strokeWidth="3"
          strokeDasharray={`${(timeMin % 1440) / 1440 * 176} 176`} transform="rotate(-90 32 32)" />
        <line x1="32" y1="32" x2="32" y2="14" stroke="#2b3444" strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${h} 32 32)`} />
        <circle cx="32" cy="32" r="3" fill="#2b3444" />
      </svg>
      <div>
        <div className="clock-time">{fmtTime(timeMin)}</div>
        <div className="clock-day">{DAY_NAMES[(day - 1) % 7]} · day {day}/{WEEK_LENGTH}</div>
        <div className="clock-meta">
          <span title="attendance">🎓 {attendance}%</span>
          <span title="pending assignments">📄 {assignments}</span>
          <span title="where you live">{profile.stay === 'Hostel resident' ? '🛏️ hostel' : '🏠 day scholar'}</span>
        </div>
      </div>
    </div>
  );
}

export function TravelBar() {
  const atLocation = useGame((s) => s.atLocation);
  const walking = useGame((s) => s.walking);
  const profile = useGame((s) => s.profile);
  const goTo = useGame((s) => s.goTo);
  const locs = useMemo(() => visibleLocations({ profile }), [profile]);
  return (
    <div className="panel travel">
      <div className="panel-label">Go to</div>
      <div className="travel-grid">
        {locs.map((l) => (
          <button
            key={l.id}
            className={`chip ${atLocation === l.id ? 'is-here' : ''}`}
            disabled={walking}
            onClick={() => goTo(l.id)}
            title={l.blurb}
          >
            <span>{l.icon}</span>
            {l.short}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Ticker() {
  const log = useGame((s) => s.log);
  const last = log.slice(-3).reverse();
  return (
    <div className="ticker">
      <AnimatePresence initial={false}>
        {last.map((l, i) => (
          <motion.div
            key={`${l.t}-${l.text}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: i === 0 ? 1 : 0.45, y: 0 }}
            exit={{ opacity: 0 }}
            className="ticker-line"
          >
            <b>{fmtTime(l.t)}</b> {l.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Floaters() {
  const floaters = useGame((s) => s.floaters);
  return (
    <div className="floaters">
      <AnimatePresence>
        {floaters.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -34, scale: 1 }}
            exit={{ opacity: 0, y: -58 }}
            transition={{ duration: 1.6 }}
            className={`floater ${f.kind}`}
          >
            {f.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
