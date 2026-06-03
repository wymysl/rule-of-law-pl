// data/reading.js
// Curated, publicly accessible reading list. Item labels/sources are external
// publication titles (kept as-is); only the section headings + intro are bilingual.
export const READING = {
  intro: {
    en: 'A curated, publicly accessible reading list — from broad explainers to specialist legal analysis. All sources are external and open in a new tab.',
    pl: 'Wybrana, publicznie dostępna lista lektur — od ogólnych wprowadzeń po specjalistyczne analizy prawne. Wszystkie źródła są zewnętrzne i otwierają się w nowej karcie.' },
  groups: [
    { title: { en: 'Big-picture explainers — start here', pl: 'Ogólne wprowadzenie — zacznij tutaj' },
      items: [
        { label: 'Poland\u2019s ongoing rule-of-law crisis explained', source: 'Notes from Poland', url: 'https://notesfrompoland.com/2025/03/17/polands-ongoing-rule-of-law-crisis-explained/' },
        { label: 'The Collapse of Judicial Independence in Poland: A Cautionary Tale', source: 'Duke Judicature', url: 'https://judicature.duke.edu/articles/the-collapse-of-judicial-independence-in-poland-a-cautionary-tale/' },
        { label: 'Poland\u2019s New Government Will Face Hurdles to Restore Rule of Law', source: 'Just Security', url: 'https://www.justsecurity.org/90627/polands-new-government-will-face-hurdles-to-restore-rule-of-law-and-judicial-independence/' },
        { label: 'The difficulties of restoring democracy in Poland', source: 'Centre for European Reform', url: 'https://www.cer.eu/insights/difficulties-restoring-democracy-poland' },
      ] },
    { title: { en: 'Official & primary documents', pl: 'Dokumenty oficjalne i \u017ar\u00f3d\u0142owe' },
      items: [
        { label: 'Poland \u2014 press country profile', source: 'ECtHR', url: 'https://www.echr.coe.int/documents/d/echr/cp_poland_eng' },
        { label: 'Practice Direction on interim measures (Rule 39)', source: 'ECtHR', url: 'https://www.echr.coe.int/documents/d/echr/pd_interim_measures_eng' },
        { label: 'Opinion CDL-AD(2017)031 on the 2017 judicial laws', source: 'Venice Commission', url: 'https://www.venice.coe.int/webforms/documents/default.aspx?pdffile=CDL-AD(2017)031-e' },
        { label: '2024 Opinion on the draft law amending the National Council of the Judiciary', source: 'Venice Commission', url: 'https://www.venice.coe.int/webforms/documents/default.aspx?pdffile=CDL-AD(2024)029-e' },
        { label: 'How Poland\u2019s reforms unlocked up to \u20ac137bn in EU funds (2024)', source: 'European Commission', url: 'https://ec.europa.eu/regional_policy/whats-new/newsroom/29-02-2024-poland-s-efforts-to-restore-rule-of-law-pave-the-way-for-accessing-up-to-eur137-billion-in-eu-funds_en' },
      ] },
    { title: { en: 'Commentary on the key ECtHR judgments', pl: 'Komentarze do kluczowych wyrok\u00f3w ETPC' },
      items: [
        { label: 'Reczkowicz v. Poland', source: 'Strasbourg Observers', url: 'https://strasbourgobservers.com/2021/10/26/when-is-a-tribunal-not-a-tribunal-poland-loses-again-as-the-european-court-of-human-rights-declares-the-disciplinary-chamber-not-to-be-a-tribunal-established-by-law-in-reczkowicz-v-poland/' },
        { label: 'Grz\u0119da v. Poland', source: 'Strasbourg Observers', url: 'https://strasbourgobservers.com/2022/05/26/the-polish-judicial-reforms-under-the-grand-chambers-scrutiny-much-fog-about-nothing-a-comment-of-grzeda-v-poland/' },
        { label: 'Wa\u0142\u0119sa v. Poland', source: 'Strasbourg Observers', url: 'https://strasbourgobservers.com/2023/12/08/walesa-v-poland-a-forceful-culmination-of-the-courts-rule-of-law-case-law/' },
        { label: 'M.L. v. Poland (abortion & the captured Tribunal)', source: 'Strasbourg Observers', url: 'https://strasbourgobservers.com/2024/04/19/m-l-v-poland-potential-to-liberalise-womens-abortion-rights/' },
        { label: '\u201cHundreds of judges appointed in violation of the ECHR?\u201d', source: 'Verfassungsblog', url: 'https://verfassungsblog.de/hundreds-of-judges-appointed-in-violation-of-the-echr/' },
      ] },
    { title: { en: 'Commentary on the key CJEU judgments', pl: 'Komentarze do kluczowych wyrok\u00f3w TSUE' },
      items: [
        { label: 'Protecting Polish Judges from Political Control (C-791/19 + C-204/21)', source: 'Verfassungsblog', url: 'https://verfassungsblog.de/protecting-polish-judges-from-political-control/' },
        { label: 'Null and Void: the CJEU on the Extraordinary Review Chamber (CERPA)', source: 'Verfassungsblog', url: 'https://verfassungsblog.de/cjeu-poland-supremecourt/' },
        { label: 'European Arrest Warrant & judicial independence (LM/Celmer, C-216/18)', source: 'European Law Blog', url: 'https://www.europeanlawblog.eu/pub/european-arrest-warrant-and-judicial-independence-in-poland-where-can-mutual-trust-end-opinion-of-the-ag-in-c-216-18-ppu-l-m/release/1' },
      ] },
    { title: { en: 'Restoration & the \u201cneo-judges\u201d problem', pl: 'Naprawa i problem \u201eneos\u0119dzi\u00f3w\u201d' },
      items: [
        { label: 'Judicial Transitology: What to Do with Poland\u2019s Neo-Judges', source: 'Verfassungsblog', url: 'https://verfassungsblog.de/judicial-transitology/' },
        { label: 'The Disciplinary Chamber May Go \u2013 but the Rotten System Will Stay', source: 'Verfassungsblog', url: 'https://verfassungsblog.de/the-disciplinary-chamber-may-go-but-the-rotten-system-will-stay/' },
        { label: 'The Venice Commission against blanket removal of neo-judges', source: 'European Implementation Network', url: 'https://www.einnetwork.org/blog-five/independence-of-the-judiciary-in-poland-the-venice-commission-against-the-possibility-of-a-blanket-removal-of-all-neo-judges' },
        { label: 'Fixing the Problem of Unlawfully Appointed Judges in Poland', source: 'Hague Journal on the Rule of Law', url: 'https://link.springer.com/article/10.1007/s40803-023-00191-3' },
        { label: 'Restoring the Rule of Law in Poland', source: 'German Marshall Fund (PDF)', url: 'https://www.gmfus.org/sites/default/files/2024-06/Wojcik%20-%20Poland%20RoL%20-%20brief.pdf' },
      ] },
    { title: { en: 'EU funds & conditionality', pl: 'Fundusze UE i warunkowo\u015b\u0107' },
      items: [
        { label: 'Freezing EU funds: an effective tool to enforce the rule of law?', source: 'Centre for European Reform', url: 'https://www.cer.eu/insights/freezing-eu-funds-effective-tool-enforce-rule-law' },
        { label: 'Rule-of-law \u201csuper milestones\u201d in the Recovery and Resilience Facility', source: 'European Parliament (PDF)', url: 'https://www.europarl.europa.eu/RegData/etudes/BRIE/2023/741581/IPOL_BRI(2023)741581_EN.pdf' },
      ] },
    { title: { en: 'Trackers & ongoing monitoring', pl: 'Monitoring i bazy spraw' },
      items: [
        { label: 'Polish CJEU/ECtHR rule-of-law cases dashboard', source: 'euruleoflaw.eu', url: 'https://euruleoflaw.eu/rule-of-law/rule-of-law-dashboard-overview/polish-cases-cjeu-ecthr/' },
        { label: 'ruleoflaw.pl \u2014 ongoing monitoring & case coverage', source: 'Wiktor Osiaty\u0144ski Archive', url: 'https://ruleoflaw.pl/' },
      ] },
  ],
};
