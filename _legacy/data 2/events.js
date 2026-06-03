// data/events.js
// Each landmark on the timeline is clickable: `what` happened, the `consequence`
// (incl. how the courts later diagnosed it), and the judgments connected to it.
// Two distinct relationships are tracked so the UI never overclaims causation:
//   causedJudgments     — judgments that this event directly produced / that
//                         adjudicated the very measure introduced here.
//   associatedJudgments — judgments on the same theme that did NOT flow from this
//                         event (often they predate it, or the event was a reaction
//                         to them). Shown under a separate "Associated judgments" head.
export const EVENTS = [
  {
    date: '2015-10', label: { en: 'Law & Justice wins majority', pl: 'Zwycięstwo Prawa i Sprawiedliwości' },
    what: { en: 'The Law and Justice (PiS) party won an outright parliamentary majority and began a rapid overhaul of the courts.',
            pl: 'Partia Prawo i Sprawiedliwość (PiS) zdobyła samodzielną większość w parlamencie i rozpoczęła szybką przebudowę sądownictwa.' },
    consequence: { en: 'A single party now controlled the legislature and government, enabling the law changes behind every later case.',
                   pl: 'Jedna partia kontrolowała odtąd parlament i rząd, co umożliwiło zmiany ustaw stojące za wszystkimi późniejszymi sprawami.' },
    causedJudgments: [], associatedJudgments: [],
  },
  {
    date: '2015-12', label: { en: 'Constitutional Tribunal packed', pl: 'Przejęcie Trybunału Konstytucyjnego' },
    what: { en: 'The new majority refused to swear in three lawfully elected Constitutional Tribunal judges and appointed its own instead.',
            pl: 'Nowa większość odmówiła zaprzysiężenia trojga zgodnie z prawem wybranych sędziów Trybunału Konstytucyjnego i powołała własnych.' },
    consequence: { en: 'The Tribunal — the guardian of the constitution — was neutralised. The ECtHR later held a panel containing an unlawfully elected judge was not a "tribunal established by law".',
                   pl: 'Trybunał — strażnik konstytucji — został zneutralizowany. ETPC uznał później, że skład z nieprawidłowo wybranym sędzią nie był „sądem ustanowionym ustawą”.' },
    causedJudgments: ['4907/18'], associatedJudgments: [],
  },
  {
    date: '2017-12', label: { en: 'National Council of the Judiciary (KRS) politicised', pl: 'Upolitycznienie Krajowej Rady Sądownictwa (KRS)' },
    what: { en: 'A 2017 law ended the terms of the elected judicial members of the National Council of the Judiciary (KRS) and handed their election to parliament.',
            pl: 'Ustawa z 2017 r. wygasiła kadencje wybieralnych sędziowskich członków Krajowej Rady Sądownictwa (KRS) i przekazała ich wybór parlamentowi.' },
    consequence: { en: 'The body that nominates every judge fell under political control — the root defect that both European courts trace through almost all the cases.',
                   pl: 'Organ wskazujący każdego sędziego znalazł się pod kontrolą polityczną — źródłowa wada, którą oba europejskie trybunały odnajdują niemal we wszystkich sprawach.' },
    causedJudgments: ['C-585/18', '43447/19', '43572/18'], associatedJudgments: [],
  },
  {
    date: '2018-07', label: { en: 'Supreme Court purge law', pl: 'Ustawa o Sądzie Najwyższym' },
    what: { en: 'A new Supreme Court Act lowered the retirement age, forcing out a large share of judges (including the First President), and created two new chambers — Disciplinary and Extraordinary Review.',
            pl: 'Nowa ustawa o Sądzie Najwyższym obniżyła wiek spoczynkowy, usuwając znaczną część sędziów (w tym Pierwszą Prezes) i tworząc dwie nowe izby — Dyscyplinarną i Kontroli Nadzwyczajnej.' },
    consequence: { en: 'The CJEU ordered the measure suspended and then found the forced early retirement breached judicial independence.',
                   pl: 'TSUE nakazał zawieszenie środka, a następnie uznał, że przymusowe wcześniejsze przejście w stan spoczynku naruszyło niezależność sądownictwa.' },
    causedJudgments: ['C-619/18'], associatedJudgments: ['C-192/18'],
  },
  {
    date: '2019-01', label: { en: 'Disciplinary Chamber set up', pl: 'Powstanie Izby Dyscyplinarnej' },
    what: { en: 'The Supreme Court’s new Disciplinary Chamber began operating, staffed with judges appointed through the politicised KRS, with power to discipline and lift the immunity of judges.',
            pl: 'Nowa Izba Dyscyplinarna Sądu Najwyższego rozpoczęła działalność, obsadzona sędziami powołanymi przez upolitycznioną KRS, z prawem dyscyplinowania i uchylania immunitetu sędziów.' },
    consequence: { en: 'Both the CJEU and the ECtHR found it was not an independent, lawful tribunal; it became the engine of reprisals against judges before being shut down.',
                   pl: 'Zarówno TSUE, jak i ETPC uznały, że nie była niezależnym, zgodnym z prawem sądem; stała się narzędziem represji wobec sędziów, zanim ją zlikwidowano.' },
    causedJudgments: ['C-585/18', 'C-791/19', '43447/19', '35599/20', '21181/19', '46238/20'], associatedJudgments: [],
  },
  {
    date: '2020-02', label: { en: '"Muzzle law" enacted', pl: 'Wejście w życie „ustawy kagańcowej”' },
    what: { en: 'The "muzzle law" penalised judges who questioned the legitimacy of the new appointments or applied EU and Convention law on judicial independence.',
            pl: '„Ustawa kagańcowa” karała sędziów kwestionujących legalność nowych powołań lub stosujących prawo UE i Konwencji o niezależności sądownictwa.' },
    consequence: { en: 'The CJEU held it broke EU law; it intensified the chilling effect the Court had already warned about.',
                   pl: 'TSUE uznał, że łamała prawo UE; nasiliła efekt mrożący, przed którym Trybunał już wcześniej ostrzegał.' },
    causedJudgments: ['C-204/21'], associatedJudgments: ['C-558/18', '39650/18', '21181/19'],
  },
  {
    date: '2021-10', label: { en: 'EU-law primacy challenged (K 3/21)', pl: 'Zakwestionowanie pierwszeństwa prawa UE (K 3/21)' },
    what: { en: 'In case K 3/21 the captured Constitutional Tribunal declared parts of the EU treaties incompatible with the Polish constitution.',
            pl: 'W sprawie K 3/21 przejęty Trybunał Konstytucyjny uznał części traktatów UE za niezgodne z polską konstytucją.' },
    consequence: { en: 'It openly challenged the primacy of EU law, deepened the conflict with Brussels, and helped trigger the freezing of EU funds.',
                   pl: 'Otwarcie zakwestionował pierwszeństwo prawa UE, pogłębił konflikt z Brukselą i przyczynił się do zamrożenia funduszy UE.' },
    // Xero Flor (May 2021) preceded K 3/21 (Oct 2021) — not caused by it; both concern the captured Tribunal.
    causedJudgments: [], associatedJudgments: ['4907/18'],
  },
  {
    date: '2022-07', label: { en: 'Disciplinary Chamber replaced', pl: 'Zastąpienie Izby Dyscyplinarnej' },
    what: { en: 'Poland abolished the Disciplinary Chamber and replaced it with a Chamber of Professional Responsibility; the daily EU fines then stopped.',
            pl: 'Polska zlikwidowała Izbę Dyscyplinarną i zastąpiła ją Izbą Odpowiedzialności Zawodowej; dzienne kary UE wówczas ustały.' },
    consequence: { en: 'A partial step toward compliance, but the underlying appointments defect remained; suspended judges such as Tuleya and Juszczyszyn were reinstated.',
                   pl: 'Częściowy krok ku zgodności, lecz źródłowa wada powołań pozostała; przywrócono zawieszonych sędziów, jak Tuleya i Juszczyszyn.' },
    // These judgments prompted / preceded the abolition; the reform was a reaction to them, not their cause.
    causedJudgments: [], associatedJudgments: ['C-791/19', '21181/19', '35599/20'],
  },
  {
    date: '2022-12', label: { en: 'ECtHR shields judges (Rule 39) — Poland refuses', pl: 'ETPC chroni sędziów (reguła 39) — Polska odmawia' },
    what: { en: 'From February 2022 judges facing reprisals turned to Strasbourg for emergency protection: 60 requests for interim measures under Rule 39 of the Rules of Court, across 29 cases — 17 of them granted or partly granted. They fell into three groups. Immunity — Supreme Court judges Włodzimierz Wróbel (8 Feb) and Andrzej Stępka (14 Apr), military judge Piotr Raczkowski (8 Jul) and district judge Tomasz Zawiślak (26 Apr): the Court directed that no decision on lifting their immunity be taken by the discredited Disciplinary Chamber before it had ruled. Suspension for applying EU/Convention case-law — Adam Synakiewicz, Agnieszka Niklas-Bibik, Marzanna Piekarska-Drążek and Joanna Hetnarowicz-Sikora (22 Mar) and Kraków judge Anna Głowacka (30 Mar), with Poland ordered to give 72 hours’ notice of any Disciplinary-Chamber hearing. Forced transfer — three Warsaw Court of Appeal judges (see below).',
            pl: 'Od lutego 2022 r. sędziowie zagrożeni represjami zwracali się do Strasburga o pilną ochronę: 60 wniosków o środki tymczasowe z reguły 39 Regulaminu Trybunału, w 29 sprawach — z czego 17 uwzględniono w całości lub w części. Dzieliły się na trzy grupy. Immunitet — sędziowie Sądu Najwyższego Włodzimierz Wróbel (8 lutego) i Andrzej Stępka (14 kwietnia), sędzia wojskowy Piotr Raczkowski (8 lipca) oraz sędzia rejonowy Tomasz Zawiślak (26 kwietnia): Trybunał nakazał, by zdyskredytowana Izba Dyscyplinarna nie rozstrzygała o uchyleniu ich immunitetu, zanim sam orzeknie. Zawieszenie za stosowanie prawa UE i Konwencji — Adam Synakiewicz, Agnieszka Niklas-Bibik, Marzanna Piekarska-Drążek i Joanna Hetnarowicz-Sikora (22 marca) oraz krakowska sędzia Anna Głowacka (30 marca), przy nakazie uprzedzenia Polski z 72-godzinnym wyprzedzeniem o każdym posiedzeniu Izby Dyscyplinarnej. Przymusowe przeniesienie — troje sędziów Sądu Apelacyjnego w Warszawie (zob. niżej).' },
    consequence: { en: 'When the Disciplinary Chamber was replaced in mid-2022, the Court restated the measures (August 2022) so they would bind its successor. Then, on 6 December 2022, it ordered Poland to suspend the transfer of three Warsaw Court of Appeal judges — Leszczyńska-Furtak, Gregajtys and Piekarska-Drążek. Poland announced it would not comply — its first refusal of a Rule 39 measure in a judiciary case — invoking the captured Constitutional Court’s judgment K 7/21, which had declared the European Court’s power to review judicial-organisation laws incompatible with the Polish constitution. The flagship Wróbel measure was lifted in December 2024 and his application rejected as premature in April 2025.',
                   pl: 'Gdy w połowie 2022 r. Izbę Dyscyplinarną zastąpiono, Trybunał ponownie sformułował środki (sierpień 2022 r.), by wiązały jej następczynię. Następnie 6 grudnia 2022 r. nakazał Polsce wstrzymanie przeniesienia trojga sędziów Sądu Apelacyjnego w Warszawie — Leszczyńskiej-Furtak, Gregajtys i Piekarskiej-Drążek. Polska oświadczyła, że się nie zastosuje — po raz pierwszy odmawiając wykonania środka z reguły 39 w sprawie sądownictwa — powołując się na wyrok przejętego Trybunału Konstytucyjnego K 7/21, który uznał kompetencję ETPC do badania ustaw o ustroju sądownictwa za niezgodną z polską konstytucją. Sztandarowy środek w sprawie Wróbla uchylono w grudniu 2024 r., a jego skargę odrzucono jako przedwczesną w kwietniu 2025 r.' },
    // The interim-measures wave did not "produce" these judgments; they are the rulings whose disciplinary/immunity regime the measures sought to hold at bay.
    causedJudgments: [], associatedJudgments: ['43447/19', '21181/19', '35599/20'],
  },
  {
    date: '2023-10', label: { en: 'Opposition wins election', pl: 'Zwycięstwo opozycji w wyborach' },
    what: { en: 'A new governing coalition took office promising to restore the rule of law and execute the European judgments.',
            pl: 'Nowa koalicja rządząca objęła władzę, obiecując przywrócenie praworządności i wykonanie europejskich wyroków.' },
    consequence: { en: 'Action plans were submitted to the Committee of Ministers, but key reforms stalled — blocked by the President and the captured Constitutional Tribunal.',
                   pl: 'Do Komitetu Ministrów złożono plany działań, lecz kluczowe reformy utknęły — blokowane przez Prezydenta i przejęty Trybunał Konstytucyjny.' },
    // The election did not produce these judgments; they define the backlog the new government must execute.
    causedJudgments: [], associatedJudgments: ['43447/19', '50849/21'],
  },
  {
    date: '2025-11', label: { en: 'Constitutional Tribunal blocks KRS reform bill', pl: 'Trybunał Konstytucyjny blokuje ustawę reformującą KRS' },
    what: { en: 'The Constitutional Tribunal struck down the government’s bill to restore peer election of the KRS, holding that sitting members’ terms cannot be cut short.',
            pl: 'Trybunał Konstytucyjny uchylił rządowy projekt przywracający wybór KRS przez sędziów, uznając, że kadencji urzędujących członków nie można skracać.' },
    consequence: { en: 'The root cause — the politicised KRS — persists, so the Committee of Ministers keeps the cases under enhanced supervision.',
                   pl: 'Źródło problemu — upolityczniona KRS — trwa, więc Komitet Ministrów utrzymuje sprawy pod nadzorem wzmocnionym.' },
    // The 2025 block did not produce these judgments; they are the ones it leaves unexecuted.
    causedJudgments: [], associatedJudgments: ['43447/19', '43572/18', '50849/21'],
  },
  {
    date: '2026-05', label: { en: 'ECtHR protects elected Constitutional Court judges (Dziurda)', pl: 'ETPC chroni wybranych sędziów Trybunału Konstytucyjnego (Dziurda)' },
    what: { en: 'Four jurists elected by the Sejm to the Constitutional Court on 13 March 2026 — Marcin Dziurda, Anna Korwin-Piotrowska, Krystian Markiewicz and Maciej Taborowski — were kept out of office after the President refused to take their oath. On 5 May 2026, in Dziurda and Others v. Poland (no. 17392/26), the Court granted a Rule 39 interim measure telling Poland not to hinder them from taking up and exercising their judicial duties.',
            pl: 'Czworo prawników wybranych przez Sejm do Trybunału Konstytucyjnego 13 marca 2026 r. — Marcin Dziurda, Anna Korwin-Piotrowska, Krystian Markiewicz i Maciej Taborowski — nie dopuszczono do urzędu po tym, jak Prezydent odmówił odebrania od nich ślubowania. 5 maja 2026 r. w sprawie Dziurda i inni przeciwko Polsce (nr 17392/26) Trybunał zastosował środek tymczasowy z reguły 39, nakazując Polsce, by nie utrudniała im objęcia i pełnienia obowiązków sędziowskich.' },
    consequence: { en: 'The Court grounded the measure in Xero Flor v. Poland and Grzęda v. Poland, stressing the need for a properly functioning Constitutional Court — a striking inversion of the 2015 crisis, with Rule 39 now used to defend, rather than challenge, the Tribunal’s lawful composition. The Committee of Ministers was notified and Poland was asked to report by 20 May 2026.',
                   pl: 'Trybunał oparł środek na sprawach Xero Flor przeciwko Polsce i Grzęda przeciwko Polsce, podkreślając potrzebę prawidłowo działającego Trybunału Konstytucyjnego — uderzające odwrócenie kryzysu z 2015 r., gdy reguła 39 służy teraz obronie, a nie podważaniu zgodnego z prawem składu Trybunału. Zawiadomiono Komitet Ministrów, a Polskę poproszono o raport do 20 maja 2026 r.' },
    // An interim-measure order, not a judgment; it expressly draws on these two judgments about the Constitutional Tribunal and judicial councils.
    causedJudgments: [], associatedJudgments: ['4907/18', '43572/18', '40119/21'],
  },
];
