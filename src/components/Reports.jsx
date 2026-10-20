import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Radar, Line, Bar } from 'react-chartjs-2';
import {
  adviceFor, archetypeOf, cohortStanding, CATEGORY_LABELS, dayHeadlines, r1, scoreDrivers,
  strongest, weakest,
} from '../game/engine.js';
import { CATEGORY_KEYS, MODELS, overallFor, weightsFor } from '../scoring/model.js';
import { useGame } from '../game/store.js';
import cohort from '../data/cohort.json';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLOR_BY_KEY = {
  sleep: '#6284f4', diet: '#e9b95b', activity: '#23b8a7',
  screen: '#9b72e8', academic: '#ee8d79', wellbeing: '#5bb7d0', social: '#e2719f',
};

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function Anomalies({ list, title = 'Anomalies flagged' }) {
  if (!list || !list.length) return null;
  return (
    <div className="anomalies">
      <div className="panel-label">{title}</div>
      <ul>
        {list.slice(0, 8).map((a, i) => (
          <li key={i} className={a.severity}>
            <span className="an-icon">{a.icon}</span>
            {a.day ? <b>{a.day}: </b> : null}
            {a.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DayReport() {
  const report = useGame((s) => s.dayReport);
  const scoreHistory = useGame((s) => s.scoreHistory);
  const model = useGame((s) => s.model);
  const nextDay = useGame((s) => s.nextDay);
  if (!report) return null;

  const keys = CATEGORY_KEYS[model];
  const weights = weightsFor(model);
  const cat = report.score;
  const overall = overallFor(cat, model);
  const prev = scoreHistory[scoreHistory.length - 2];
  const delta = prev ? overall - overallFor(prev, model) : null;
  const advice = adviceFor(cat, model);

  return (
    <div className="modal-wrap report">
      <motion.div className="modal wide" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="report-head">
          <div>
            <div className="panel-label">{report.name} · day {report.dayIndex} done</div>
            <h2>Lifestyle Score {overall}
              {delta !== null && (
                <span className={`delta ${delta >= 0 ? 'up' : 'down'}`}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
                </span>
              )}
            </h2>
            <div className="model-note">{MODELS[model].label}</div>
          </div>
          <div className="report-score" style={{ borderColor: overall >= 70 ? '#23b8a7' : overall >= 50 ? '#e9b95b' : '#e05c5c' }}>
            {overall}
          </div>
        </div>

        <div className="headlines">
          {dayHeadlines(report.day).map((h) => <span key={h} className="tag big">{h}</span>)}
        </div>

        <div className="cat-rows">
          {keys.map((k, i) => (
            <div className="cat-row" key={k}>
              <span className="cat-row-name">{CATEGORY_LABELS[k]} <i>{Math.round(weights[k] * 100)}%</i></span>
              <div className="bar">
                <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${cat[k]}%` }}
                  transition={{ delay: i * 0.05 }} style={{ background: COLOR_BY_KEY[k] }} />
                <div className="bar-mark" style={{ left: `${cohort.means[k]}%` }} />
              </div>
              <span className="cat-row-val">{cat[k]}</span>
            </div>
          ))}
        </div>

        <Anomalies list={report.anomalies} title="Flagged today" />

        <div className="insight">
          <b>Weakest: {advice.label}.</b> {advice.lines[0]}
        </div>

        <button className="primary" onClick={nextDay}>Next day →</button>
      </motion.div>
    </div>
  );
}

export function WeekReport() {
  const week = useGame((s) => s.weekReport);
  const scoreHistory = useGame((s) => s.scoreHistory);
  const anomalies = useGame((s) => s.anomalies);
  const profile = useGame((s) => s.profile);
  const model = useGame((s) => s.model);
  const setModel = useGame((s) => s.setModel);
  const reset = useGame((s) => s.reset);
  if (!week) return null;

  const keys = CATEGORY_KEYS[model];
  const cat = week.score;
  const overall = overallFor(cat, model);
  const standing = cohortStanding(cohort, cat, model);
  const arch = archetypeOf(cat);
  const advice = adviceFor(cat, model);
  const best = strongest(cat, model);
  const worst = weakest(cat, model);
  const drivers = scoreDrivers(cat, cohort, model);
  const a = week.agg;

  const radar = {
    labels: keys.map((k) => CATEGORY_LABELS[k]),
    datasets: [
      {
        label: profile.name || 'Your week',
        data: keys.map((k) => cat[k]),
        backgroundColor: '#23b8a733', borderColor: '#23b8a7', borderWidth: 2, pointBackgroundColor: '#23b8a7',
      },
      {
        label: `Survey cohort (n=${cohort.n})`,
        data: keys.map((k) => cohort.means[k]),
        backgroundColor: '#6284f41f', borderColor: '#6284f4', borderWidth: 2, borderDash: [5, 4], pointRadius: 2,
      },
    ],
  };

  const trend = {
    labels: scoreHistory.map((_, i) => `Day ${i + 1}`),
    datasets: [{
      label: 'Lifestyle Score', data: scoreHistory.map((s) => overallFor(s, model)),
      borderColor: '#ee8d79', backgroundColor: '#ee8d7922', fill: true, tension: 0.35,
    }],
  };

  const compare = {
    labels: keys.map((k) => CATEGORY_LABELS[k]),
    datasets: [
      { label: 'You', data: keys.map((k) => cat[k]), backgroundColor: '#23b8a7', borderRadius: 5 },
      { label: 'Cohort', data: keys.map((k) => cohort.means[k]), backgroundColor: '#c9d2e4', borderRadius: 5 },
    ],
  };

  const weekFacts = [
    ['Sleep', `${r1(a.sleepHours)} h a night · woke rested ${r1(a.rested)}/5`],
    ['Meals', `${r1(a.mealsPerDay)} a day · ${Math.round(a.junkPerWeek)} junk meals · ${r1(a.waterLitres)} L water`],
    ['Activity', `${Math.round(a.exerciseDays)} active days · ${Math.round(a.exerciseMinutes)} min a day`],
    ['Screens', `${r1(a.screenHours)} h a day · screens before bed ${Math.round(a.preSleepNights)} nights`],
    ['Study & stress', `${r1(a.studyHours)} h study a day · stress ${r1(a.stress)}/5 · overwhelm ${r1(a.overwhelm)}/5`],
    ['In person', `${Math.round(a.faceMinutes)} min face-to-face a day · met people on ${Math.round(a.meetDays)} days · ${Math.round(a.outings)} outings`],
    ['Through a screen', `${Math.round(a.digitalSocial)} min a day of calls and chat`],
    ['Habits', [
      a.drinkNights ? `${a.drinkNights} drinking night${a.drinkNights > 1 ? 's' : ''}` : null,
      a.caffeinePerDay >= 0.5 ? `${r1(a.caffeinePerDay)} late coffees a day` : null,
      a.smokesPerWeek >= 1 ? `${Math.round(a.smokesPerWeek)} smoke breaks` : null,
      a.workDays ? `${a.workDays} work shifts` : null,
      a.choresDays ? `${a.choresDays} days of chores` : null,
    ].filter(Boolean).join(' · ') || 'nothing flagged'],
    ['Attendance', `${week.attendance}%`],
  ];

  return (
    <div className="modal-wrap report">
      <motion.div className="modal widest" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="report-head">
          <div>
            <div className="panel-label">Week complete</div>
            <h2>{arch.icon} {arch.name}</h2>
            <p className="arch-blurb">{arch.blurb}</p>
            <div className="model-switch inline">
              {Object.values(MODELS).map((m) => (
                <button key={m.id} className={model === m.id ? 'on' : ''} onClick={() => setModel(m.id)} title={m.note}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="final-score">
            <div className="final-num">{overall}</div>
            <div className="final-sub">out of 100</div>
            <div className="final-pct">{ordinal(standing.overall)} percentile of {cohort.n}</div>
          </div>
        </div>

        <div className="report-grid">
          <div className="card">
            <div className="panel-label">Category profile vs the real cohort</div>
            <div className="chart"><Radar data={radar} options={{
              responsive: true, maintainAspectRatio: false,
              scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, backdropColor: 'transparent' }, grid: { color: '#e6e2d8' }, pointLabels: { font: { size: 10.5 } } } },
              plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7 } } },
            }} /></div>
          </div>
          <div className="card">
            <div className="panel-label">Score across the week</div>
            <div className="chart"><Line data={trend} options={{
              responsive: true, maintainAspectRatio: false,
              scales: { y: { min: 0, max: 100, grid: { color: '#edf0f6' } }, x: { grid: { display: false } } },
              plugins: { legend: { display: false } },
            }} /></div>
          </div>
          <div className="card">
            <div className="panel-label">You vs cohort, by category</div>
            <div className="chart"><Bar data={compare} options={{
              responsive: true, maintainAspectRatio: false, indexAxis: 'y',
              scales: { x: { min: 0, max: 100, grid: { color: '#edf0f6' } }, y: { grid: { display: false } } },
              plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7 } } },
            }} /></div>
          </div>
          <div className="card">
            <div className="panel-label">What the week actually looked like</div>
            <table className="facts">
              <tbody>
                {weekFacts.map(([k, v]) => (
                  <tr key={k}><th>{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="standing">
          {keys.map((k) => (
            <div key={k} className="stand">
              <span className="stand-name">{CATEGORY_LABELS[k]}</span>
              <span className="stand-val" style={{ color: COLOR_BY_KEY[k] }}>{cat[k]}</span>
              <span className="stand-pct">{ordinal(standing[k])} pct</span>
            </div>
          ))}
        </div>

        <div className="report-grid two">
          <div className="card">
            <div className="panel-label">What moved the score</div>
            <div className="drivers big">
              {drivers.map((d) => (
                <div className="driver" key={d.key}>
                  <span className="driver-name">{d.label}</span>
                  <span className="driver-bar">
                    <i
                      className={d.points >= 0 ? 'up' : 'down'}
                      style={{ width: `${Math.min(50, Math.abs(d.points) * 6)}%` }}
                    />
                  </span>
                  <span className={`driver-pts ${d.points >= 0 ? 'up' : 'down'}`}>
                    {d.points >= 0 ? '+' : ''}{d.points}
                  </span>
                </div>
              ))}
            </div>
            <div className="legend-line">points of overall score gained or lost against the cohort average</div>
          </div>
          <div className="card">
            <Anomalies list={anomalies} title={`Anomalies flagged this week (${anomalies.length})`} />
            {!anomalies.length && <p className="m-note">No days fell outside the cohort's normal range.</p>}
          </div>
        </div>

        <div className="insight">
          <b>Strongest: {CATEGORY_LABELS[best]} ({cat[best]}). Weakest: {CATEGORY_LABELS[worst]} ({cat[worst]}).</b>
          <ul>{advice.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </div>

        <div className="report-actions">
          <button className="primary" onClick={reset}>Play another week</button>
          <a className="ghost" href="#/method">How the score is calculated →</a>
        </div>
      </motion.div>
    </div>
  );
}
