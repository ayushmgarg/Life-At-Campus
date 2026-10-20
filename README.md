# Campus Life Simulator

Play one week of college life. Sleep, meals, gym, lectures, screens, friends, the campus dogs — the
**College Lifestyle Score** updates live on the same model the project dashboard uses.

![score](https://img.shields.io/badge/pillars-6%20%2B%20social-23b8a7) 

## Play

Double-click **`CampusLifeSimulator.html`** — one file, nothing to install.

## Commands

```bat
play.cmd      :: open the simulator
dev.cmd       :: dev server with hot reload (localhost:5173)
build.cmd     :: install, build dist/ + the single file, clean up node_modules
```

## How it scores

Six pillars with the project's weights — Sleep 20%, Diet 15%, Physical Activity 20%, Screen Time
15%, Academic Stress 15%, Mental Wellbeing 15%. The tables behind them were recovered from the 37
already-scored survey responses and reproduce that sheet exactly for four pillars (Diet 36/37,
Mental Wellbeing fitted). An **extended model** adds Social & Relationships at 12% from the form's
Section J; switch between the two in the app.

Full write-up, validation table, anomaly rules and limits: the **Methodology** page inside the app
(`#/method`).

## Layout

```
src/scoring/   the scoring model
src/game/      map, actions, events, anomalies, state
src/components/ campus, character rig, HUD, reports, methodology
src/data/      cohort.json, generated from the survey responses
tools/         data build + single-file bundler
dist/          built web app
```

React 18 · Vite 5 · zustand · framer-motion · Chart.js. All art is SVG written in this repo.
