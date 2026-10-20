import React, { useEffect, useState } from 'react';
import World from './components/World.jsx';
import Intro from './components/Intro.jsx';
import Methodology from './components/Methodology.jsx';
import ActionPanel, { EventModal, SleepPrompt } from './components/ActionPanel.jsx';
import { DayReport, WeekReport } from './components/Reports.jsx';
import { Clock, Floaters, MeterBar, ScorePanel, StatusBar, Ticker, TravelBar } from './components/Hud.jsx';
import { useGame } from './game/store.js';

function useHash() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const fn = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  return hash;
}

export default function App() {
  const phase = useGame((s) => s.phase);
  const hash = useHash();

  if (hash.startsWith('#/method')) return <Methodology />;
  if (phase === 'intro') return <Intro />;

  return (
    <div className="game">
      <World />

      <div className="hud hud-tl">
        <Clock />
        <StatusBar />
        <MeterBar />
      </div>

      <div className="hud hud-tr">
        <ScorePanel />
      </div>

      <div className="hud hud-bl">
        <TravelBar />
      </div>

      <div className="hud hud-bc">
        <ActionPanel />
        <Ticker />
      </div>

      <Floaters />
      <SleepPrompt />
      <EventModal />
      {phase === 'dayReport' && <DayReport />}
      {phase === 'weekReport' && <WeekReport />}

      <a className="method-fab" href="#/method" title="Methodology">?</a>
    </div>
  );
}
