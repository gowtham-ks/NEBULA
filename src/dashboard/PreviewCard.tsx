import { useEffect, useState, type CSSProperties } from 'react';
import type { Theme } from '../shared/theme';
import { loadWallpaper } from '../storage/themes';

/** A small mock page that reflects the theme (colours, wallpaper, glass, typography). The real preview is the open tab. */
export function PreviewCard({ theme }: { theme: Theme }) {
  const { appearance: a, glass: g, typography: ty, wallpaper: w } = theme;
  const [wp, setWp] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!w.assetId) { setWp(null); return; }
    void loadWallpaper(w.assetId).then((u) => alive && setWp(u));
    return () => { alive = false; };
  }, [w.assetId]);

  const glass: CSSProperties = g.enabled
    ? {
        background: `rgba(${g.tint === 'light' ? '255,255,255' : '16,16,20'},${(100 - g.transparency) / 100})`,
        backdropFilter: `blur(${Math.min(g.blur, 20)}px)`,
        boxShadow: `inset 0 0 0 1px rgba(${g.tint === 'light' ? '0,0,0' : '255,255,255'},${g.borderOpacity / 100})`,
      }
    : { background: 'rgba(128,128,128,0.12)', boxShadow: 'inset 0 0 0 1px rgba(128,128,128,0.2)' };
  const accent = a.accent ?? '#d71921';

  return (
    <div
      aria-label="Theme preview"
      className="relative max-w-xl overflow-hidden rounded-card border border-white/10"
      style={{
        background: a.bgColor ?? '#111', color: a.textColor ?? '#ddd', height: 210,
        fontFamily: ty.fontFamily ?? undefined, fontSize: ty.fontSize ? `${ty.fontSize}%` : undefined,
        fontWeight: ty.fontWeight ?? undefined, lineHeight: ty.lineHeight ?? undefined,
        letterSpacing: ty.letterSpacing !== null ? `${ty.letterSpacing}px` : undefined,
      }}
    >
      {wp && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${wp}")`, backgroundSize: w.size, backgroundPosition: w.position, backgroundRepeat: 'no-repeat',
              opacity: w.opacity / 100, filter: `blur(${w.blur}px)`, transform: w.blur ? 'scale(1.08)' : undefined,
            }}
          />
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${w.dim / 100})` }} />
        </>
      )}
      <div className="relative grid h-full grid-cols-[56px_1fr] gap-2 p-2">
        <div className="rounded-xl p-2" style={glass}>
          {[0, 1, 2, 3].map((i) => <div key={i} className="mb-2 h-2 rounded-full" style={{ background: i === 0 ? accent : 'rgba(128,128,128,.45)' }} />)}
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={glass}>
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
            <span className="h-2 flex-1 rounded-full" style={{ background: 'rgba(128,128,128,.35)' }} />
          </div>
          <h3 className="text-base" style={{ fontFamily: ty.headingFamily ?? undefined, fontWeight: ty.headingWeight ?? 700 }}>
            Good evening, <span style={{ color: accent }}>you</span>
          </h3>
          <p className="text-xs opacity-80">
            Body text with a <span style={{ color: ty.linkColor ?? accent, textDecoration: 'underline' }}>link</span>.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl p-2" style={glass}>
                <div className="mb-1.5 h-9 rounded-lg" style={{ background: 'rgba(128,128,128,.3)' }} />
                <div className="h-2 w-3/4 rounded-full" style={{ background: 'rgba(128,128,128,.45)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
