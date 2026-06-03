// js/detail.js
import { t } from './i18n.js';
import { buildGlossaryEl } from './glossary.js';
import { buildAliasList, buildLinkified } from './linkify.js';
import { RELATIONSHIP_TYPES } from '../data/cases.js';

export function makeDetail(mount, glossary, ui, casesById) {
  let keyHandler = null;
  let opener = null;
  // The detail is a NON-blocking bottom-sheet panel, not a true modal: it doesn't
  // cover the page, so the constellation and tabs behind it stay live. Clicking
  // another judgment replaces it; a tab switch dismisses it (see app.js). Hence no
  // focus trap / background inert (those would make the still-visible page dead to
  // clicks). We keep move-focus-in, Escape-to-close, and focus-restore.
  function open(c, lang) {
    const fresh = !mount.querySelector('.card.show');
    if (fresh) opener = document.activeElement;
    const courtCls = c.court === 'CJEU' ? 'cjeu' : 'echr';
    // auto-link glossary terms + other case names found in this case's prose
    const aliasList = buildAliasList(glossary, [...casesById.values()], { excludeCaseId: c.id });
    const lz = (str) => buildLinkified(str, { aliasList, glossary, casesById, lang, onOpen: (tgt) => open(tgt, lang) });
    mount.innerHTML = `
      <div class="card show" role="dialog" aria-label="" tabindex="-1">
        <button class="close" type="button">×</button>
        <span class="pill"></span>
        <div class="title-row"><h3></h3><button class="pron-play" type="button" hidden>▶</button></div>
        <div class="pron" hidden></div>
        <div class="cid"></div>
        <p class="plain-lead"></p>
        <p class="lead"></p>
        <div class="deep-body"></div>
      </div>`;
    const card = mount.querySelector('.card');
    card.setAttribute('aria-label', t(c.shortName, lang));
    const closeBtn = mount.querySelector('.close');
    closeBtn.setAttribute('aria-label', t(ui.close, lang));
    closeBtn.addEventListener('click', close);
    // Escape closes the panel
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', keyHandler);
    card.focus();
    const pill = mount.querySelector('.pill');
    pill.classList.add(courtCls);
    pill.textContent = `${c.court} · ${String(c.date).slice(0, 4)} · ${t(c.outcome, lang)}`;
    mount.querySelector('h3').textContent = t(c.shortName, lang);
    mount.querySelector('.cid').textContent = `${t(c.procedureType, lang)} · ${c.id}`;
    // plain-English one-liner (what it means for ordinary people), then the fuller summary
    const plainEl = mount.querySelector('.plain-lead');
    if (c.plain && t(c.plain, lang)) plainEl.textContent = t(c.plain, lang); else plainEl.hidden = true;
    mount.querySelector('.lead').appendChild(lz(t(c.summary, lang)));

    // pronunciation aid (English version only): phonetic respelling + spoken audio
    if (lang === 'en' && c.pronunciation) {
      const pr = c.pronunciation;
      if (pr.phonetic) {
        const pronEl = mount.querySelector('.pron');
        pronEl.hidden = false;
        pronEl.textContent = `/ ${pr.phonetic} /`;
      }
      if (pr.audio) {
        const playBtn = mount.querySelector('.pron-play');
        playBtn.hidden = false;
        playBtn.setAttribute('aria-label', 'Hear how to pronounce ' + t(c.shortName, 'en'));
        playBtn.addEventListener('click', () => {
          try { new Audio(pr.audio).play(); } catch (e) { /* audio unavailable */ }
        });
      }
    }

    const body = mount.querySelector('.deep-body');
    const block = (labelEN, labelPL, val) => {
      if (!val || !t(val, lang)) return;
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? labelPL : labelEN;
      const p = document.createElement('p'); p.appendChild(lz(t(val, lang)));
      body.append(h, p);
    };

    // statement of facts (bullet points)
    if (c.facts?.length) {
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Stan faktyczny' : 'What happened';
      const ul = document.createElement('ul'); ul.className = 'facts-list';
      c.facts.forEach(f => { const tx = t(f, lang); if (!tx) return; const li = document.createElement('li'); li.appendChild(lz(tx)); ul.appendChild(li); });
      if (ul.children.length) body.append(h, ul);
    }
    // brief legal analysis of the violation — rendered as a highlighted callout
    if (c.violation && t(c.violation, lang)) {
      const cal = document.createElement('div'); cal.className = 'callout violation ' + courtCls;
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Naruszenie' : 'The violation';
      const p = document.createElement('p'); p.appendChild(lz(t(c.violation, lang)));
      cal.append(h, p); body.appendChild(cal);
    }

    if (c.legalBasis?.length) {
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Podstawa prawna' : 'Legal basis';
      const p = document.createElement('p');
      c.legalBasis.forEach((lb, k) => { if (k) p.append(', '); p.append(buildGlossaryEl(glossary, lb.gloss, lb.ref, lang)); });
      body.append(h, p);
    }

    if (c.relationships?.length) {
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Powiązane sprawy' : 'Related cases';
      const ul = document.createElement('ul'); ul.className = 'rel-list';
      c.relationships.forEach(r => {
        const tgt = casesById.get(r.targetId); if (!tgt) return;
        const li = document.createElement('li');
        const btn = document.createElement('button'); btn.className = 'rel-link'; btn.type = 'button';
        btn.textContent = t(tgt.shortName, lang);
        btn.addEventListener('click', () => open(tgt, lang));
        const em = document.createElement('em'); em.textContent = t(RELATIONSHIP_TYPES[r.type] ?? { en: r.type }, lang);
        li.append(btn, document.createTextNode(' — '), em);
        const note = t(r.note, lang); if (note) li.append(document.createTextNode(': ' + note));
        ul.appendChild(li);
      });
      body.append(h, ul);
    }

    if (c.execution) {
      const h = document.createElement('h4'); h.textContent = lang === 'pl' ? 'Wykonanie wyroku' : 'Execution';
      body.appendChild(h);
      block('General measures required', 'Wymagane środki generalne', c.execution.generalMeasures);
      block('Done so far', 'Co zrobiono', c.execution.doneSoFar);
      const sup = c.execution.supervision;
      if (sup && sup.latestAction) {
        const p = document.createElement('p');
        p.append(`${sup.body} (${sup.latestAction.date}): `, lz(t(sup.latestAction.text, lang)));
        body.appendChild(p);
      }
    }

    if (c.links?.length) {
      const div = document.createElement('div'); div.className = 'links';
      c.links.forEach(l => {
        const a = document.createElement('a'); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = t(l.label, lang) + ' ↗'; div.appendChild(a);
      });
      body.appendChild(div);
    }
  }
  function close() {
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    const card = mount.querySelector('.card');
    if (card) card.classList.remove('show');
    if (opener && opener.focus) opener.focus();   // return focus to the dot/opener
    opener = null;
  }
  function isOpen() { return !!mount.querySelector('.card.show'); }
  return { open, close, isOpen };
}
