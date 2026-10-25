import type { Page } from "@playwright/test";

// Ilustrações simples para os produtos de demonstração (renderizadas como PNG pelo próprio navegador).
const ILLUSTRATIONS: Record<string, string> = {
  terrario: `
    <rect width="600" height="600" fill="#e9eee2"/>
    <ellipse cx="300" cy="520" rx="190" ry="26" fill="#d6dccb"/>
    <path d="M150 500 V300 a150 150 0 0 1 300 0 V500 Z" fill="#ffffff" fill-opacity=".55" stroke="#b9c7b4" stroke-width="6"/>
    <path d="M156 500 V430 Q300 400 444 430 V500 Z" fill="#8a6a4f"/>
    <path d="M156 440 Q300 410 444 440 V458 Q300 430 156 458 Z" fill="#c9a77c"/>
    <ellipse cx="240" cy="420" rx="60" ry="22" fill="#5f8a55"/>
    <path d="M330 425 q-5 -90 30 -120 q10 60 -10 120 Z" fill="#3e5f45"/>
    <path d="M345 425 q30 -70 75 -80 q-20 55 -60 82 Z" fill="#6f9a62"/>
    <circle cx="225" cy="395" r="16" fill="#9cbf88"/><circle cx="255" cy="390" r="12" fill="#7fae6e"/>
    <rect x="270" y="150" width="60" height="20" rx="10" fill="#b9c7b4"/>
    <path d="M190 260 q20 -60 70 -85" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none" opacity=".8"/>`,
  suculenta: `
    <rect width="600" height="600" fill="#f3e9df"/>
    <ellipse cx="300" cy="530" rx="160" ry="22" fill="#e3d4c4"/>
    <path d="M190 360 H410 L385 520 H215 Z" fill="#b4664a"/>
    <rect x="175" y="340" width="250" height="40" rx="10" fill="#c97a5c"/>
    <g fill="#7fae8a" stroke="#5c8a6b" stroke-width="4">
      <path d="M300 345 q-130 -10 -150 -70 q90 -20 150 70 Z"/>
      <path d="M300 345 q130 -10 150 -70 q-90 -20 -150 70 Z"/>
      <path d="M300 345 q-90 -60 -70 -150 q70 40 70 150 Z"/>
      <path d="M300 345 q90 -60 70 -150 q-70 40 -70 150 Z"/>
    </g>
    <g fill="#a6cdb0" stroke="#6f9c7e" stroke-width="4">
      <path d="M300 345 q-60 -50 -40 -130 q50 50 40 130 Z"/>
      <path d="M300 345 q60 -50 40 -130 q-50 50 -40 130 Z"/>
      <path d="M300 345 q-20 -90 0 -160 q20 70 0 160 Z"/>
    </g>`,
  cacto: `
    <rect width="600" height="600" fill="#e4ebe8"/>
    <ellipse cx="300" cy="530" rx="140" ry="20" fill="#d0dbd6"/>
    <path d="M205 390 H395 L375 520 H225 Z" fill="#f1ede4" stroke="#d9d2c3" stroke-width="5"/>
    <path d="M205 420 H395" stroke="#3e5f45" stroke-width="10"/>
    <rect x="255" y="170" width="90" height="230" rx="45" fill="#4f7a55"/>
    <rect x="180" y="250" width="60" height="110" rx="30" fill="#5f8a63"/>
    <rect x="215" y="330" width="60" height="30" fill="#5f8a63"/>
    <rect x="360" y="215" width="55" height="100" rx="27" fill="#5f8a63"/>
    <rect x="330" y="290" width="55" height="30" fill="#5f8a63"/>
    <g stroke="#e9f0de" stroke-width="3" stroke-linecap="round">
      <path d="M300 200 v12M285 240 v12M315 270 v12M290 310 v12M312 350 v12M208 280 v10M388 245 v10"/>
    </g>
    <circle cx="300" cy="168" r="16" fill="#e49a8a"/>`,
  logo: `
    <rect width="600" height="600" rx="60" fill="#3e5f45"/>
    <path d="M300 300 V190" stroke="#e5ecdd" stroke-width="14" stroke-linecap="round"/>
    <path d="M300 200 c0 -55 32 -86 92 -92 c0 59 -32 90 -92 92 Z" fill="#a6cdb0"/>
    <path d="M300 232 c0 -47 -28 -72 -80 -78 c0 50 28 76 80 78 Z" fill="#e5ecdd"/>
    <text x="300" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="78" fill="#f6f4ee">Ateliê Verde</text>
    <text x="300" y="460" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="8" fill="#a6cdb0">PLANTAS · RECIFE</text>`,
  kit: `
    <rect width="600" height="600" fill="#efe8f0"/>
    <ellipse cx="300" cy="520" rx="200" ry="22" fill="#e0d5e1"/>
    <rect x="130" y="330" width="340" height="180" rx="18" fill="#c9a77c"/>
    <rect x="130" y="330" width="340" height="40" rx="18" fill="#b8956a"/>
    <rect x="285" y="330" width="30" height="180" fill="#b4664a"/>
    <g fill="#7fae8a"><circle cx="200" cy="320" r="40"/><circle cx="300" cy="300" r="48"/><circle cx="400" cy="320" r="40"/></g>
    <g fill="#a6cdb0"><circle cx="200" cy="312" r="22"/><circle cx="300" cy="290" r="26"/><circle cx="400" cy="312" r="22"/></g>`,
};

export async function renderPhoto(page: Page, name: keyof typeof ILLUSTRATIONS) {
  await page.setContent(
    `<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">${ILLUSTRATIONS[name]}</svg></body>`,
  );
  return { name: `${name}.png`, mimeType: "image/png", buffer: await page.screenshot({ type: "png" }) };
}
