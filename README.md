# Maths Master Studio 📐✨

**Interactive Calculus & Differential Equations Learning Platform**  
*150 Flashcards · 150 Worked Questions · 100 Live Animated Math Labs · Master Cheat Sheets*

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?logo=vercel)](https://vercel.com)
[![KaTeX Rendered](https://img.shields.io/badge/Math-KaTeX-312e81)](https://katex.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Overview

**Maths Master Studio** is a self-contained, high-performance interactive web application designed for students and educators mastering university-level mathematics, engineering calculus, and differential equations.

Built with an editorial daylight / midnight design language, crisp KaTeX mathematical rendering, and 60fps HTML5 Canvas animations, the studio provides zero-dependency intuitive visualizations of abstract mathematical concepts.

---

## 📚 Curriculum & Features

### 1. 7 Core Chapters
- **Chapter 0 — Foundations & Limits**: Continuity, indeterminate forms, L'Hôpital's rule, $\epsilon$-$\delta$ definitions.
- **Chapter 1 — Single-Variable Differential Calculus**: Derivatives, chain rule, mean value theorems, Taylor & Maclaurin series, curve sketching.
- **Chapter 2 — Single-Variable Integral Calculus**: Riemann sums, fundamental theorem of calculus, integration techniques, improper integrals.
- **Chapter 3 — Multivariable Calculus**: Partial derivatives, gradient vectors, directional derivatives, Lagrange multipliers, double/triple integrals.
- **Chapter 4 — Vector Calculus**: Vector fields, divergence, curl, line integrals, Green's Theorem, Stokes' Theorem, Divergence Theorem.
- **Chapter 5 — Ordinary Differential Equations (ODEs)**: First-order ODEs, separation of variables, integrating factors, second-order linear ODEs, Laplace transforms.
- **Chapter 6 — Partial Differential Equations & Series (PDEs)**: Heat equation, wave equation, Laplace's equation, Fourier series & boundary value problems.

### 2. 150 Interactive Flashcards
- Smooth 3D flip card animations with KaTeX mathematical formulas on front and back.
- Interactive category filtering, shuffle mode, and mastery tracking.

### 3. 150 Worked Practice Questions
- Step-by-step fully worked analytical solutions.
- Rigorous intermediate steps typeset in LaTeX.

### 4. 100 Live Animated Math Labs
- Real-time HTML5 Canvas interactive simulations.
- Responsive parameter sliders, vector field visualizers, tangent line tracers, and phase portraits.

### 5. Master Cheat Sheet & Search
- Quick-reference formula studio with responsive master comparison tables.
- Instant keyboard-accessible modal search (`/` hotkey) spanning all chapters, formulas, and labs.
- Seamless Dark / Light mode toggle.
- PWA-ready: Installable on iOS and Android devices via `manifest.json`.

---

## 🛠️ Tech Stack

- **Markup & Layout**: Semantic HTML5 & [Tailwind CSS](https://tailwindcss.com/)
- **Typesetting**: [KaTeX](https://katex.org/) for rapid LaTeX formula rendering
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Visual Simulations**: HTML5 Canvas API (60fps interactive animations)
- **Deployment**: [Vercel](https://vercel.com) static hosting with clean URLs and security headers

---

## 💻 Local Development

Run with any static file server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve .
```

Open `http://localhost:3000` in your web browser.

---

## 📄 License

This project is open-source under the MIT License.
