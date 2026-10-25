-- Logo opcional da vitrine (arquivo no mesmo bucket das fotos: {user_id}/logo-....webp)
alter table public.stores add column logo_path text;
