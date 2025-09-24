import { useEffect, useState } from 'react';
import { Layout } from '../ui/Layout';
import { Toggle } from '../ui/Components';
import { Settings, subscribe, updateSettings } from '../core/store';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    return subscribe((state) => setSettings(state.settings));
  }, []);

  if (!settings) return null;

  return (
    <Layout>
      <div className="Settings-list">
        <Toggle
          label="Dyslexic friendly font"
          checked={settings.dyslexicFont}
          onChange={(value) => updateSettings({ dyslexicFont: value })}
        />
        <Toggle
          label="Sound effects"
          checked={settings.sfx}
          onChange={(value) => updateSettings({ sfx: value })}
        />
        <Toggle
          label="Show hints"
          checked={settings.showHints}
          onChange={(value) => updateSettings({ showHints: value })}
        />
      </div>
    </Layout>
  );
}
