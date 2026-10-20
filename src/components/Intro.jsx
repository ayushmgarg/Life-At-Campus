import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Character, { AVATARS } from './Character.jsx';
import { COMMUTES } from '../game/config.js';
import { useGame } from '../game/store.js';
import cohort from '../data/cohort.json';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const STAYS = ['Hostel resident', 'Day scholar', 'Living in a rented flat or PG', 'Living with family'];

export default function Intro() {
  const start = useGame((s) => s.start);
  const [name, setName] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [stay, setStay] = useState('Hostel resident');
  const [commute, setCommute] = useState('Public transport');
  const [avatar, setAvatar] = useState(0);

  return (
    <div className="intro">
      <motion.div className="intro-card" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="intro-left">
          <div className="brand">
            <span className="dot" /> College Lifestyle Score
          </div>
          <h1>Campus Life<span>Simulator</span></h1>
          <p className="lede">
            Play one week of college. Sleep, eat, skip meals, hit the gym, bunk, scroll, sit with the
            dogs, see your people. The Lifestyle Score updates live on the same model the dashboard
            uses, built from {cohort.n} real survey responses.
          </p>

          <div className="field">
            <label>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ayush" maxLength={14} />
          </div>

          <div className="field">
            <label>Year of study</label>
            <div className="opts">
              {YEARS.map((y) => (
                <button key={y} className={`opt ${year === y ? 'on' : ''}`} onClick={() => setYear(y)}>{y}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Accommodation</label>
            <div className="opts">
              {STAYS.map((s) => (
                <button key={s} className={`opt ${stay === s ? 'on' : ''}`} onClick={() => setStay(s)}>{s}</button>
              ))}
            </div>
          </div>

          {stay !== 'Hostel resident' && (
            <div className="field">
              <label>Commute to college</label>
              <div className="opts">
                {Object.entries(COMMUTES).map(([k, v]) => (
                  <button key={k} className={`opt ${commute === k ? 'on' : ''}`} onClick={() => setCommute(k)}>
                    {v.icon} {k} <i>{v.mins} min</i>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="primary big" onClick={() => start({ name: name.trim() || 'You', year, stay, commute, avatar })}>
            Start Monday morning →
          </button>
          <a className="method-link" href="#/method">How the score works ·  methodology</a>
        </div>

        <div className="intro-right">
          <div className="panel-label">Pick your character</div>
          <div className="avatar-grid">
            {AVATARS.map((a, i) => (
              <button key={i} className={`avatar ${avatar === i ? 'on' : ''}`} onClick={() => setAvatar(i)}>
                <svg viewBox="-30 -42 60 86">
                  <g transform="translate(0,6)"><Character avatar={a} anim={avatar === i ? 'walk' : 'idle'} /></g>
                </svg>
              </button>
            ))}
          </div>
          <div className="cohort-box">
            <div className="panel-label">In the real data ({cohort.n} students)</div>
            <ul>
              <li><b>{cohort.headline.shortSleepPct}%</b> sleep under 6 hours</li>
              <li><b>{cohort.headline.highStressPct}%</b> rate stress 4 or 5 out of 5</li>
              <li><b>{cohort.headline.highScreenPct}%</b> spend 8+ hours on screens</li>
              <li><b>{cohort.headline.skipMealsPct}%</b> skip meals for class or deadlines</li>
              <li><b>{cohort.headline.noExercisePct}%</b> never exercise in a week</li>
            </ul>
            <div className="cohort-avg">Cohort average score <b>{cohort.means.overall}</b>/100</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
