// data/themes.js
export const THEMES = [
  { key: 'ct',   name: { en: 'Constitutional Tribunal capture', pl: 'Przejęcie Trybunału Konstytucyjnego' },
    description: { en: 'Packing and neutralising the court that checks if laws follow the constitution.', pl: 'Obsadzenie i zneutralizowanie sądu badającego zgodność ustaw z konstytucją.' } },
  { key: 'sc',   name: { en: 'Supreme Court & National Council of the Judiciary (KRS)', pl: 'Sąd Najwyższy i Krajowa Rada Sądownictwa (KRS)' },
    description: { en: 'Reshaping the top court and politicising the National Council of the Judiciary (KRS) that appoints judges.', pl: 'Przebudowa najwyższego sądu i upolitycznienie Krajowej Rady Sądownictwa (KRS), która powołuje sędziów.' } },
  { key: 'disc', name: { en: 'Disciplining judges', pl: 'Dyscyplinowanie sędziów' },
    description: { en: 'Punishing judges for their rulings — including the "muzzle law".', pl: 'Karanie sędziów za ich orzeczenia — w tym „ustawa kagańcowa”.' } },
  { key: 'ret',  name: { en: 'Forced retirements', pl: 'Przymusowe przejścia w stan spoczynku' },
    description: { en: 'Removing sitting judges early by lowering retirement ages.', pl: 'Wcześniejsze usuwanie urzędujących sędziów przez obniżanie wieku spoczynkowego.' } },
];
export const THEME_KEYS = THEMES.map(t => t.key);
