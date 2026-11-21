# Maths Master Studio 📐✨

**Interactive Calculus & Differential Equations Learning Platform with Persistent Study Tracking**  
*150 Flashcards · 150 Worked Questions · 100 Live Animated Math Labs · Student Mastery Engine*

[![Live Production Site](https://img.shields.io/badge/Live-maths--master--studio.vercel.app-00dfa2?logo=vercel)](https://maths-master-studio.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?logo=vercel)](https://maths-master-studio.vercel.app)
[![Git Continuous Integration](https://img.shields.io/badge/Vercel%20Git-Connected-blue?logo=github)](https://github.com/tillu1520-cryptrium/maths-master-studio)
[![KaTeX Rendered](https://img.shields.io/badge/Math-KaTeX-312e81)](https://katex.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Live Website & Deployment

- **Production URL**: [https://maths-master-studio.vercel.app](https://maths-master-studio.vercel.app)
- **GitHub Repository**: [https://github.com/tillu1520-cryptrium/maths-master-studio](https://github.com/tillu1520-cryptrium/maths-master-studio)

---

## 🎓 Student Progress & Mastery Engine

Maths Master Studio is fully interactive with client-side persistent storage (`localStorage`):

- **Live Study Dashboard**: Circular completion ring, overall syllabus progress percentage, and metric cards for Topics Studied, Practice Questions Solved, Flashcards Mastered, and Labs Explored.
- **Topic Completion Tracking**: Mark topics complete with a single click (`Topic Completed ✓`); topic badges dynamically update in real time.
- **Chapter Roadmap Progress Bars**: Visual progress indicators for all 7 chapters showing exact percentage and topic counts.
- **Active Recall Rating**: Rate practice questions with **Recalled ✓** or **Reviewing** to keep track of difficult exam concepts.
- **Auto-Saved Lab Exploration**: Automatically marks live interactive 60 FPS simulations explored as students interact with them.
- **Study Analytics Modal**: Full syllabus breakdown, "Resume Where You Left Off" quick navigation, and JSON backup **Export** and **Import** tools.

---

## 📚 Curriculum & Features

### 1. 7 Core Chapters
- **Chapter 0 — Pre-Requisite Basics & Foundation Toolkit**: Trig identities, hyperbolic definitions, key integrals, Gamma function, and Heaviside Cover-Up Rule.
- **CO1 — Multivariable Calculus & Series Expansions**: 2D limits, path tests, Euler's theorem for homogeneous functions, 1D & 2D Taylor/Maclaurin series, $\Delta = rt - s^2$ extrema, Lagrange multipliers.
- **CO2 — First-Order Ordinary Differential Equations**: Separable, homogeneous, reducible, exact ODEs with all 4 Integrating Factor rules, linear ODEs, and Bernoulli equations.
- **CO3 — Mathematical Modeling with 1st-Order ODEs**: Mixing tanks, two-tank cascades, air circulation, Newton's law of cooling with ratio shortcuts.
- **CO4 — Second & Higher-Order Linear ODEs**: Characteristic roots, Cauchy-Euler, Legendre, Method of Undetermined Coefficients, Variation of Parameters, and mechanical/electrical resonance.
- **CO5 — Series Solutions & Special Functions**: Ordinary & regular singular points, Frobenius method, Bessel functions $J_n(x)$, Legendre polynomials $P_n(x)$, generating functions and orthogonality.
- **CO6 — Laplace & Inverse Laplace Transforms**: Standard transforms, $s$-shift, $t$-shift (Heaviside step $u(t-a)$), Dirac delta $\delta(t-a)$, $t$-multiplication, $t$-division, periodic functions, convolution theorem, and IVP solving.

### 2. 150 Interactive Flashcards
- Smooth 3D flip card animations with KaTeX mathematical formulas on front and back.
- Interactive category filtering, shuffle mode, and mastery tracking.

### 3. 150 Worked Practice Questions
- Step-by-step fully worked analytical solutions for 1M, 4M, and 6M problems.
- Rigorous intermediate steps typeset in LaTeX with "Recalled" / "Reviewing" self-assessment buttons.

### 4. 100 Live Animated Math Labs
- Real-time HTML5 Canvas interactive 60 FPS simulations.
- Responsive parameter sliders, vector field visualizers, tangent line tracers, phase portraits, and dynamic trajectory generators.

### 5. Master Cheat Sheet & Search
- Quick-reference formula studio with responsive master comparison tables.
- Instant keyboard-accessible modal search (`/` or `Ctrl+K`) spanning all chapters, formulas, and flashcards.
- Seamless Dark / Light mode toggle.
- PWA-ready: Installable on iOS and Android devices via `manifest.json`.

---

## 🛠️ Tech Stack

- **Markup & Layout**: Semantic HTML5 & [Tailwind CSS](https://tailwindcss.com/)
- **Typesetting**: [KaTeX](https://katex.org/) for rapid LaTeX formula rendering
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Visual Simulations**: HTML5 Canvas API (60fps interactive animations)
- **Client Storage**: `localStorage` JSON state engine with import/export capabilities
- **Deployment**: [Vercel](https://vercel.com) static hosting with clean URLs and security headers

---

## 💻 Local Development

Run with any static file server:

```bash
# Using Node.js
npx serve .

# Using Python
python -m http.server 3000
```

Open `http://localhost:3000` in your web browser.

---

## 📄 License

This project is open-source under the MIT License.
