import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { actionsAt, fmtTime, locById } from '../game/engine.js';
import { useGame } from '../game/store.js';

const AGG_LABEL = {
  meals: (v) => `+${v} meal`,
  junk: (v) => `junk +${v}`,
  water: (v) => `+${v} L water`,
  skipped: () => 'meal skipped',
  exerciseMinutes: (v) => `${Math.round(v)} min activity`,
  screenHours: (v) => `+${v} h screen`,
  studyHours: (v) => `+${v} h study`,
  socialMinutes: (v) => `${v} min with people`,
  animalMinutes: (v) => `${v} min with animals`,
  support: () => 'someone to talk to',
  intimacy: () => 'closeness',
  attended: () => 'attendance +1',
  bunked: () => 'missed a class',
  assignments: (v) => (v < 0 ? `${-v} assignment cleared` : `+${v} assignment`),
  club: () => 'club activity',
};

const chipsFor = (a) => {
  const out = [];
  for (const [k, v] of Object.entries(a.agg || {})) if (AGG_LABEL[k]) out.push(AGG_LABEL[k](v));
  return out;
};

export default function ActionPanel() {
  useGame((s) => s.openLocation);
  useGame((s) => s.timeMin);
  useGame((s) => s.busy);
  useGame((s) => s.pendingEvent);
  useGame((s) => s.sleepPrompt);
  const state = useGame.getState();
  const doAction = useGame((s) => s.doAction);
  const close = useGame((s) => s.closePanel);
  const id = state.openLocation;
  if (!id || state.pendingEvent || state.sleepPrompt) return null;
  const loc = locById(id);
  const list = actionsAt(id, state);

  return (
    <AnimatePresence>
      <motion.div
        className="panel action-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
      >
        <div className="action-head">
          <div>
            <h3>{loc.icon} {loc.name}</h3>
            <p>{loc.blurb}</p>
          </div>
          <button className="x" onClick={close} aria-label="close">✕</button>
        </div>
        <div className="action-grid">
          {list.map((a) => (
            <button key={a.id} className="action" onClick={() => doAction(a.id)} disabled={!!state.busy}>
              <div className="action-top">
                <span className="action-icon">{a.icon}</span>
                <span className="action-label">{a.label}</span>
                <span className="action-mins">{a.sleep ? 'ends day' : `${a.mins} min`}</span>
              </div>
              <p className="action-desc">{a.desc}</p>
              <div className="action-chips">
                {chipsFor(a).map((c) => <span key={c} className="tag">{c}</span>)}
              </div>
            </button>
          ))}
          {!list.length && <div className="empty">Nothing to do here at {fmtTime(state.timeMin)}.</div>}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function SleepPrompt() {
  const sleepPrompt = useGame((s) => s.sleepPrompt);
  const timeMin = useGame((s) => s.timeMin);
  const sleepNow = useGame((s) => s.sleepNow);
  const dismiss = useGame((s) => s.dismissSleepPrompt);
  if (!sleepPrompt) return null;

  const options = [
    { label: 'Early alarm', wake: 6.5 * 60, note: 'Full morning. Breakfast possible.' },
    { label: 'Normal alarm', wake: 7.5 * 60, note: 'Standard college morning.' },
    { label: 'Sleep in', wake: 9.5 * 60, note: 'Misses the first lecture slot.' },
  ];

  return (
    <div className="modal-wrap">
      <motion.div className="modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h3>😴 {sleepPrompt === 'partner' ? 'Stay the night' : 'Go to sleep'}</h3>
        <p className="modal-text">
          It is {fmtTime(timeMin)}. Sleep is 20% of the Lifestyle Score and half of that is whether you
          wake up rested.
        </p>
        <div className="choices">
          {options.map((o) => {
            const hours = Math.max(0, (o.wake + 24 * 60 - timeMin) / 60);
            return (
              <button key={o.label} className="choice" onClick={() => sleepNow(o.wake, sleepPrompt === 'partner')}>
                <b>{o.label} · {fmtTime(o.wake)}</b>
                <span
                  className={`hours ${
                    hours >= 7 && hours <= 9.2 ? 'good' : hours >= 6 && hours <= 10.2 ? 'ok' : 'bad'
                  }`}
                >
                  {hours.toFixed(1)} h of sleep
                </span>
                <span className="note">{o.note}</span>
              </button>
            );
          })}
        </div>
        <button className="ghost" onClick={dismiss}>Not yet</button>
      </motion.div>
    </div>
  );
}

export function EventModal() {
  const ev = useGame((s) => s.pendingEvent);
  const resolve = useGame((s) => s.resolveEvent);
  if (!ev) return null;
  return (
    <div className="modal-wrap">
      <motion.div className="modal event" initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}>
        <div className="event-icon">{ev.icon}</div>
        <h3>{ev.title}</h3>
        <p className="modal-text">{ev.text}</p>
        <div className="choices">
          {ev.choices.map((c, i) => (
            <button key={c.label} className="choice" onClick={() => resolve(i)}>
              <b>{c.label}</b>
              {c.note && <span className="note">{c.note}</span>}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
