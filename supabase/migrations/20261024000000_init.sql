-- Cultiva Digital — schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou com `supabase db push`).

-- ---------------------------------------------------------------------------
-- Vitrines (uma por vendedora)
-- ---------------------------------------------------------------------------
create table public.stores (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null unique references auth.users (id) on delete cascade,
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40),
  name            text not null check (char_length(name) between 1 and 80),
  description     text check (char_length(description) <= 500),
  whatsapp        text check (whatsapp ~ '^[0-9]{12,13}$'),
  instagram       text check (instagram ~ '^[a-zA-Z0-9._]{1,30}$'),
  contact_channel text not null default 'whatsapp' check (contact_channel in ('whatsapp', 'instagram')),
  created_at      timestamptz not null default now(),
  -- o canal escolhido precisa estar preenchido
  check (
    (contact_channel = 'whatsapp' and whatsapp is not null) or
    (contact_channel = 'instagram' and instagram is not null)
  )
);

-- ---------------------------------------------------------------------------
-- Categorias (definidas pela própria vendedora)
-- ---------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references public.stores (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (store_id, name),
  unique (id, store_id)
);

create index categories_store_id_idx on public.categories (store_id);

-- ---------------------------------------------------------------------------
-- Produtos
-- ---------------------------------------------------------------------------
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references public.stores (id) on delete cascade,
  category_id uuid,
  name        text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 1000),
  price       numeric(10, 2) check (price >= 0),
  available   boolean not null default true,
  image_path  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- garante que a categoria é da mesma vitrine; ao apagar a categoria, o produto fica "sem categoria"
  foreign key (category_id, store_id)
    references public.categories (id, store_id)
    on delete set null (category_id)
);

create index products_store_id_idx on public.products (store_id);

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Segurança (RLS): qualquer pessoa vê as vitrines; só a dona edita a sua.
-- ---------------------------------------------------------------------------
alter table public.stores     enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;

create function public.owns_store(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.stores
    where id = target and owner_id = (select auth.uid())
  );
$$;

create policy "vitrines são públicas" on public.stores
  for select using (true);
create policy "dona cria a vitrine" on public.stores
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "dona edita a vitrine" on public.stores
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "dona apaga a vitrine" on public.stores
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "categorias são públicas" on public.categories
  for select using (true);
create policy "dona gerencia categorias" on public.categories
  for all to authenticated
  using (public.owns_store(store_id)) with check (public.owns_store(store_id));

create policy "produtos são públicos" on public.products
  for select using (true);
create policy "dona gerencia produtos" on public.products
  for all to authenticated
  using (public.owns_store(store_id)) with check (public.owns_store(store_id));

-- ---------------------------------------------------------------------------
-- Fotos: bucket público; cada vendedora só escreve na própria pasta ({user_id}/...)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']);

create policy "fotos: dona envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "fotos: dona substitui" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "fotos: dona apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- a API de Storage exige SELECT para apagar arquivos
create policy "fotos: dona lista" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
