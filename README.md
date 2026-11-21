# Maths Master Studio 📐✨

**Interactive Calculus & Differential Equations Learning Platform & CBT Exam Simulator**  
*Daily Streak 🔥 · Smart Notebooks · Custom Quiz Generator · 50M · 150 Min University CBT Exam Simulator · 150 Flashcards · 440+ Questions · 100 Live Animated Math Labs*

[![Live Production Site](https://img.shields.io/badge/Live-maths--master--studio.vercel.app-00dfa2?logo=vercel)](https://maths-master-studio.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?logo=vercel)](https://maths-master-studio.vercel.app)
[![Git Continuous Integration](https://img.shields.io/badge/Vercel%20Git-Connected-blue?logo=github)](https://github.com/tillu1520-cryptrium/maths-master-studio)
[![KaTeX Rendered](https://img.shields.io/badge/Math-KaTeX-312e81)](https://katex.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Live Website & Production Links

- **Production URL**: [https://maths-master-studio.vercel.app](https://maths-master-studio.vercel.app)
- **GitHub Repository**: [https://github.com/tillu1520-cryptrium/maths-master-studio](https://github.com/tillu1520-cryptrium/maths-master-studio)

---

## 🔥 Phase 1: Daily Streak & Smart Notebooks

### 1. Daily Practice Streak (🔥)
- **Header Flame Indicator**: Displays current consecutive days streak with pulsing fire animations.
- **Study Activity Modal**:
  - **Dynamic Streak Counter**: Tracks days active with motivational engineering mathematics quotes.
  - **Daily Goal Tracker**: Set custom targets (3, 5, 10, or 15 questions/day) with real-time animated progress bars.
  - **30-Day Activity Heatmap**: Interactive GitHub / MARKS style contribution grid showing daily study intensity with tooltips.
  - **All-Time Records**: Best streak, active days count, and total solved questions counters.

### 2. Smart Notebooks & Student Margin Notes
- **Question Categorization Buckets**:
  - 🔴 **Tricky Trap**: Questions with subtle edge cases or calculation pitfalls.
  - 🟡 **High-Yield 4M/6M**: Frequently repeated university examination questions.
  - 🟢 **Exam Eve Priority**: High-priority questions for rapid review before test day.
- **Personal Margin Scratchpads**: Expandable markdown/note scratchpads on every question card with auto-saving to local storage.
- **Formula Studio Question Filters**: Filter questions instantly by `All Qs`, `1M Rapid`, `4M Standard`, `Review Needed`, `📓 My Notes`, `🔴 Trap`, `🟡 High-Yield`, or `🟢 Exam Eve`.

---

## 🎯 Testing Center & University Exam Simulator

### Feature 1: Custom Test Generator & Quick Quiz Mode
- **Multi-Chapter Filtering**: Select any combination from Ch. 0 through CO6 with single-click "Select All" / "Clear All" controls.
- **Marks Selection**: Choose `All Marks`, `1M Rapid Sprint`, `4M Standard Analytical`, or `6M Comprehensive`.
- **Quiz Sizes**: Quick Sprint (5 Qs), Standard Practice (10 Qs), or Full Section Challenge (20 Qs).
- **Practice Mode vs. Test Mode**:
  - 💡 **Practice Mode**: Instant step-by-step KaTeX worked solution and hint available after every attempt.
  - ⏱️ **Test Mode**: Solutions hidden until final submission, real-time countdown timer, and NTA CBT question palette.

### Feature 2: 50 Marks · 150 Min University End-Semester Simulator
- **Official University Blueprint**:
  - **Section A (10 Marks Compulsory)**: 10 Rapid Conceptual Questions (1M each, covering CO1 through CO6).
  - **Section B (12 Marks Analytical)**: 3 Questions × 4 Marks (CO1 Multivariable, CO2 First Order ODE, CO3 Modeling).
  - **Section C (16 Marks Advanced)**: 4 Questions × 4 Marks (CO4 Power Series & Frobenius, CO5 Fourier Series).
  - **Section D (12 Marks Laplace Master)**: 2 Questions × 6 Marks (CO6 Laplace Transforms, IVPs & Convolutions).
- **NTA / MARKS App CBT Question Palette**:
  - ⚪ **Grey**: Not Visited
  - 🔴 **Red**: Visited but Unanswered
  - 🟢 **Green**: Answered
  - 🟣 **Purple**: Marked for Review
  - 🟣🟢 **Purple with Dot**: Answered & Marked for Review
- **Live Countdown Timer**: 150:00 countdown timer with amber visual warning at 30 minutes and red pulsing alert at 10 minutes.
- **Digital Scratchpad**: In-exam student scratchpad with "Solved on paper" confirmation and confidence ratings (`🟢 High`, `🟡 Moderate`, `🔴 Guess`).
- **Post-Exam Scorecard & Analytics**:
  - Score ring gauge and university letter grades (`O · Outstanding`, `E · Excellent`, `A · Very Good`, `B · Good`, `C · Average`).
  - Performance breakdown by Course Outcome (CO1–CO6) and question marks (1M, 4M, 6M).
  - Comprehensive question review with step-by-step LaTeX worked solutions and "Add to Notebook" buttons.

---

## 📚 Core Curriculum & Chapters

1. **Chapter 0 — Pre-Requisite Basics & Foundation Toolkit**: Trig power-reduction, hyperbolic definitions, key integrals, Gamma function, and Heaviside Cover-Up Rule.
2. **CO1 — Multivariable Calculus & Series Expansions**: 2D limits, path tests, Euler's theorem, 1D & 2D Taylor series, $\Delta = rt - s^2$ extrema, Lagrange multipliers.
3. **CO2 — First-Order Ordinary Differential Equations**: Separable, homogeneous, exact ODEs with all 4 Integrating Factor rules, linear ODEs, Bernoulli equations.
4. **CO3 — Mathematical Modeling with 1st-Order ODEs**: Mixing tanks, two-tank cascades, Newton's law of cooling with ratio shortcuts, orthogonal trajectories.
5. **CO4 — Second-Order & Higher-Order Linear ODEs**: Auxiliary equations, Pure Resonance, Method of Undetermined Coefficients, Variation of Parameters, Cauchy-Euler equations, RLC electrical circuits.
6. **CO5 — Power Series Solutions & Special Functions**: Radius of convergence (Ratio and Root tests), ordinary vs. singular points, Legendre's ODE, Rodrigues formula, Airy equation.
7. **CO6 — Laplace & Inverse Laplace Transforms**: Exponential order, $s$-shifting, $t$-multiplication, $t$-division, Dirac delta, unit step function, Convolution Theorem, solving IVPs.

---

## 🛠️ Tech Stack & Architecture

- **Vanilla HTML5, Tailwind CSS, JavaScript (ES6+)**: Zero runtime framework overhead, 60 FPS buttery smooth transitions.
- **KaTeX**: Blazing fast client-side LaTeX mathematics rendering.
- **PWA Service Worker (`sw.js`)**: Full offline caching of local application assets, question bank, and CDN libraries.
- **Client-Side Persistence (`localStorage`)**: Daily streak, custom notebook tags, student margin notes, completed topics, flashcards, labs, and exam history.
- **Vercel Edge Network**: Clean static routing, immutable asset caching, and automated Git continuous deployment.

---

## 📄 License

MIT License — Built for engineering mathematics students worldwide.
