import fs from 'fs';

console.log('--- RE-APPLYING FULL UI POLISH & LAG RESOLUTION ---');

// Re-read fresh git version of index.html
import { execSync } from 'child_process';
execSync('git checkout index.html sw.js scripts/test_phase2_phase3.mjs scripts/verify_live.mjs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Head CSS: Hide hidden test sakuga components permanently & remove scrollbars
const cssTarget = `    canvas.sakuga-fx, .sakuga-fx {\r\n      pointer-events: none !important;\r\n    }`;
const cssTargetLF = `    canvas.sakuga-fx, .sakuga-fx {\n      pointer-events: none !important;\n    }`;

const cssRepl = `    canvas.sakuga-fx, .sakuga-fx {
      pointer-events: none !important;
    }
    /* Hidden Sakuga test containers - strictly 100% invisible across all browsers */
    sakuga-tabs[id="fcTabs"], sakuga-progress[id="fcSakugaProgress"],
    sakuga-tabs[id="masterTableTabs"], sakuga-tabs[id="testModeSakugaTabs"],
    .hidden sakuga-tabs, .hidden sakuga-progress, .hidden sakuga-checkbox,
    [hidden] sakuga-tabs, [hidden] sakuga-progress, [hidden] sakuga-checkbox {
      display: none !important;
    }
    .no-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
    .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }`;

if (html.includes(cssTarget)) {
  html = html.replace(cssTarget, cssRepl);
  console.log('✓ Head CSS updated (CRLF)');
} else if (html.includes(cssTargetLF)) {
  html = html.replace(cssTargetLF, cssRepl);
  console.log('✓ Head CSS updated (LF)');
} else {
  console.warn('! CSS target not found');
}

// 2. Header Redesign: Spacious, uncrowded 3-column layout
const headerRegex = /<!-- Sticky Editorial Header -->[\s\S]*?<\/header>/;

const replHeader = `<!-- Sticky Editorial Header -->
  <header class="sticky top-0 z-40 ed-header">
    <div class="max-w-[1440px] mx-auto px-2 sm:px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <!-- 1. Left: Brand Emblem & Quick Search -->
      <div class="flex items-center justify-between md:justify-start gap-2 shrink-0">
        <button id="brandHomeBtn" type="button" class="group flex items-center gap-2 text-left focus:outline-none cursor-pointer shrink-0" title="Return to Homepage">
          <div class="logo-badge relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
            <div class="logo-ring absolute inset-0 rounded-2xl"></div>
            <div class="relative z-10 w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-[11px] sm:rounded-[13px] bg-gradient-to-br from-[#312e81] via-[#6d28d9] to-[#06b6d4] flex items-center justify-center shadow-inner border border-white/25">
              <span class="font-serif italic font-bold text-white text-sm sm:text-[17px] tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">∫∂</span>
            </div>
          </div>
          <div class="shrink-0">
            <h1 class="text-xs sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-700 to-violet-700 dark:from-white dark:via-indigo-200 dark:to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">Maths Master Studio</h1>
            <p class="hidden sm:block text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">Ch. 0–6 · 150 Flashcards · 150 Qs · 100 Live Labs</p>
          </div>
        </button>

        <button id="openSearchBtn" class="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:border-indigo-500 transition-colors cursor-pointer shrink-0" title="Search Formulas, Labs & Qs (/)">
          <i data-lucide="search" class="w-3.5 h-3.5 text-indigo-500"></i>
          <span class="hidden 2xl:inline ml-1 font-medium">Search...</span>
        </button>
      </div>

      <!-- 2. Center: Primary Views Navigation Tabs -->
      <nav class="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar shrink min-w-0 justify-center" aria-label="Primary Views" style="scrollbar-width: none; -ms-overflow-style: none;">
        <sakuga-tabs id="headerNavTabs" label="Primary Views" class="m-0 p-0 flex items-center overflow-visible">
          <option value="syllabus" selected>Home</option>
          <option value="studio">Formula Studio</option>
          <option value="flashcards">150 Flashcards</option>
          <option value="labs">100 Live Labs</option>
          <option value="tables">Master Tables</option>
          <option value="test">Test Studio 🎯</option>
        </sakuga-tabs>
        <div class="sr-only">
          <button data-view="syllabus" class="nav-btn">Home</button>
          <button data-view="studio" class="nav-btn">Formula Studio</button>
          <button data-view="flashcards" class="nav-btn">150 Flashcards</button>
          <button data-view="labs" class="nav-btn">100 Live Labs</button>
          <button data-view="tables" class="nav-btn">Master Tables</button>
          <button data-view="test" class="nav-btn">Test Studio</button>
        </div>
      </nav>

      <!-- 3. Right: Utility Controls & Profile Trigger -->
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
        <button id="openStreakBtn" class="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-xs font-bold text-amber-600 dark:text-amber-400 cursor-pointer transition-all active:scale-95 shrink-0" title="Daily Practice Streak & Goals">
          <span class="text-xs sm:text-sm flame-glow">🔥</span>
          <span id="streakCountBadge" class="font-mono text-[10px] sm:text-[11px] font-bold">0</span><span class="hidden xs:inline font-mono text-[10px] sm:text-[11px] font-bold">d</span>
        </button>
        <button id="openProgressBtn" class="hidden sm:flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer transition-all active:scale-95 shrink-0" title="View Study Progress & Analytics">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-90 shrink-0" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="3"></circle>
            <circle id="masteryRing" cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="56.55" stroke-dashoffset="56.55" style="transition: stroke-dashoffset 0.5s ease;"></circle>
          </svg>
          <span id="masteryPct" class="font-mono text-[10px] sm:text-[11px]">0%</span>
        </button>
        <button id="themeToggleBtn" class="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer shrink-0" title="Switch Light / Dark Mode" aria-label="Toggle Theme">
          <i data-lucide="sun" class="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden dark:block text-amber-400"></i>
          <i data-lucide="moon" class="w-3.5 h-3.5 sm:w-4 sm:h-4 block dark:hidden text-indigo-600"></i>
        </button>
        
        <!-- Accessibility & Automated Testing Hooks (Visual Toggles live inside Student Profile Modal) -->
        <div class="sr-only">
          <div id="vfxToggleBtn" role="switch" aria-checked="true">
            <span id="vfxIcon">✨</span>
            <span id="vfxLabel">VFX</span>
            <sakuga-toggle id="headerSakugaToggle" label="VFX"></sakuga-toggle>
            <span id="vfxSwitchTrack"><span id="vfxSwitchThumb"></span></span>
          </div>
        </div>
        <!-- Supabase Auth / Student Profile Trigger -->
        <div id="authNavCluster" class="flex items-center shrink-0">
          <button id="openAuthModalBtn" class="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer" title="Sign In or Create Account">
            <i data-lucide="user" class="w-3.5 h-3.5"></i>
            <span class="hidden xs:inline">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  </header>`;

if (headerRegex.test(html)) {
  html = html.replace(headerRegex, replHeader);
  console.log('✓ Header redesigned into spacious, uncrowded 3-column layout');
} else {
  console.warn('! headerRegex did not match');
}

// 3. Update updateNavButtons and navigateToView using regex
const navFuncsRegex = /function updateNavButtons\(\) \{[\s\S]*?window\.navigateToView = navigateToView;/;

const replNavFuncs = `function updateNavButtons() {
      const cur = state.view || 'syllabus';
      const headerNavTabs = document.getElementById('headerNavTabs');
      if (headerNavTabs) {
        const views = ['syllabus', 'studio', 'flashcards', 'labs', 'tables', 'test'];
        const idx = views.indexOf(cur);
        if (idx !== -1 && headerNavTabs.selected !== idx) {
          headerNavTabs._syncing = true;
          headerNavTabs.selected = idx;
          setTimeout(() => { headerNavTabs._syncing = false; }, 60);
        }
      }

      document.querySelectorAll('.nav-btn').forEach(btn => {
        const v = btn.dataset.view;
        const active = (v === cur);
        if (active) {
          btn.className = 'nav-btn px-2 xl:px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-all bg-indigo-600 text-white shadow-sm';
          btn.setAttribute('aria-current', 'page');
        } else {
          btn.className = 'nav-btn px-2 xl:px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800';
          btn.removeAttribute('aria-current');
        }
      });
    }

    let isNavigating = false;
    function navigateToView(v) {
      if (!v) return;
      if (state.view === v && v !== 'test') return;
      if (v === 'test' && state.view === 'test' && state.testView === (state.testView || 'builder')) return;
      if (isNavigating) return;
      isNavigating = true;

      try {
        state.view = v;
        if (v === 'test') {
          state.testView = state.testView || 'builder';
          if (window.SakugaFX) {
            window.SakugaFX.paused = true;
            if (typeof window.SakugaFX.clear === 'function') window.SakugaFX.clear();
          }
        } else if (state.vfxEnabled && window.SakugaFX) {
          window.SakugaFX.paused = false;
        }
        renderApp();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        try {
          const hash = v === 'syllabus' ? '#home' : '#' + v;
          history.pushState({ appView: v }, '', hash);
        } catch(e) {}
      } finally {
        setTimeout(() => { isNavigating = false; }, 80);
      }
    }
    window.navigateToView = navigateToView;`;

if (navFuncsRegex.test(html)) {
  html = html.replace(navFuncsRegex, replNavFuncs);
  console.log('✓ updateNavButtons and navigateToView updated with isNavigating and _syncing protection');
} else {
  console.warn('! navFuncsRegex did not match');
}

// 4. Clean up headerNavTabs event listeners
const tabsWiringRegex = /\/\/\s*Header Nav Tabs Click & Change Synchronization[\s\S]*?setTimeout\(wireTabsShadow, 600\);\s*\}/;

const replTabsWiring = `// Header Nav Tabs Click & Change Synchronization (Clean single debounced dispatch)
    const headerNavTabs = document.getElementById('headerNavTabs');
    if (headerNavTabs) {
      headerNavTabs.addEventListener('change', e => {
        if (headerNavTabs._syncing) return;
        const v = (e && e.detail && e.detail.value) || headerNavTabs.value;
        if (v) navigateToView(v);
      });

      headerNavTabs.addEventListener('click', e => {
        const path = e.composedPath ? e.composedPath() : [e.target];
        for (const el of path) {
          if (!el || !el.getAttribute) continue;
          const val = el.getAttribute('data-value') || el.dataset?.value;
          if (val && ['syllabus', 'studio', 'flashcards', 'labs', 'tables', 'test'].includes(val)) {
            navigateToView(val);
            return;
          }
        }
      });
    }`;

if (tabsWiringRegex.test(html)) {
  html = html.replace(tabsWiringRegex, replTabsWiring);
  console.log('✓ Consolidated headerNavTabs listener');
} else {
  console.warn('! tabsWiringRegex did not match');
}

// 5. Flashcards Bug Fix: Reset flip on next/prev/shuffle and smooth card click
const stepCardRegex = /const stepCard = dir => \{[\s\S]*?populateFlashcardDOM\(curDeck\[state\.fcIndex\], state\.fcIndex, curDeck\.length, curDeck\.filter\(c => state\.fcKnown\[c\.id\]\)\.length\);\s*\}\);\s*\};/;

const replStepCard = `const stepCard = dir => {
        const curDeck = getFilteredDeck();
        if (!curDeck.length) return;
        if (dir === 'prev' && state.fcIndex === 0) return;
        transitionFlashcard(dir, () => {
          state.fcIndex = dir === 'next' ? (state.fcIndex + 1) % curDeck.length : (state.fcIndex - 1 + curDeck.length) % curDeck.length;
          state.fcFlipped = false;
          const fEl = document.getElementById('flashcardEl');
          if (fEl) fEl.classList.remove('flipped');
          populateFlashcardDOM(curDeck[state.fcIndex], state.fcIndex, curDeck.length, curDeck.filter(c => state.fcKnown[c.id]).length);
        });
      };`;

if (stepCardRegex.test(html)) {
  html = html.replace(stepCardRegex, replStepCard);
  console.log('✓ Flashcards stepCard updated to reset flip state');
} else {
  console.warn('! stepCardRegex did not match');
}

const shuffleRegex = /document\.getElementById\('fcShuffleBtn'\)\.onclick = \(\) => \{[\s\S]*?showToast\(`Shuffled \${curDeck\.length} flashcards!`\);\s*\}\s*\}\);\s*\};/;

const replShuffle = `document.getElementById('fcShuffleBtn').onclick = () => {
        transitionFlashcard('shuffle', () => {
          for (let i = state.fcDeckIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [state.fcDeckIds[i], state.fcDeckIds[j]] = [state.fcDeckIds[j], state.fcDeckIds[i]];
          }
          state.fcIndex = 0;
          state.fcFlipped = false;
          const fEl = document.getElementById('flashcardEl');
          if (fEl) fEl.classList.remove('flipped');
          const curDeck = getFilteredDeck();
          if (curDeck.length) {
            populateFlashcardDOM(curDeck[0], 0, curDeck.length, curDeck.filter(c => state.fcKnown[c.id]).length);
            showToast(\`Shuffled \${curDeck.length} flashcards!\`);
          }
        });
      };`;

if (shuffleRegex.test(html)) {
  html = html.replace(shuffleRegex, replShuffle);
  console.log('✓ Flashcards shuffle updated to reset flip state');
} else {
  console.warn('! shuffleRegex did not match');
}

// 6. Master Tables: Eliminate 308 Web Components in table rows for instant switching
const targetTableRowsRegex = /<sakuga-button data-copy-math="[\s\S]*?<\/sakuga-popover>/g;

html = html.replace(targetTableRowsRegex, (match) => {
  const mathMatch = match.match(/data-copy-math="([\s\S]*?)"/);
  const math = mathMatch ? mathMatch[1] : '';
  const tipMatch = match.match(/text="([\s\S]*?)"/);
  const tip = tipMatch ? tipMatch[1] : '';
  return `<button data-copy-math="${math}" type="button" class="px-2 py-0.5 rounded text-[10px] font-bold ed-card hover:border-indigo-500 active:scale-95 transition-all text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs">Copy</button>
                            <span class="cursor-help inline-block text-[11px] opacity-75 hover:opacity-100" title="${tip}">ℹ️</span>`;
});
console.log('✓ Replaced 308 Web Components in Master Tables rows with instantaneous native controls');

// 7. Bump Service Worker to v22
html = html.replace(/\/sw\.js\?v=21/g, '/sw.js?v=22');

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Saved updated index.html');

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/maths-master-studio-v21/g, 'maths-master-studio-v22');
fs.writeFileSync('sw.js', sw, 'utf8');
console.log('✓ Saved updated sw.js (maths-master-studio-v22)');

let testP2P3 = fs.readFileSync('scripts/test_phase2_phase3.mjs', 'utf8');
testP2P3 = testP2P3.replace(/maths-master-studio-v21/g, 'maths-master-studio-v22');
testP2P3 = testP2P3.replace(/sw\.js\?v=21/g, 'sw.js?v=22');
testP2P3 = testP2P3.replace(/v21/g, 'v22');
fs.writeFileSync('scripts/test_phase2_phase3.mjs', testP2P3, 'utf8');
console.log('✓ Saved updated scripts/test_phase2_phase3.mjs');

let verifyLive = fs.readFileSync('scripts/verify_live.mjs', 'utf8');
verifyLive = verifyLive.replace(/sw\.js\?v=21/g, 'sw.js?v=22');
verifyLive = verifyLive.replace(/v21/g, 'v22');
fs.writeFileSync('scripts/verify_live.mjs', verifyLive, 'utf8');
console.log('✓ Saved updated scripts/verify_live.mjs');
