// js/story.js
// Apple-keynote-style scroll story: a full-screen takeover of stacked
// viewport-height panels you scroll through, each revealing (fade + rise) as it
// enters view, with a side progress rail. Esc exits; "See the full case" closes
// the story and opens that case's detail. Reduced-motion safe.
import { t } from './i18n.js';
import { setBackgroundInert } from './modal-util.js';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function makeStory(mount, { story, casesById, ui }, onCaseOpen) {
  let lang = 'en', opener = null, obs = null, keyHandler = null;
  let audio = null, cues = null, audioStepIdx = -1;
  const steps = story.steps;

  // Fully stop and release the current audio (incl. any blob object URL).
  function stopAudio() {
    if (!audio) return;
    try { audio.pause(); } catch (e) {}
    if (audio.__objUrl) { try { URL.revokeObjectURL(audio.__objUrl); } catch (e) {} }
    audio = null; cues = null; audioStepIdx = -1;
  }

  // Start time (seconds) of each step's narration. Uses explicit audioCues when
  // supplied; otherwise estimates from each step's word count scaled to the
  // audio's real duration so the section breaks line up with the actual file.
  function computeCues(duration) {
    if (Array.isArray(story.audioCues) && story.audioCues.length === steps.length) {
      return story.audioCues.slice();
    }
    const words = steps.map(s => ((s.narration && s.narration.en) || '').trim().split(/\s+/).filter(Boolean).length);
    const total = words.reduce((a, b) => a + b, 0) || 1;
    const out = []; let cum = 0;
    for (let i = 0; i < words.length; i++) { out.push((cum / total) * duration); cum += words[i]; }
    return out;
  }

  // SVG glyphs for the play / pause control (match the system's 2px-stroke look)
  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>';

  function caseSnapshot(c) {
    const box = el('div', 'story-case');
    box.append(
      el('span', 'pill ' + (c.court === 'CJEU' ? 'cjeu' : 'echr'),
        `${c.court} · ${String(c.date).slice(0, 4)} · ${t(c.outcome, lang)}`),
      el('span', 'story-case-name', t(c.shortName, lang)),
    );
    const openBtn = el('button', 'story-open', (lang === 'pl' ? 'Zobacz pełną sprawę' : 'See the full case') + ' →');
    openBtn.type = 'button';
    openBtn.addEventListener('click', () => { close(); onCaseOpen(c); });
    box.appendChild(openBtn);
    return box;
  }

  function statBand(stats) {
    const band = el('div', 'story-stats');
    stats.forEach(s => {
      const it = el('div', 'story-stat' + (s.word ? ' is-word' : ''));
      it.append(el('div', 's-num', t(s.num, lang)), el('div', 's-lbl', t(s.label, lang)));
      band.appendChild(it);
    });
    return band;
  }

  function open(currentLang) {
    // re-entrant safe: tear down any prior run's listeners/audio first
    if (obs) { obs.disconnect(); obs = null; }
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    stopAudio();
    lang = currentLang || 'en';
    opener = document.activeElement;
    setBackgroundInert(true);
    mount.innerHTML = '';
    mount.hidden = false;
    mount.tabIndex = -1;
    mount.setAttribute('role', 'region');
    mount.setAttribute('aria-label', t(story.title, lang));

    const closeBtn = el('button', 'story-close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', t(ui.close, lang));
    closeBtn.addEventListener('click', close);

    const rail = el('div', 'story-rail');
    rail.setAttribute('aria-hidden', 'true');

    const panels = [];
    steps.forEach((step, i) => {
      const panel = el('section', 'story-panel');
      panel.dataset.step = String(i);
      const inner = el('div', 'story-panel-inner');
      inner.appendChild(el('div', 'story-kicker', t(step.kicker, lang)));
      const c = step.caseId ? casesById.get(step.caseId) : null;
      const headingText = step.heading ? t(step.heading, lang) : (c ? t(c.shortName, lang) : '');
      if (headingText) inner.appendChild(el('h2', 'story-heading', headingText));
      inner.appendChild(el('p', 'story-narration', t(step.narration, lang)));
      if (c) inner.appendChild(caseSnapshot(c));
      if (step.stats) inner.appendChild(statBand(step.stats));
      panel.appendChild(inner);
      mount.appendChild(panel);
      panels.push(panel);

      const dot = el('button', 'story-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', `${i + 1} / ${steps.length}`);
      dot.addEventListener('click', () => {
        if (audio && cues) { try { audio.currentTime = cues[i] + 0.01; audioStepIdx = i; } catch (e) {} }
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      rail.appendChild(dot);
    });

    // scroll cue on the first panel
    panels[0].querySelector('.story-panel-inner')
      .appendChild(el('div', 'story-hint', (lang === 'pl' ? 'przewiń' : 'scroll') + ' ↓'));

    mount.append(rail, closeBtn);

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // true only briefly after real user input (wheel/touch/keys) — so the
    // audio-driven auto-scroll never gets mistaken for a manual scroll
    let userScrolling = false, userScrollTimer = 0;
    const markUserScroll = () => { userScrolling = true; clearTimeout(userScrollTimer); userScrollTimer = setTimeout(() => { userScrolling = false; }, 200); };

    // ── Narration audio + auto-scroll ──────────────────────────────────────
    // The audio is the English narration; the control is offered in English.
    if (story.audio && lang === 'en') {
      const wrap = el('div', 'story-audio');
      const btn = el('button', 'story-audio-btn');
      btn.type = 'button';
      btn.innerHTML = ICON_PLAY;
      btn.setAttribute('aria-label', t(ui.storyAudio.play, lang));
      const meta = el('div', 'story-audio-meta');
      meta.append(
        el('span', 'story-audio-label', t(ui.storyAudio.label, lang)),
        (() => { const track = el('div', 'story-audio-track'); track.appendChild(el('div', 'story-audio-fill')); return track; })(),
      );
      wrap.append(btn, meta);
      mount.appendChild(wrap);
      const fill = wrap.querySelector('.story-audio-fill');

      // tag this instance; any handler from a superseded audio bails immediately
      const a = new Audio();
      audio = a;
      a.preload = 'metadata';
      // Fetch the whole file as a Blob and play from an object URL. Many static
      // hosts (and this preview) don't honour HTTP range requests, which leaves
      // the media element NON-SEEKABLE (seekable = [0,0]) so every currentTime
      // assignment snaps back to 0. A blob URL holds the full resource locally,
      // making it fully seekable — which is what the dot/scroll syncing needs.
      let pendingPlay = false;
      fetch(story.audio)
        .then(r => (r.ok ? r.blob() : Promise.reject(r.status)))
        .then(blob => {
          if (audio !== a) return;
          a.__objUrl = URL.createObjectURL(blob); a.src = a.__objUrl;
          if (pendingPlay) { pendingPlay = false; a.play().catch(() => {}); }
        })
        .catch(() => { if (audio === a && !a.src) { a.src = story.audio; if (pendingPlay) { pendingPlay = false; a.play().catch(() => {}); } } });
      // explicit cues are known up front — make seeking work before metadata loads
      if (Array.isArray(story.audioCues) && story.audioCues.length === steps.length) cues = story.audioCues.slice();

      const scrollToStep = (idx) => {
        if (!panels[idx]) return;
        audioStepIdx = idx;
        panels[idx].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      };

      a.addEventListener('loadedmetadata', () => { if (audio !== a) return; cues = computeCues(a.duration || 0); });

      a.addEventListener('timeupdate', () => {
        if (audio !== a) return;
        if (a.duration) fill.style.width = (a.currentTime / a.duration * 100) + '%';
        if (!cues) return;
        // current section = last cue at or before the playhead
        let idx = 0;
        for (let k = 0; k < cues.length; k++) { if (a.currentTime >= cues[k] - 0.05) idx = k; else break; }
        if (idx !== audioStepIdx) scrollToStep(idx);
      });

      const setPlaying = (on) => {
        wrap.classList.toggle('playing', on);
        btn.innerHTML = on ? ICON_PAUSE : ICON_PLAY;
        btn.setAttribute('aria-label', t(on ? ui.storyAudio.pause : ui.storyAudio.play, lang));
      };
      a.addEventListener('play',  () => { if (audio === a) setPlaying(true); });
      a.addEventListener('pause', () => { if (audio === a) setPlaying(false); });
      a.addEventListener('ended', () => { if (audio === a) setPlaying(false); });

      btn.addEventListener('click', () => {
        if (audio !== a) return;
        if (a.paused) {
          if (!cues && a.duration) cues = computeCues(a.duration);
          if (a.src) { a.play().catch(() => {}); }
          else { pendingPlay = true; setPlaying(true); }   // blob still downloading — play once ready
        } else {
          pendingPlay = false;
          a.pause();
        }
      });
    }

    const setActive = (idx) => [...rail.children].forEach((d, k) => d.classList.toggle('on', k === idx));
    panels[0].classList.add('in');   // first screen is visible immediately
    setActive(0);

    if (reduce) {
      panels.forEach(p => p.classList.add('in'));
    } else {
      // reveal a panel as soon as it enters (robust even when a panel is taller
      // than the viewport, where a high intersection ratio is never reached)
      const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
      }, { root: mount, rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
      panels.forEach(p => revealObs.observe(p));
      // active rail dot = the panel filling the viewport centre (deterministic)
      const onScroll = () => {
        const centre = mount.scrollTop + mount.clientHeight / 2;
        let idx = 0;
        for (let k = 0; k < panels.length; k++) { if (panels[k].offsetTop <= centre) idx = k; else break; }
        setActive(idx);
        // only a genuine user scroll drives the narration — never the audio's own auto-scroll
        if (audio && cues && userScrolling && idx !== audioStepIdx) {
          if (Math.abs(audio.currentTime - cues[idx]) > 0.4) {
            try { audio.currentTime = cues[idx] + 0.01; } catch (e) {}
          }
          audioStepIdx = idx;
        }
      };
      const navKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar'];
      const onKey = (e) => { if (navKeys.includes(e.key)) markUserScroll(); };
      mount.addEventListener('scroll', onScroll, { passive: true });
      mount.addEventListener('wheel', markUserScroll, { passive: true });
      mount.addEventListener('touchmove', markUserScroll, { passive: true });
      mount.addEventListener('keydown', onKey);
      onScroll();
      obs = { disconnect() {
        revealObs.disconnect();
        mount.removeEventListener('scroll', onScroll);
        mount.removeEventListener('wheel', markUserScroll);
        mount.removeEventListener('touchmove', markUserScroll);
        mount.removeEventListener('keydown', onKey);
        clearTimeout(userScrollTimer);
      } };
    }

    keyHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', keyHandler);
    mount.scrollTop = 0;
    mount.focus();
  }

  function close() {
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    if (obs) { obs.disconnect(); obs = null; }
    stopAudio();
    mount.hidden = true;
    mount.innerHTML = '';
    setBackgroundInert(false);
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  return { open, close };
}
