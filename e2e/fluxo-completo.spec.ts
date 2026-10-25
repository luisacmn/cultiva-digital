import { createClient } from "@supabase/supabase-js";
import { devices, expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { renderPhoto } from "./photos";

/**
 * Fluxo completo da plataforma, do jeito que acontece no celular:
 * a vendedora monta a vitrine e um visitante faz um pedido.
 * Usa uma conta de demonstração própria e apaga a vitrine dela no final.
 * Os prints vão para docs/screens/ e servem de documentação.
 */

const DEMO = {
  email: "demo.vitrine@example.com",
  password: "demo-cultiva-2026",
  store: "Ateliê Verde",
  slug: "atelie-verde-demo",
  whatsapp: "(81) 98888-1234",
};

const PRODUCTS = [
  {
    photo: "terrario",
    name: "Terrário de vidro médio",
    price: "129,90",
    category: "Terrários",
    description: "Cúpula de vidro com musgo, pedriscos e mini plantas. 20 cm de altura. Rega a cada 15 dias.",
    available: true,
  },
  {
    photo: "suculenta",
    name: "Suculenta Echeveria",
    price: "18,00",
    category: "Suculentas",
    description: "Em vaso de barro nº 9. Gosta de sol pela manhã.",
    available: true,
  },
  {
    photo: "cacto",
    name: "Mini cacto em vaso de cerâmica",
    price: "24,90",
    category: "Cactos",
    description: "Vaso de cerâmica artesanal. Ótimo para mesa de trabalho.",
    available: true,
  },
  {
    photo: "kit",
    name: "Kit presente com 3 suculentas",
    price: "59,90",
    category: "Kits para presente",
    description: "Caixa de madeira com três suculentas e cartão.",
    available: false,
  },
] as const;

const SCREENS = "docs/screens";
mkdirSync(SCREENS, { recursive: true });

async function shot(page: Page, name: string, fullPage = false) {
  await page.waitForLoadState("networkidle");
  if (!fullPage) {
    await page.screenshot({ path: `${SCREENS}/${name}.png` });
    return;
  }
  // Aumenta a "tela" até caber a página toda, para barras fixas ficarem no lugar certo.
  const viewport = page.viewportSize()!;
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: viewport.width, height: Math.max(height, viewport.height) });
  await page.screenshot({ path: `${SCREENS}/${name}.png` });
  await page.setViewportSize(viewport);
}

/** Apaga a vitrine de demonstração (e as fotos) se ela existir. Devolve se a conta já existe. */
async function resetDemoStore() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email: DEMO.email, password: DEMO.password });
  if (error || !data.user) return false;

  const { data: files } = await supabase.storage.from("product-images").list(data.user.id);
  if (files?.length) {
    await supabase.storage.from("product-images").remove(files.map((f) => `${data.user.id}/${f.name}`));
  }
  await supabase.from("stores").delete().eq("owner_id", data.user.id);
  return true;
}

test.afterAll(async () => {
  await resetDemoStore();
});

test("vendedora monta a vitrine e visitante faz um pedido", async ({ page, browser }) => {
  const accountExists = await resetDemoStore();

  const photoContext = await browser.newContext({
    viewport: { width: 600, height: 600 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  });
  const photoPage = await photoContext.newPage();
  const photos: Record<string, Awaited<ReturnType<typeof renderPhoto>>> = {};
  for (const name of ["logo", ...PRODUCTS.map((p) => p.photo)] as const) {
    photos[name] = await renderPhoto(photoPage, name);
  }
  await photoContext.close();

  await test.step("vendedora cria a conta", async () => {
    await page.goto("/cadastro");
    if (page.url().includes("/cadastro")) {
      await page.getByLabel("E-mail").fill(DEMO.email);
      await page.getByLabel("Crie uma senha").fill(DEMO.password);
      await page.getByRole("checkbox").check();
      await shot(page, "01-cadastro");
    }

    if (accountExists) {
      await page.goto("/entrar");
      await page.getByLabel("E-mail").fill(DEMO.email);
      await page.getByLabel("Senha").fill(DEMO.password);
      await page.getByRole("button", { name: "Entrar" }).click();
    } else {
      await page.getByRole("button", { name: "Criar conta" }).click();
    }
    await expect(page).toHaveURL(/\/painel\/vitrine/);
  });

  await test.step("vendedora cria a vitrine", async () => {
    await page.getByLabel("Nome da vitrine").fill(DEMO.store);
    await page.locator("#slug").fill(DEMO.slug);
    await page
      .getByLabel("Descrição")
      .fill("Terrários e suculentas feitos à mão em Recife. Entrega na Região Metropolitana.");
    await page.locator("#whatsapp").fill(DEMO.whatsapp);
    await page.locator("#logo").setInputFiles(photos.logo);
    await shot(page, "02-criar-vitrine", true);
    await page.getByRole("button", { name: "Criar vitrine" }).click();
    await expect(page).toHaveURL(/\/painel\?bem-vinda/);
    await expect(page.getByText("Sua vitrine foi criada!")).toBeVisible();
    await shot(page, "03-painel-vazio");
  });

  await test.step("vendedora cria as categorias", async () => {
    await page.getByRole("link", { name: "Categorias" }).click();
    for (const name of ["Terrários", "Suculentas", "Cactos", "Kits para presente"]) {
      await page.getByRole("button", { name: `+ ${name}` }).click();
      await expect(page.getByText(`Categoria “${name}” criada.`)).toBeVisible();
    }
    await expect(page.locator("li input[name=name]")).toHaveCount(4);
    await shot(page, "04-categorias");
  });

  await test.step("vendedora publica os produtos", async () => {
    for (const [index, product] of PRODUCTS.entries()) {
      await page.goto("/painel/produtos/novo");
      await page.locator("#photo").setInputFiles(photos[product.photo]);
      await page.getByLabel("Nome").fill(product.name);
      await page.getByLabel("Preço").fill(product.price);
      await page.getByLabel("Categoria").selectOption({ label: product.category });
      await page.getByLabel("Descrição").fill(product.description);
      if (!product.available) await page.getByText("Disponível para venda").click();
      if (index === 0) await shot(page, "05-novo-produto", true);
      await page.getByRole("button", { name: "Publicar produto" }).click();
      await expect(page).toHaveURL(/\/painel\?publicado/);
    }
    await expect(page.getByText("4 produtos · 3 disponíveis")).toBeVisible();
    await shot(page, "06-painel-produtos", true);
  });

  await test.step("o painel também funciona no computador", async () => {
    const desktop = await browser.newContext({
      viewport: { width: 1280, height: 860 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      storageState: await page.context().storageState(),
    });
    const desktopPage = await desktop.newPage();
    await desktopPage.goto("http://localhost:3000/painel");
    await expect(desktopPage.getByText("4 produtos · 3 disponíveis")).toBeVisible();
    await shot(desktopPage, "12-painel-computador");
    await desktopPage.goto(`http://localhost:3000/${DEMO.slug}`);
    await expect(desktopPage.getByRole("heading", { name: DEMO.store })).toBeAttached();
    await shot(desktopPage, "13-vitrine-computador");
    await desktop.close();
  });

  // Visitante: outro navegador, sem login.
  const visitor = await browser.newContext({ ...devices["Pixel 7"], locale: "pt-BR", baseURL: "http://localhost:3000" });
  const shopper = await visitor.newPage();

  await test.step("visitante abre a vitrine", async () => {
    await shopper.goto(`/${DEMO.slug}`);
    await expect(shopper.getByRole("heading", { name: DEMO.store })).toBeVisible();
    await expect(shopper.getByRole("img", { name: `Logo ${DEMO.store}` })).toBeVisible();
    for (const product of PRODUCTS) await expect(shopper.getByText(product.name)).toBeVisible();
    await expect(shopper.getByText("Esgotado")).toBeVisible();
    await shot(shopper, "07-vitrine", true);
  });

  await test.step("visitante busca e filtra por categoria", async () => {
    await shopper.getByPlaceholder("Buscar plantas, terrários…").fill("suculenta");
    await expect(shopper.getByText("Suculenta Echeveria")).toBeVisible();
    await expect(shopper.getByText("Terrário de vidro médio")).toBeHidden();
    await shot(shopper, "08-busca");

    await shopper.getByPlaceholder("Buscar plantas, terrários…").fill("");
    await shopper.getByRole("button", { name: "Cactos", exact: true }).click();
    await expect(shopper.getByText("Mini cacto em vaso de cerâmica")).toBeVisible();
    await expect(shopper.getByText("Suculenta Echeveria")).toBeHidden();
    await shot(shopper, "09-filtro-categoria");
    await shopper.getByRole("button", { name: "Tudo" }).click();
  });

  await test.step("visitante monta o pedido", async () => {
    await shopper.getByRole("button", { name: "Adicionar Suculenta Echeveria ao pedido" }).click();
    await shopper.getByRole("button", { name: "Adicionar Suculenta Echeveria ao pedido" }).click();
    await expect(shopper.getByRole("button", { name: /Ver pedido/ })).toContainText("2 itens");
    await expect(shopper.getByRole("button", { name: "Adicionar Kit presente com 3 suculentas ao pedido" })).toHaveCount(0);

    await shopper.getByRole("link", { name: "Terrário de vidro médio" }).click();
    await expect(shopper.getByRole("heading", { name: "Terrário de vidro médio" })).toBeVisible();
    await shopper.getByRole("button", { name: "Adicionar ao pedido" }).click();
    await expect(shopper.getByText("1 unidade no seu pedido")).toBeVisible();
    await shot(shopper, "10-produto");

    await shopper.getByRole("button", { name: /Ver pedido/ }).click();
    const dialog = shopper.getByRole("dialog", { name: "Seu pedido" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("R$ 165,90")).toBeVisible();
    await shot(shopper, "11-pedido");

    const href = await dialog.getByRole("link", { name: "Enviar pedido pelo WhatsApp" }).getAttribute("href");
    const url = new URL(href!);
    expect(url.host).toBe("wa.me");
    expect(url.pathname).toBe("/5581988881234");
    // o formato de moeda pt-BR usa espaço não separável depois do "R$"
    const message = url.searchParams.get("text")!.replaceAll("\u00a0", " ");
    expect(message).toContain("• 2x Suculenta Echeveria — R$ 36,00");
    expect(message).toContain("• 1x Terrário de vidro médio — R$ 129,90");
    expect(message).toContain("Total: R$ 165,90");
    writeFileSync(`${SCREENS}/mensagem.txt`, message);
  });

  await visitor.close();
});
