export const KEYS = {
  settings: 'nebula:settings',
  themes: 'nebula:themes',
  preview: 'nebula:preview',
  wpIndex: 'nebula:wallpapers',
  profiles: 'nebula:profiles',
  focus: 'nebula:focus',
  blocklist: 'nebula:blocklist',
  ytLayout: 'nebula:ytlayout',
  usage: 'nebula:usage',
  cssPreview: 'nebula:csspreview',
} as const;

export const wpKey = (id: string) => `nebula:wp:${id}`;
