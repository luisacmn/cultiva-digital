const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatPrice(price: number | null) {
  return price === null ? "Sob consulta" : brl.format(price);
}

/** "35", "35,9", "R$ 1.234,50" → 1234.5. Vazio → null. Inválido → NaN. */
export function parsePrice(input: string): number | null {
  const cleaned = input.replace(/[R$\s]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return NaN;
  return Number(normalized);
}

export function priceToInput(price: number | null) {
  return price === null ? "" : price.toFixed(2).replace(".", ",");
}

/** "(81) 99999-1234" → "5581999991234". Retorna null se não parecer um celular brasileiro. */
export function normalizeWhatsapp(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return /^55\d{10,11}$/.test(digits) ? digits : null;
}

export function formatWhatsapp(digits: string) {
  const local = digits.slice(2);
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  return `(${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
}

export function normalizeInstagram(input: string): string | null {
  const handle = input
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  return /^[a-zA-Z0-9._]{1,30}$/.test(handle) ? handle : null;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Para a busca: ignora acentos e maiúsculas. */
export function normalizeSearch(input: string) {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
