import fs from 'fs';

console.log('--- EXECUTING COMPREHENSIVE SAKUGA & POLISH UPGRADE ---');

// 1. Update sakuga-vfx/progress.js
let progJs = fs.readFileSync('sakuga-vfx/progress.js', 'utf8');

const targetProgCssRegex = /\.prog \{ position: relative; padding-top: \d+px; \}[\s\S]*?font: italic 900 21px\/1\.1[\s\S]*?will-change: transform; \}/;

const replProgCss = `.prog { position: relative; padding-top: var(--sk-prog-pt, 46px); }
    :host([demo]) .prog { cursor: pointer; }
    .bar { position: relative; height: var(--sk-bar-h, 26px); border: var(--sk-bw, 3px) solid var(--sk-ink); border-radius: 9999px; background: var(--sk-card); overflow: hidden; }
    .bar i { position: relative; display: block; height: 100%; width: calc(var(--v, 0) * 100%); background: var(--sk-fill); }
    .bar i::before, .bar i::after { content: ""; position: absolute; top: 3px; height: 9px; width: 8px; background: #fff; border-radius: 2px; transform: skewX(-28deg); left: 18px; opacity: .92; }
    .bar i::after { left: 30px; width: 6px; }
    .pct { display: table; margin: 12px auto 0; padding: 2px 10px 3px; border: 2px solid var(--sk-ink); background: var(--sk-card); box-shadow: 3px 3px 0 var(--sk-fill); transform: skewX(-12deg); font: italic 900 13px/1.1 "Marker Felt", "Chalkboard SE", "Comic Sans MS", -apple-system, "Segoe UI", sans-serif; letter-spacing: -.01em; white-space: nowrap; will-change: transform; }
    :host([no-pct]) .pct, :host(.no-pct) .pct { display: none !important; }
    :host([no-pct]) .prog, :host(.no-pct) .prog { padding-top: 36px; padding-bottom: 2px; }`;

if (targetProgCssRegex.test(progJs)) {
  progJs = progJs.replace(targetProgCssRegex, replProgCss);
  progJs = progJs.replace(/gy = cy \+ b\.h \/ 2 \+ \d+;/, 'gy = cy + b.h / 2 + 16;');
  fs.writeFileSync('sakuga-vfx/progress.js', progJs, 'utf8');
  console.log('✓ Updated sakuga-vfx/progress.js with compact responsive styling and no-pct support');
}

// 2. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

// A. Fix CSS rule: remove fcSakugaProgress from hidden selector so storm-cloud bar displays
const hiddenRegex = /sakuga-tabs\[id="fcTabs"\],\s*sakuga-progress\[id="fcSakugaProgress"\],\s*sakuga-tabs\[id="masterTableTabs"\],\s*sakuga-tabs\[id="testModeSakugaTabs"\],[\s\S]*?\[hidden\] sakuga-checkbox \{\s*display: none !important;\s*\}/;

const replHiddenCss = `sakuga-tabs[id="fcTabs"],
    sakuga-tabs[id="masterTableTabs"], sakuga-tabs[id="testModeSakugaTabs"],
    .hidden sakuga-tabs, .hidden sakuga-checkbox,
    [hidden] sakuga-tabs, [hidden] sakuga-checkbox {
      display: none !important;
    }`;

if (hiddenRegex.test(html)) {
  html = html.replace(hiddenRegex, replHiddenCss);
  console.log('✓ Made fcSakugaProgress visible in CSS');
}

// B. Remove corrupted duplicate leftover block on Home Dashboard
const corruptHomeRegex = /<sakuga-progress id="dashLabsSakugaBar"[\s\S]*?<\/div>\s*<\/div>\s*<!-- End-Semester Syllabus Roadmap/;

const replCleanHome = `<sakuga-progress id="dashLabsSakugaBar" label="Labs Explored" value="\${stats.totalLabs ? (stats.doneLabs / stats.totalLabs).toFixed(2) : 0}" style="--sk-pri:#06b6d4; width:100%;" class="w-full block" no-pct></sakuga-progress>
                <div class="hidden"><div id="dashLabsBar"></div></div>
              </div>
            </div>
          </div>

          <!-- End-Semester Syllabus Roadmap`;

if (corruptHomeRegex.test(html)) {
  html = html.replace(corruptHomeRegex, replCleanHome);
  html = html.replace('id="dashTopicsSakugaBar" label="Topics Done" value="${stats.totalTopics ? (stats.doneTopics / stats.totalTopics).toFixed(2) : 0}" style="--sk-pri:#6366f1; width:100%;" class="w-full block"', 'id="dashTopicsSakugaBar" label="Topics Done" value="${stats.totalTopics ? (stats.doneTopics / stats.totalTopics).toFixed(2) : 0}" style="--sk-pri:#6366f1; width:100%;" class="w-full block" no-pct');
  html = html.replace('id="dashQsSakugaBar" label="Qs Solved" value="${stats.totalQ ? (stats.doneQ / stats.totalQ).toFixed(2) : 0}" style="--sk-pri:#10b981; width:100%;" class="w-full block"', 'id="dashQsSakugaBar" label="Qs Solved" value="${stats.totalQ ? (stats.doneQ / stats.totalQ).toFixed(2) : 0}" style="--sk-pri:#10b981; width:100%;" class="w-full block" no-pct');
  html = html.replace('id="dashCardsSakugaBar" label="Cards Known" value="${stats.totalCards ? (stats.doneCards / stats.totalCards).toFixed(2) : 0}" style="--sk-pri:#d946ef; width:100%;" class="w-full block"', 'id="dashCardsSakugaBar" label="Cards Known" value="${stats.totalCards ? (stats.doneCards / stats.totalCards).toFixed(2) : 0}" style="--sk-pri:#d946ef; width:100%;" class="w-full block" no-pct');
  console.log('✓ Cleaned up duplicate leftover elements from Home Dashboard and added no-pct');
}

// C. In renderTablesView: bind direct click listeners to [data-table-id]
const tblTabsRegex = /const tblTabs = document\.getElementById\('masterTableTabs'\);[\s\S]*?refreshIcons\(\); renderAllTex\(container\);\s*\}\);\s*\}/;

const replTblListeners = `const tblTabs = document.getElementById('masterTableTabs');
      if (tblTabs) {
        tblTabs.addEventListener('change', () => {
          state.activeTableId = tblTabs.value;
          renderTablesView(container);
          refreshIcons(); renderAllTex(container);
        });
      }

      // Direct, bulletproof click handlers on all Master Table filter pills
      container.querySelectorAll('[data-table-id]').forEach(b => {
        b.onclick = (e) => {
          e.preventDefault();
          const tid = b.dataset.tableId;
          if (state.activeTableId !== tid) {
            state.activeTableId = tid;
            renderTablesView(container);
            refreshIcons();
            renderAllTex(container);
          }
        };
      });`;

if (tblTabsRegex.test(html)) {
  html = html.replace(tblTabsRegex, replTblListeners);
  console.log('✓ Added direct click listeners to Master Tables pills');
}

// D. In renderCbtBuilder: bind direct click listeners to [data-switch-test-tab]
const testTabsRegex = /const testTabs = document\.getElementById\('testModeSakugaTabs'\);[\s\S]*?renderApp\(\);\s*\}\s*\}\);\s*\}/;

const replTestListeners = `const testTabs = document.getElementById('testModeSakugaTabs');
      if (testTabs) {
        testTabs.addEventListener('change', (e) => {
          const val = (e && e.detail && e.detail.value) || testTabs.value;
          if (val && state.testTab !== val) {
            state.testTab = val;
            renderApp();
          }
        });
      }

      // Direct, instant click handlers on Test Studio mode tabs
      container.querySelectorAll('[data-switch-test-tab]').forEach(b => {
        b.onclick = (e) => {
          e.preventDefault();
          const targetTab = b.dataset.switchTestTab;
          if (state.testTab !== targetTab) {
            state.testTab = targetTab;
            renderTestStudioView(container);
            refreshIcons();
            renderAllTex(container);
          }
        };
      });`;

if (testTabsRegex.test(html)) {
  html = html.replace(testTabsRegex, replTestListeners);
  console.log('✓ Added direct click listeners to Test Studio tabs');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Updated index.html successfully');
