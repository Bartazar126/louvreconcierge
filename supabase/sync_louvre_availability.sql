-- Louvre lezárás-szinkron: ha a "Louvre Museum with E-Guide" (louvre-e-guide)
-- terméket zárod/nyitod az adminban, automatikusan követi:
--   - audio-guide          (teljes termék, combo_component '*')
--   - louvre-eiffel        (Louvre-komponens)
--   - seine-river          (Louvre-komponens)
-- A tükrözött sorok note = 'sync-louvre' jelölést kapnak; kézzel felvett
-- sorokat a szinkron sosem töröl. Az ár-sorokat (__price__) nem érinti.
--
-- Eltávolítás:
--   drop trigger if exists sync_louvre_availability_trigger on public.product_availability_overrides;
--   drop function if exists public.sync_louvre_availability();

create or replace function public.sync_louvre_availability() returns trigger
language plpgsql
as $$
declare
  target record;
begin
  if tg_op in ('INSERT', 'UPDATE') then
    if new.product_id <> 'louvre-e-guide'
       or new.visit_time = '__price__'
       or new.visit_date = date '1970-01-01' then
      return new;
    end if;

    for target in
      select * from (values
        ('audio-guide', '*'),
        ('louvre-eiffel', 'louvre'),
        ('seine-river', 'louvre')
      ) as t(product_id, combo_component)
    loop
      insert into public.product_availability_overrides
        (product_id, combo_component, visit_date, visit_time, is_closed, note, updated_at)
      values
        (target.product_id, target.combo_component, new.visit_date, new.visit_time,
         new.is_closed, 'sync-louvre', now())
      on conflict (product_id, combo_component, visit_date, visit_time)
      do update set
        is_closed = excluded.is_closed,
        note = coalesce(public.product_availability_overrides.note, excluded.note),
        updated_at = now();
    end loop;

    return new;
  elsif tg_op = 'DELETE' then
    if old.product_id <> 'louvre-e-guide'
       or old.visit_time = '__price__'
       or old.visit_date = date '1970-01-01' then
      return old;
    end if;

    -- Csak a szinkron/automatika által létrehozott sorokat töröljük.
    delete from public.product_availability_overrides
    where note in ('sync-louvre', 'auto-kedd')
      and visit_date = old.visit_date
      and visit_time = old.visit_time
      and (
        (product_id = 'audio-guide' and combo_component = '*')
        or (product_id = 'louvre-eiffel' and combo_component = 'louvre')
        or (product_id = 'seine-river' and combo_component = 'louvre')
      );

    return old;
  end if;

  return null;
end
$$;

drop trigger if exists sync_louvre_availability_trigger on public.product_availability_overrides;

create trigger sync_louvre_availability_trigger
after insert or update or delete on public.product_availability_overrides
for each row execute function public.sync_louvre_availability();

-- Egyszeri visszatöltés: a louvre-e-guide meglévő (nem ár) sorait tükrözzük,
-- hogy a jelenlegi állapot is konzisztens legyen.
insert into public.product_availability_overrides
  (product_id, combo_component, visit_date, visit_time, is_closed, note, updated_at)
select t.product_id, t.combo_component, src.visit_date, src.visit_time, src.is_closed, 'sync-louvre', now()
from public.product_availability_overrides src
cross join (values
  ('audio-guide', '*'),
  ('louvre-eiffel', 'louvre'),
  ('seine-river', 'louvre')
) as t(product_id, combo_component)
where src.product_id = 'louvre-e-guide'
  and src.visit_time <> '__price__'
  and src.visit_date <> date '1970-01-01'
on conflict (product_id, combo_component, visit_date, visit_time)
do update set
  is_closed = excluded.is_closed,
  note = coalesce(public.product_availability_overrides.note, excluded.note),
  updated_at = now();
