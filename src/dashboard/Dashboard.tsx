import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Code2, Globe, Image, Layers, LayoutGrid, Palette, Settings as Cog, Shapes, Target, Timer, Type,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useBlocklist } from '../storage/useBlocklist';
import { useFocus } from '../storage/useFocus';
import { useProfiles } from '../storage/useProfiles';
import { useSettings } from '../storage/useSettings';
import { useCustomThemes } from '../storage/useThemes';
import { SITE_RE } from '../shared/schema';
import { AutomationPanel } from './AutomationPanel';
import { CssPanel } from './CssPanel';
import { FocusPanel } from './FocusPanel';
import { Overview } from './Overview';
import { AppearancePanel, GlassPanel, TypographyPanel, WallpaperPanel } from './panels';
import { PreviewCard } from './PreviewCard';
import { SettingsPanel } from './SettingsPanel';
import { ThemesPanel } from './ThemesPanel';
import { useThemeEditor } from './useThemeEditor';
import { WebsitesPanel } from './WebsitesPanel';
import { YtLayoutCard } from './YtLayoutCard';

interface Section { id: string; label: string; icon: LucideIcon; desc: string }
const S = (id: string, label: string, icon: LucideIcon, desc: string): Section => ({ id, label, icon, desc });

const GROUPS: { label: string; items: Section[] }[] = [
  { label: '', items: [S('overview', 'Overview', LayoutGrid, 'Status, checklist and shortcuts')] },
  {
    label: 'Customize',
    items: [
      S('appearance', 'Appearance', Palette, 'Colours and the YouTube glass layout'),
      S('wallpapers', 'Wallpapers', Image, 'Upload or pick a background'),
      S('typography', 'Typography', Type, 'Fonts, size, spacing and links'),
      S('glass', 'Glass Effects', Layers, 'Blur, transparency and borders'),
    ],
  },
  {
    label: 'Websites',
    items: [
      S('websites', 'Website Manager', Globe, 'Per-site themes, profiles and hidden elements'),
      S('css', 'Custom CSS', Code2, 'Write CSS for one site, with live preview'),
      S('focus', 'Focus Mode', Target, 'Hide distractions, ads and more'),
    ],
  },
  { label: 'Library', items: [S('themes', 'Themes', Shapes, 'Presets, your themes, import and export')] },
  {
    label: 'System',
    items: [
      S('automation', 'Automation', Timer, 'Automatic theme, daily limits, shortcuts'),
      S('settings', 'Settings & Backup', Cog, 'Backup, restore, storage and reset'),
    ],
  },
];
const SECTIONS = GROUPS.flatMap((g) => g.items);
const EDITOR_SECTIONS = ['appearance', 'wallpapers', 'typography', 'glass'];

export function Dashboard() {
  const [active, setActive] = useState('overview');
  const { settings, update, error } = useSettings();
  const custom = useCustomThemes();
  const ed = useThemeEditor(settings, custom, update);
  const { profiles, patch, drop } = useProfiles();
  const { focus, setFeature, error: focusError } = useFocus();
  const { list: blocklist, change: changeBlocklist, error: blockError } = useBlocklist();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  // Deep link from the popup: dashboard.html#site=<encoded origin pattern>
  useEffect(() => {
    const m = location.hash.match(/^#site=(.+)$/);
    if (!m) return;
    try {
      const pattern = decodeURIComponent(m[1]);
      if (SITE_RE.test(pattern)) {
        setSelectedSite(pattern);
        setActive('websites');
      }
    } catch { /* ignore malformed hash */ }
  }, []);

  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const isEditor = EDITOR_SECTIONS.includes(active);
  const props = { theme: ed.theme, edit: ed.edit };
  const ruleCount = Object.values(profiles).reduce((n, p) => n + p.rules.length, 0);

  const body = () => {
    switch (active) {
      case 'overview': return <Overview settings={settings} update={update} custom={custom} ruleCount={ruleCount} onNavigate={setActive} />;
      case 'appearance': return (<div className="space-y-4"><AppearancePanel {...props} /><YtLayoutCard /></div>);
      case 'wallpapers': return <WallpaperPanel {...props} />;
      case 'typography': return <TypographyPanel {...props} />;
      case 'glass': return <GlassPanel {...props} />;
      case 'themes':
        return (
          <ThemesPanel
            custom={custom} activeId={settings.activeThemeId} onActivate={ed.activate}
            onDuplicate={ed.duplicate} onCreate={ed.create} onRename={ed.rename} onRemove={ed.remove}
            onImport={ed.importThemes}
          />
        );
      case 'websites':
        return (
          <WebsitesPanel
            settings={settings} update={update} profiles={profiles} patch={patch} drop={drop}
            customThemes={custom} selected={selectedSite} onSelect={setSelectedSite}
            onEditCss={(s) => { setSelectedSite(s); setActive('css'); }}
          />
        );
      case 'css': return <CssPanel sites={settings.sites} profiles={profiles} selected={selectedSite} onSelect={setSelectedSite} patch={patch} />;
      case 'focus':
        return (
          <FocusPanel
            settings={settings} update={update} focus={focus} setFeature={setFeature}
            error={focusError ?? blockError} blocklist={blocklist} changeBlocklist={changeBlocklist}
          />
        );
      case 'automation': return <AutomationPanel settings={settings} update={update} custom={custom} />;
      case 'settings': return <SettingsPanel settings={settings} update={update} error={error} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <nav aria-label="Sections" className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 bg-coal/80 p-3 backdrop-blur md:sticky md:top-0 md:h-screen md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="mb-3 hidden px-2 py-2 md:block"><Logo /></div>
        {GROUPS.map((g) => (
          <div key={g.label || 'top'} className="flex gap-1 md:mb-2 md:flex-col">
            {g.label && <p className="label-dot hidden px-3 pb-1 pt-2 md:block">{g.label}</p>}
            {g.items.map(({ id, label, icon: Icon }) => (
              <button
                key={id} onClick={() => setActive(id)} aria-current={active === id ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-card px-3 py-2 text-sm transition-colors ${
                  active === id ? 'bg-white/10 text-white' : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-200'
                }`}
              >
                <Icon size={15} className={active === id ? 'text-nothing' : ''} /> {label}
              </button>
            ))}
          </div>
        ))}
        <p className="mt-auto hidden px-3 pt-4 text-[11px] text-neutral-600 md:block">NEBULA {chrome.runtime.getManifest().version}</p>
      </nav>

      <main className="min-w-0 flex-1 space-y-4 p-6 md:p-8">
        <header>
          <h1 className="text-2xl font-bold">{section.label}</h1>
          <p className="text-sm text-neutral-500">{section.desc}</p>
        </header>
        {isEditor && (
          <div className="glass sticky top-2 z-10 flex max-w-xl flex-wrap items-center gap-3 p-3 text-sm">
            <span className="min-w-0 flex-1 truncate">
              {ed.theme.name}
              <span className="ml-2 text-xs text-neutral-500">{ed.dirty ? 'Unsaved · live on enabled sites' : 'Saved'}</span>
            </span>
            <button onClick={ed.reset} className="text-xs text-neutral-400 hover:text-white">Reset</button>
            {ed.dirty && <button onClick={ed.cancel} className="text-xs text-neutral-400 hover:text-white">Cancel</button>}
            <button onClick={() => void ed.apply()} disabled={!ed.dirty} className="btn btn-primary !py-1 text-xs">Apply</button>
          </div>
        )}
        {ed.error && <p className="text-xs text-nothing">{ed.error}</p>}
        {isEditor && <PreviewCard theme={ed.theme} />}
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {body()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
