create or replace function public.delete_hut(hut_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text;
  note_id bigint;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('admin', 'superadmin') then
    raise exception 'Only admins and superadmins can delete Huts';
  end if;

  select guide_note_id into note_id from public.huts where id = hut_id;
  if note_id is null then
    raise exception 'Hut record not found';
  end if;

  delete from public.guide_notes where id = note_id;
end;
$$;

revoke execute on function public.delete_hut(bigint) from public;
revoke execute on function public.delete_hut(bigint) from anon;
grant execute on function public.delete_hut(bigint) to authenticated;
