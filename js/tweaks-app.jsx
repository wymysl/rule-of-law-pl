// js/tweaks-app.jsx
// Tweaks panel for The Dossier. Three expressive controls that reshape the whole
// feel — applied as body[data-*] attributes that retune the design tokens.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "ground": "paper",
  "voice": "editorial",
  "grain": false
}/*EDITMODE-END*/;

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const b = document.documentElement;
    if (t.ground && t.ground !== 'paper') b.dataset.ground = t.ground; else delete b.dataset.ground;
    if (t.voice && t.voice !== 'editorial') b.dataset.voice = t.voice; else delete b.dataset.voice;
    if (t.grain) b.dataset.texture = 'grain'; else delete b.dataset.texture;
  }, [t.ground, t.voice, t.grain]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Ground" />
      <TweakRadio label="Mood" value={t.ground}
        options={[{ value: 'paper', label: 'Paper' }, { value: 'slate', label: 'Slate' }, { value: 'night', label: 'Night' }]}
        onChange={(v) => setTweak('ground', v)} />
      <TweakSection label="Voice" />
      <TweakRadio label="Type" value={t.voice}
        options={[{ value: 'editorial', label: 'Editorial' }, { value: 'classic', label: 'Classic' }, { value: 'modern', label: 'Modern' }]}
        onChange={(v) => setTweak('voice', v)} />
      <TweakSection label="Texture" />
      <TweakToggle label="Paper grain" value={t.grain}
        onChange={(v) => setTweak('grain', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TweaksApp />);
