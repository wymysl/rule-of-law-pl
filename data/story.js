// data/story.js
// A guided, linear walkthrough of the Polish rule-of-law crisis told through
// seven landmark judgments, bracketed by an intro and an outro. Each step has
// a few plain-language sentences of connective narration (EN+PL). Case steps
// carry a `caseId` that resolves to the full case (snapshot + "see the full
// case"). Sources for each step are noted in comments; the full citations and
// judgment links live in data/cases.js under the same caseId.
export const STORY = {
  title: { en: 'The crisis in seven judgments', pl: 'Kryzys w siedmiu wyrokach' },
  // Narration audio for story mode (English). A play button appears in the
  // story; as the audio reaches each section the story scrolls to it.
  audio: 'data/audio/story.mp3',
  // Optional precise sync. Provide one start time (in SECONDS, from the audio)
  // for EACH step below — the moment that step's narration begins. When this
  // array is present it drives the auto-scroll exactly. When it is null, the
  // app falls back to estimating each section's start from its word count
  // scaled to the audio's real duration (good, but not frame-accurate).
  // Format example for 9 steps: [0, 35, 72, 119, 165, 201, 234, 269, 309]
  audioCues: [0, 44, 85, 143, 198, 245, 285, 329, 380],
  steps: [
    {
      caseId: null,
      kicker: { en: 'Start here', pl: 'Zacznij tutaj' },
      heading: { en: 'How a government captured its courts', pl: 'Jak rząd przejął własne sądy' },
      narration: {
        en: 'Between 2015 and 2023, Poland’s then governing majority rebuilt the machinery of justice so that politicians could choose, punish, and replace judges. Two European courts pushed back: the Court of Justice of the EU in Luxembourg, which enforces the EU treaties, and the European Court of Human Rights in Strasbourg, which enforces the human-rights Convention. This is the story of that confrontation, told through seven judgments. The crisis and these judgments are complex and nuanced; this is a plain-language overview of the basics, not a complete account.',
        pl: 'W latach 2015–2023 ówczesna większość rządząca przebudowała wymiar sprawiedliwości tak, by politycy mogli wybierać, karać i zastępować sędziów. Odpowiedziały dwa europejskie trybunały: Trybunał Sprawiedliwości UE w Luksemburgu, stojący na straży traktatów, oraz Europejski Trybunał Praw Człowieka w Strasburgu, stojący na straży Konwencji. Oto historia tego starcia, opowiedziana w siedmiu wyrokach. Kryzys i te wyroki są złożone i niejednoznaczne; to przystępny przegląd podstaw, a nie pełne omówienie.' },
    },
    {
      // Xero Flor w Polsce sp. z o.o. v. Poland, no. 4907/18, ECtHR, 7 May 2021
      // (first finding that a CT bench with a "stand-in" judge is not a
      // tribunal established by law). https://hudoc.echr.coe.int/eng?i=001-210065
      caseId: '4907/18',
      kicker: { en: '1 · The Tribunal falls', pl: '1 · Upadek Trybunału' },
      narration: {
        en: 'It began in late 2015 with the Constitutional Tribunal — the court that checks laws against the constitution. The outgoing parliament had lawfully elected three judges; the new majority refused to recognise them, and the President swore in replacements to seats that were already filled. In Xero Flor (May 2021), ruling on the complaint of a small turf-growing company, Strasbourg held that a Tribunal panel including one of those replacement judges was not a “tribunal established by law” — the first judgment finding that the captured Tribunal itself violates the Convention.',
        pl: 'Zaczęło się pod koniec 2015 r. od Trybunału Konstytucyjnego — sądu badającego zgodność ustaw z konstytucją. Odchodzący Sejm wybrał zgodnie z prawem trzech sędziów; nowa większość odmówiła ich uznania, a Prezydent zaprzysiągł osoby wybrane na już obsadzone miejsca. W sprawie Xero Flor (maj 2021), rozpoznając skargę producenta trawy rolowanej, Strasburg uznał, że skład Trybunału z udziałem jednego z tych „dublerów” nie był „sądem ustanowionym ustawą” — to pierwszy wyrok stwierdzający, że przejęty Trybunał sam narusza Konwencję.' },
    },
    {
      // A.K. and Others, joined cases C-585/18, C-624/18 and C-625/18, CJEU
      // (Grand Chamber), 19 Nov 2019; applied by the Polish Supreme Court on
      // 5 Dec 2019 (III PO 7/18). https://curia.europa.eu/juris/liste.jsf?num=C-585/18
      caseId: 'C-585/18',
      kicker: { en: '2 · Capturing who picks judges', pl: '2 · Przejęcie tych, którzy wybierają sędziów' },
      narration: {
        en: 'Next came the body that proposes every judicial appointment in Poland — the National Council of the Judiciary (KRS). A December 2017 law cut short the terms of its judicial members and handed the election of their successors to parliament: judges chosen by politicians. In A.K. (November 2019), the EU Court’s Grand Chamber set out the test for whether courts staffed this way are independent — how judges are appointed, whether the Council itself is independent, how it all looks to the public — and left Poland’s Supreme Court to apply it. Within weeks it did, ruling that the new Disciplinary Chamber was not a court at all. The A.K. test became the foundation of nearly every later case.',
        pl: 'Potem przyszła kolej na organ, który wskazuje kandydatów na każde stanowisko sędziowskie w Polsce — Krajową Radę Sądownictwa (KRS). Ustawa z grudnia 2017 r. przerwała kadencje jej sędziowskich członków i powierzyła wybór następców parlamentowi: sędziów wskazują politycy. W sprawie A.K. (listopad 2019) Wielka Izba TSUE określiła test niezależności tak obsadzanych sądów — sposób powoływania sędziów, niezależność samej Rady, ogólne wrażenie w oczach obywateli — pozostawiając jego zastosowanie Sądowi Najwyższemu. Ten kilkanaście dni później orzekł, że nowa Izba Dyscyplinarna w ogóle nie jest sądem. Test z A.K. stał się fundamentem niemal każdej późniejszej sprawy.' },
    },
    {
      // Commission v Poland (disciplinary regime), C-791/19, CJEU, 15 July 2021.
      // Interim suspension orders: C-791/19 R (8 Apr 2020) and C-204/21 R
      // (14 July 2021); €1,000,000/day penalty: order of the Vice-President in
      // C-204/21 R (27 Oct 2021), halved to €500,000 (21 Apr 2023), accruing
      // until the C-204/21 judgment of 5 June 2023.
      caseId: 'C-791/19',
      kicker: { en: '3 · A chamber to punish judges', pl: '3 · Izba do karania sędziów' },
      narration: {
        en: 'The 2017 overhaul also created a Disciplinary Chamber inside the Supreme Court — staffed entirely through the new KRS — with the power to discipline judges, lift their immunity, and cut their pay. In July 2021 the EU Court held the whole disciplinary regime breached EU law: the Chamber was not independent, and judges could be punished for the content of their rulings or for referring questions to Luxembourg. The Court had ordered the Chamber suspended; when Poland kept it running, it imposed a penalty of €1,000,000 per day (October 2021), deducted from Poland’s EU funds, later halved, and accruing until the case closed in June 2023. Poland abolished the Chamber in July 2022.',
        pl: 'Przebudowa z 2017 r. utworzyła też w Sądzie Najwyższym Izbę Dyscyplinarną — w całości obsadzoną przez nową KRS — z prawem karania sędziów, uchylania ich immunitetów i obniżania wynagrodzeń. W lipcu 2021 r. TSUE uznał, że cały ten system dyscyplinarny narusza prawo UE: Izba nie była niezależna, a sędziów można było karać za treść orzeczeń albo za kierowanie pytań do Luksemburga. Trybunał nakazał wcześniej zawieszenie Izby; gdy Polska utrzymała ją w działaniu, nałożył karę 1 000 000 euro dziennie (październik 2021), potrącaną z należnych Polsce funduszy unijnych, później zmniejszoną o połowę i naliczaną aż do zamknięcia sprawy w czerwcu 2023 r. Izbę zlikwidowano w lipcu 2022 r.' },
    },
    {
      // Juszczyszyn v. Poland, no. 35599/20, ECtHR, 6 Oct 2022 (violations of
      // Art. 6 §1, Art. 8 and Art. 18 taken with Art. 8).
      // https://hudoc.echr.coe.int/eng?i=001-219563
      caseId: '35599/20',
      kicker: { en: '4 · The chamber at work', pl: '4 · Izba w działaniu' },
      narration: {
        en: 'The Chamber was put to work. In November 2019, Judge Paweł Juszczyszyn — applying the EU Court’s A.K. ruling — ordered disclosure of the endorsement lists behind the new KRS, to check whether a lower-court judge had been lawfully appointed. For that, the Disciplinary Chamber suspended him and cut his pay by 40%. In 2022 Strasbourg found his rights violated and — under the rarely used Article 18 — held that the suspension’s real purpose was to punish him and to deter every other judge from scrutinising the new appointments.',
        pl: 'Izba ruszyła do akcji. W listopadzie 2019 r. sędzia Paweł Juszczyszyn — wykonując wyrok TSUE w sprawie A.K. — zażądał ujawnienia list poparcia do nowej KRS, by sprawdzić, czy sędzia niższej instancji został powołany zgodnie z prawem. Za to Izba Dyscyplinarna zawiesiła go w czynnościach i obniżyła mu wynagrodzenie o 40%. W 2022 r. Strasburg stwierdził naruszenie jego praw, a na podstawie rzadko stosowanego art. 18 uznał, że rzeczywistym celem zawieszenia było ukaranie go i odstraszenie wszystkich innych sędziów od badania nowych powołań.' },
    },
    {
      // Reczkowicz v. Poland, no. 43447/19, ECtHR, 22 July 2021 (Disciplinary
      // Chamber not a "tribunal established by law"); extended to the other new
      // chambers by Dolińska-Ficek and Ozimek (8 Nov 2021) and Advance Pharma
      // (3 Feb 2022). https://hudoc.echr.coe.int/eng?i=001-211127
      caseId: '43447/19',
      kicker: { en: '5 · The appointments are unlawful', pl: '5 · Powołania są bezprawne' },
      narration: {
        en: 'Strasbourg then went to the root: the appointments themselves. In Reczkowicz (July 2021) it held that the Disciplinary Chamber — every member appointed on the new KRS’s recommendation — was not a “tribunal established by law”, because the politicised Council tainted the appointment procedure at its core. Follow-up judgments (Dolińska-Ficek and Ozimek; Advance Pharma) extended the same finding to the Supreme Court’s other new chambers. Anyone whose case is decided by such a bench is denied the basic right to a lawful court.',
        pl: 'Następnie Strasburg sięgnął do źródła problemu: samych powołań. W sprawie Reczkowicz (lipiec 2021) uznał, że Izba Dyscyplinarna — w całości obsadzona na wniosek nowej KRS — nie była „sądem ustanowionym ustawą”, bo upolityczniona Rada skaziła procedurę nominacyjną u jej podstaw. Kolejne wyroki (Dolińska-Ficek i Ozimek; Advance Pharma) rozciągnęły tę ocenę na pozostałe nowe izby Sądu Najwyższego. Każdy, o czyjej sprawie orzeka taki skład, jest pozbawiony podstawowego prawa do sądu zgodnego z prawem.' },
    },
    {
      // Wałęsa v. Poland, no. 50849/21, ECtHR, 23 Nov 2023 (pilot judgment;
      // ~490 similar applications pending). https://hudoc.echr.coe.int/eng?i=001-229366
      caseId: '50849/21',
      kicker: { en: '6 · How deep does it go?', pl: '6 · Jak głęboko to sięga?' },
      narration: {
        en: 'How deep does the defect run? Lech Wałęsa — yes, the former president — had won a final defamation judgment years earlier; the Prosecutor General used a new “extraordinary appeal” to reopen it, and the Supreme Court’s Extraordinary Review Chamber, staffed entirely through the new KRS, overturned his win. In November 2023 Strasbourg answered with a pilot judgment, a tool reserved for systemic failures: with around 490 similar applications already pending, Poland must repair the system itself — starting with the KRS — not just compensate one applicant.',
        pl: 'Jak głęboko sięga wada? Lech Wałęsa — tak, były prezydent — wygrał przed laty prawomocny proces o zniesławienie; Prokurator Generalny wykorzystał nową „skargę nadzwyczajną”, by sprawę wznowić, a Izba Kontroli Nadzwyczajnej Sądu Najwyższego, w całości obsadzona przez nową KRS, uchyliła korzystny dla niego wyrok. W listopadzie 2023 r. Strasburg odpowiedział wyrokiem pilotażowym — narzędziem zarezerwowanym dla wad systemowych: przy około 490 podobnych skargach już zawisłych Polska ma naprawić sam system — poczynając od KRS — a nie tylko zadośćuczynić jednemu skarżącemu.' },
    },
    {
      // Rzecznik Praw Obywatelskich (Recusal of a judge of an ordinary court),
      // C-521/21, CJEU (Grand Chamber), 24 Mar 2026; CJEU Press Release 45/26:
      // https://curia.europa.eu/site/upload/docs/application/pdf/2026-03/cp260045en.pdf
      caseId: 'C-521/21',
      kicker: { en: '7 · The wider question', pl: '7 · Szersze pytanie' },
      narration: {
        en: 'By 2026, more than 3,000 judges — roughly 30% of the Polish judiciary — had been appointed on the new KRS’s recommendation. In March 2026 the EU Court’s Grand Chamber drew a careful line: a flawed appointment does not, by itself, disqualify a judge. Courts must weigh all the circumstances of each appointment and ask whether, taken together, they give citizens reasonable doubt about that judge’s independence. And the Court held that it falls to Poland to enact a legislative framework for deciding whether irregularly appointed judges may stay in office — pointing to a statutory solution, not endless case-by-case battles.',
        pl: 'Do 2026 r. na wniosek nowej KRS powołano ponad 3000 sędziów — około 30% polskiej kadry orzeczniczej. W marcu 2026 r. Wielka Izba TSUE nakreśliła ostrożną granicę: wadliwe powołanie samo w sobie nie dyskwalifikuje sędziego. Sądy muszą całościowo ocenić okoliczności każdej nominacji i zbadać, czy łącznie budzą one u obywateli uzasadnione wątpliwości co do niezależności danego sędziego. Trybunał wskazał zarazem, że to Polska ma stworzyć ramy ustawowe rozstrzygające, czy wadliwie powołani sędziowie mogą pozostać na stanowiskach — rozwiązanie ustawowe zamiast niekończących się sporów w pojedynczych sprawach.' },
    },
    {
      // Outro: 2024 KRS law declared unconstitutional by the Constitutional
      // Tribunal on 20 Nov 2025 (preventive review after referral by the
      // President); successor bill vetoed by President Nawrocki on 19 Feb 2026
      // (https://notesfrompoland.com/2026/02/19/president-vetoes-bill-reforming-judicial-body-at-heart-of-polands-rule-of-law-crisis/).
      caseId: null,
      kicker: { en: 'Where it stands', pl: 'Stan obecny' },
      heading: { en: 'The unfinished work', pl: 'Niedokończone dzieło' },
      narration: {
        en: 'A government elected in late 2023 promised to restore the rule of law, but the keystone reform — returning the choice of the KRS’s judicial members to judges — remains blocked. A 2024 law was referred by the President to the captured Constitutional Tribunal, which declared it unconstitutional (November 2025); a successor bill was vetoed by President Nawrocki (February 2026), who argues it would unsettle the status of 3,000 judges and their rulings. Europe’s judgments are clear; carrying them out is the unfinished work. Open any case to go deeper.',
        pl: 'Rząd wyłoniony pod koniec 2023 r. obiecał przywrócić praworządność, lecz kluczowa reforma — oddanie sędziom wyboru sędziowskich członków KRS — pozostaje zablokowana. Ustawę z 2024 r. Prezydent skierował do przejętego Trybunału Konstytucyjnego, który uznał ją za niekonstytucyjną (listopad 2025); kolejną ustawę zawetował prezydent Nawrocki (luty 2026), twierdząc, że podważyłaby status 3000 sędziów i wydanych przez nich orzeczeń. Europejskie wyroki są jednoznaczne; ich wykonanie to dzieło niedokończone. Otwórz dowolną sprawę, by zgłębić temat.' },
      stats: [
        { num: { en: '~3,000', pl: '~3000' },
          label: { en: 'judges appointed through the captured KRS — about 30% of the Polish bench',
                   pl: 'sędziów powołanych przez przejętą KRS — około 30% polskiej kadry orzeczniczej' } },
        { num: { en: '~490', pl: '~490' },
          label: { en: 'related applications still waiting at the European Court of Human Rights',
                   pl: 'powiązanych skarg wciąż czeka w Europejskim Trybunale Praw Człowieka' } },
        { word: true, num: { en: 'Unresolved', pl: 'Nierozwiązane' },
          label: { en: 'the root cause — the politicised KRS — remains in place',
                   pl: 'źródło problemu — upolityczniona KRS — wciąż trwa' } },
      ],
    },
  ],
};
