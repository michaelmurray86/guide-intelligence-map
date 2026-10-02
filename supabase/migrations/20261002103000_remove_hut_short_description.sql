-- Remove the redundant Hut short description. Full information lives in Hut Details.
update public.guide_notes set description='' where category='hut';
alter table public.huts drop column if exists short_description;
create or replace function public.review_update_request(request_id bigint, decision text, comment text default null)
returns public.update_requests
language plpgsql
security definer
set search_path to ''
as $function$
declare
  request_record public.update_requests%rowtype;
  reviewer_role text;
  note_category text;
  updated_request public.update_requests;
begin
  select role into reviewer_role from public.profiles where id=auth.uid();
  if reviewer_role not in ('approver','admin','superadmin') then raise exception 'Only approvers and admins can review update requests'; end if;
  if decision not in ('approved','rejected') then raise exception 'Invalid update request decision'; end if;
  select * into request_record from public.update_requests where id=request_id and status='pending' for update;
  if not found then raise exception 'Pending update request not found'; end if;

  if request_record.request_type='delete' then
    select category into note_category from public.guide_notes where id=request_record.guide_note_id;
    if lower(coalesce(note_category,''))='hut' and reviewer_role not in ('admin','superadmin') then raise exception 'Only admins can delete Huts'; end if;
    if decision='approved' then delete from public.guide_notes where id=request_record.guide_note_id; end if;
  elsif request_record.request_type='edit' and decision='approved' then
    update public.huts h
    set name=p.name, elevation_m=p.elevation_m, sleeping_beds=p.sleeping_beds, sleeping_dormitories=p.sleeping_dormitories,
        winter_room_capacity=p.winter_room_capacity, winter_room_details=p.winter_room_details, opening_date=p.opening_date,
        closing_date=p.closing_date, showers=p.showers, picnic_lunches=p.picnic_lunches, picnic_lunch_cost=p.picnic_lunch_cost,
        dinner_time=p.dinner_time, water_drinkable=p.water_drinkable, booking_url=p.booking_url, phone=p.phone, email=p.email,
        guardian_name=p.guardian_name, vendor=p.vendor, costs=p.costs, guide_rate_offered=p.guide_rate_offered,
        other_notes=p.other_notes, photos=coalesce(p.photos, '{}'), last_checked_at=p.last_checked_at,
        last_checked_by=p.last_checked_by, updated_at=now(), updated_by=(select name from public.profiles where id=auth.uid())
    from jsonb_to_record(request_record.proposed_data) as p(
      name text, elevation_m integer, sleeping_beds integer, sleeping_dormitories integer, winter_room_capacity integer,
      winter_room_details text, opening_date date, closing_date date, showers text, picnic_lunches boolean,
      picnic_lunch_cost text, dinner_time text, water_drinkable boolean, booking_url text, phone text, email text,
      guardian_name text, vendor boolean, costs text, guide_rate_offered boolean, other_notes text, photos text[],
      last_checked_at timestamptz, last_checked_by text
    )
    where h.id=request_record.hut_id;
    if not found then raise exception 'Hut record not found'; end if;

    update public.guide_notes g
    set title=p.name, description='', photos=coalesce(p.photos, '{}'), updated_at=now(),
        updated_by=(select name from public.profiles where id=auth.uid())
    from jsonb_to_record(request_record.proposed_data) as p(name text, photos text[])
    where g.id=(select guide_note_id from public.huts where id=request_record.hut_id);
  end if;

  update public.update_requests set status=decision, reviewed_by=auth.uid(), reviewed_at=now(), review_comment=comment
  where id=request_record.id returning * into updated_request;
  return updated_request;
end;
$function$;
