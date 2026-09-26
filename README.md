<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=1600&color=58A6FF&center=true&vCenter=true&width=700&lines=Shashwat+Sharma+%E2%80%94+Fullstack+Developer;2+Published+Papers+%C2%B7+94.3%25+CV+Accuracy;From+Prototype+to+Deployed+Product)](https://git.io/typing-svg)

<br>

Fullstack Developer (React / Next.js / Node) &nbsp;&middot;&nbsp; Applied ML &amp; Explainable AI Research

Bennett University &middot; Graduated August 2026

<br>

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio-two-blush-iyk2u043f4.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shashwat-sharma-a25679252/)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:shashwatsharma122004@gmail.com)
[![LeetCode](https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)](https://leetcode.com/jonny_97)

</div>

---

<div align="center">

| 📄 2 Published Papers | 🚗 94.3% CV Accuracy | 🧮 300+ DSA Problems Solved | 🌐 Live Deployed Portfolio |
|:---:|:---:|:---:|:---:|

</div>

---

## Who I Am

I build fullstack products end-to-end — frontend, backend, and the deployment
pipeline that gets them in front of real users — and I do applied ML research
on the side. Co-author on a published IEEE conference paper using SHAP-based
explainable AI for crop prediction, and a book chapter on ML-driven food
waste reduction, both peer-reviewed and both listed below with real DOIs.

I'd rather ship something a stranger can actually open in a browser than
polish a private prototype forever — every project below has a live link, a
working repo, or a published paper behind it. No CRUD-clone tutorials.

---

## Research Publications

Two peer-reviewed papers, both grounded in real notebooks and real metrics
— not benchmark chasing.

<table>
<tr>
<td>

**Enhancing Crop Prediction with Explainable AI: A SHAP-Based Approach**
*2025 International Conference on Modeling, Simulation & Intelligent Computing (MoSICom) &middot; Peer-Reviewed &middot; Published*

Most crop-recommendation systems tell a farmer *what* to plant, not *why* —
which makes the output easy to ignore. Built a classification pipeline on
soil/environmental parameters (N, P, K, temperature, humidity, pH, rainfall)
reaching **98.64% accuracy**, then layered SHAP on top so every prediction
ships with the specific features that drove it — global feature importance
plus per-prediction attribution a non-technical user can actually interrogate.

[Read Paper (DOI) →](https://ieeexplore.ieee.org/abstract/document/11398280) &nbsp;&middot;&nbsp; [Repository →](https://github.com/Shashwatsharma97/Enhancing-Crop-Prediction-with-Explainable-AI-ASHAP-Based-Approach-)

</td>
</tr>
<tr>
<td>

**Revolutionizing Waste Management: An AI-Driven Approach Towards Sustainability**
*Book Chapter &middot; Peer-Reviewed &middot; Published*

Large-scale event catering wastes food due to inaccurate demand estimation.
Trained and compared Random Forest, Logistic Regression, and SVM classifiers
on event-level food-consumption data (guest count, food type, storage
conditions, seasonality) to predict wastage before it happens — Random
Forest was the clear winner across every test split, informing better
prep-quantity decisions instead of just describing the problem after the fact.

[Read Paper (DOI) →](https://www.taylorfrancis.com/chapters/edit/10.1201/9781003593089-140/revolutionizing-waste-management-ai-driven-approach-towards-sustainability-sankalp-bijalwan-aniket-saroj-himanshu-gupta-shashwat-sharma-saurabh-kumar-srivastava-ambrish-kumar) &nbsp;&middot;&nbsp; [Repository →](https://github.com/Shashwatsharma97/Revolutionizing-Waste-Management-An-AI-driven-Approach-Towards-Sustainability-)

</td>
</tr>
</table>

---

## Featured Projects

<table>
<tr>
<td width="50%" valign="top">

### Real-Time Driver Drowsiness Detection
`Computer Vision` `Deep Learning` `Edge Deployment`

**The problem:** systems that trigger on a single signal (eye closure alone)
throw enough false alarms that drivers start ignoring them — which quietly
defeats the entire point of the alert.

**The approach:** fuse three independent signals — Eye Aspect Ratio, Mouth
Aspect Ratio, and head-pose estimation via Dlib's 68-point facial landmark
model — and only alert when multiple thresholds breach together, not just one.

**Stack:** `Python` `OpenCV` `Dlib` `NumPy` `Flask`

**Results:** 94.3% detection accuracy &middot; 5.7% false-positive rate &middot;
real-time at 15 FPS &middot; light enough to run on a Raspberry Pi

[![Code →](https://img.shields.io/badge/View%20Code-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Shashwatsharma97/Real-Time-Driver-Drowsiness-Detection-System-By-Shashwat)

</td>
<td width="50%" valign="top">

### Portfolio — Scroll-Scrubbed Hero Video
`Next.js` `TypeScript` `Framer Motion`

**The problem:** most developer portfolios are static templates with a resume
bolted on — nothing that shows actual frontend craft.

**The approach:** a hero video whose *playback position* is bound directly to
scroll position (scroll down = video plays forward, scroll up = it reverses),
layered with Lenis inertia-based smooth scrolling and Framer Motion
scroll-triggered reveals — all hand-built, no template.

**Stack:** `Next.js` `TypeScript` `Tailwind CSS` `Framer Motion` `Lenis`

**Results:** live in production on Vercel &middot; zero backend, fully
static/client-rendered

[![Live →](https://img.shields.io/badge/Live%20Site-000000?style=flat-square&logo=vercel&logoColor=white)](https://portfolio-two-blush-iyk2u043f4.vercel.app)
[![Code →](https://img.shields.io/badge/View%20Code-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Shashwatsharma97/portfolio)

</td>
</tr>
</table>

<details>
<summary><b>+ 3 more projects (FitSync · Blackjack · SQL Basics)</b></summary>

<br>

**FitSync — Fitness Coach App** &middot; `JavaScript`
Tracks daily workouts, calories, and macronutrient goals, with weekly
progress visualized in charts — built to make logging a workout take
seconds, not a form to dread.
→ [Repository](https://github.com/Shashwatsharma97/Fit_sync)

<br>

**Blackjack** &middot; `JavaScript`
A browser-based Blackjack implementation — full game loop, hand/dealer
logic, and win/bust conditions with no framework, just DOM manipulation.
→ [Repository](https://github.com/Shashwatsharma97/Blackjack)

<br>

**SQL Basics** &middot; `SQL`
A working set of foundational SQL queries and exercises covering joins,
aggregation, and filtering — the fundamentals every backend eventually leans on.
→ [Repository](https://github.com/Shashwatsharma97/sql_basic)

</details>

---

## Technical Arsenal

<table>
<tr>
<th align="center">Fullstack</th>
<th align="center">ML / Research</th>
<th align="center">Foundations</th>
</tr>
<tr>
<td align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white)

</td>
<td align="center">

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![SHAP](https://img.shields.io/badge/SHAP-8A2BE2?style=flat-square&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white)

</td>
<td align="center">

![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&logo=cplusplus&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=flat-square&logo=mysql&logoColor=white)

</td>
</tr>
</table>

---

## What Makes Me Different

**1. I ship, not just prototype.**
Every project above is either live in production (the portfolio), published
with a DOI (both papers), or a working repo with real, verified metrics —
not a screenshot of something that only ran once on my laptop.

**2. I treat explainability as a feature, not an afterthought.**
The crop-prediction paper didn't stop at 98.64% accuracy — it added SHAP
specifically so a farmer, not a data scientist, could question the model's
reasoning. That same instinct (make the machine show its work) is why this
very README's chess game and stats are wired to genuinely live, verifiable
data instead of a static screenshot.

**3. I design for the constraints that actually matter.**
The drowsiness detector is tuned for 15 FPS on a Raspberry Pi, not a GPU
server, because that's the hardware an actual dashboard-mounted camera would
have. Real deployment constraints shape the design — they aren't an
afterthought bolted on once something "works."

---

<!-- CHESS:START -->
### 🧩 Daily Chess Puzzle (~1000 Elo)

**Winning advantage · Middlegame** &middot; **White to move.** Which move is best?

<div align="center">
<img src="https://raw.githubusercontent.com/Shashwatsharma97/Shashwatsharma97/main/chess/board.svg?v=1790411423475" alt="chess puzzle board" width="480" />
</div>

| Option | Move — click if you think this is it |
|---|---|
| **A** | [Qxg4](https://github.com/Shashwatsharma97/Shashwatsharma97/issues/new?title=puzzle%3A%200Lrf7%3A%20A&body=Just%20click%20%22Submit%20new%20issue%22%20%E2%80%94%20nothing%20else%20needed.) |
| **B** | [Nxe5](https://github.com/Shashwatsharma97/Shashwatsharma97/issues/new?title=puzzle%3A%200Lrf7%3A%20B&body=Just%20click%20%22Submit%20new%20issue%22%20%E2%80%94%20nothing%20else%20needed.) |
| **C** | [Bxg6](https://github.com/Shashwatsharma97/Shashwatsharma97/issues/new?title=puzzle%3A%200Lrf7%3A%20C&body=Just%20click%20%22Submit%20new%20issue%22%20%E2%80%94%20nothing%20else%20needed.) |
| **D** | [Qxc6+](https://github.com/Shashwatsharma97/Shashwatsharma97/issues/new?title=puzzle%3A%200Lrf7%3A%20D&body=Just%20click%20%22Submit%20new%20issue%22%20%E2%80%94%20nothing%20else%20needed.) |

0 people have solved this one so far.

<details>
<summary><b>How this works · leaderboard</b></summary>

Pick the move you think is best — clicking it opens a pre-filled GitHub
Issue, just hit **Submit new issue**. A GitHub Action checks it instantly,
tells you if you were right, and closes the issue. Guess wrong? Come back
and try again, no penalty. A fresh puzzle is picked automatically once a day.

Puzzles are real, rated positions from the
[Lichess open puzzle database](https://database.lichess.org/#puzzles) (CC0),
filtered to ones with a single clear best move around 1000 Elo. Piece
artwork: the "cburnett" set by Colin M. L. Burnett (CC BY-SA 3.0), the same
set lichess.org uses by default.

**All-time solvers**

| Solves | Who |
|---|---|
| — | no solves yet |

</details>
<!-- CHESS:END -->

---

## GitHub &amp; LeetCode Activity

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Shashwatsharma97/Shashwatsharma97/output/github-contribution-grid-snake-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Shashwatsharma97/Shashwatsharma97/output/github-contribution-grid-snake.svg" />
  <img alt="a snake eating the green squares of my GitHub contribution graph" src="https://raw.githubusercontent.com/Shashwatsharma97/Shashwatsharma97/output/github-contribution-grid-snake.svg" width="100%" />
</picture>

<br><br>

<img height="170em" src="https://github-readme-stats.vercel.app/api?username=Shashwatsharma97&show_icons=true&theme=github_dark&hide_border=true&count_private=true&include_all_commits=true" />
<img height="170em" src="https://github-readme-stats.vercel.app/api/top-langs/?username=Shashwatsharma97&layout=compact&theme=github_dark&hide_border=true&langs_count=8" />

<br>

[![GitHub Streak](https://streak-stats.demolab.com?user=Shashwatsharma97&theme=github-dark-blue&hide_border=true)](https://git.io/streak-stats)

<br>

<img src="https://leetcard.jacoblin.cool/jonny_97?theme=dark&font=Baloo%202&ext=heatmap" alt="LeetCode stats for jonny_97" />

</div>

---

## Open To

<div align="center">

Actively open to **Software Engineer &middot; Fullstack Developer &middot; SDE Intern** roles.

<br>

[![Email](https://img.shields.io/badge/shashwatsharma122004%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:shashwatsharma122004@gmail.com)
[![LinkedIn](https://img.shields.io/badge/Let's%20Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shashwat-sharma-a25679252/)

</div>

---

<div align="center">
<sub>Every claim on this profile has a live link, a repository, or a published paper behind it.</sub>
</div>
