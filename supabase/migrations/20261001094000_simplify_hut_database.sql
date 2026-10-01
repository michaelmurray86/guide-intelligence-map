-- Simplify the Hut Database to the agreed core information set.

alter table public.huts
  add column if not exists sleeping_beds integer,
  add column if not exists sleeping_dormitories integer,
  add column if not exists winter_room_capacity integer,
  add column if not exists picnic_lunch_cost text,
  add column if not exists costs text,
  add column if not exists other_notes text;

-- Preserve the existing total sleeping capacity as the initial bed count.
update public.huts
set sleeping_beds = sleeping_capacity
where sleeping_beds is null
  and sleeping_capacity is not null;

alter table public.huts
  drop column if exists alternative_names,
  drop column if exists country,
  drop column if exists region,
  drop column if exists latitude,
  drop column if exists longitude,
  drop column if exists summer_access,
  drop column if exists winter_access,
  drop column if exists approach_routes,
  drop column if exists typical_approach_time,
  drop column if exists approach_difficulty,
  drop column if exists seasonal_restrictions,
  drop column if exists sleeping_capacity,
  drop column if exists winter_room,
  drop column if exists food_and_meals,
  drop column if exists water,
  drop column if exists toilets,
  drop column if exists electricity,
  drop column if exists wifi,
  drop column if exists cooking,
  drop column if exists blankets_mattresses,
  drop column if exists booking_required,
  drop column if exists vendor_status_expires_at,
  drop column if exists guardian_email,
  drop column if exists guardian_phone,
  drop column if exists max_capacity,
  drop column if exists emergency_information,
  drop column if exists nearby_hazards,
  drop column if exists useful_route_information,
  drop column if exists instructor_notes,
  drop column if exists photos,
  drop column if exists source;

create or replace function public.review_update_request(
  request_id bigint,
  decision text,
  comment text default null
)
returns public.update_requests
language plpgsql
security definer
set search_path=''
as $$
declare
  request_record public.update_requests%rowtype;
  reviewer_role text;
  note_category text;
  updated_request public.update_requests;
begin
  select role into reviewer_role
  from public.profiles
  where id=auth.uid();

  if reviewer_role not in ('approver','admin','superadmin') then
    raise exception 'Only approvers and admins can review update requests';
  end if;

  if decision not in ('approved','rejected') then
    raise exception 'Invalid update request decision';
  end if;

  select * into request_record
  from public.update_requests
  where id=request_id and status='pending'
  for update;

  if not found then
    raise exception 'Pending update request not found';
  end if;

  if request_record.request_type='delete' then
    select category into note_category
    from public.guide_notes
    where id=request_record.guide_note_id;

    if lower(coalesce(note_category,''))='hut'
       and reviewer_role not in ('admin','superadmin') then
      raise exception 'Only admins can delete Huts';
    end if;

    if decision='approved' then
      delete from public.guide_notes
      where id=request_record.guide_note_id;
    end if;

  elsif request_record.request_type='edit' and decision='approved' then
    update public.huts h
    set
      name=p.name,
      elevation_m=p.elevation_m,
      sleeping_beds=p.sleeping_beds,
      sleeping_dormitories=p.sleeping_dormitories,
      winter_room_capacity=p.winter_room_capacity,
      showers=p.showers,
      picnic_lunches=p.picnic_lunches,
      picnic_lunch_cost=p.picnic_lunch_cost,
      water_drinkable=p.water_drinkable,
      booking_url=p.booking_url,
      phone=p.phone,
      email=p.email,
      guardian_name=p.guardian_name,
      vendor=p.vendor,
      costs=p.costs,
      guide_rate_offered=p.guide_rate_offered,
      other_notes=p.other_notes,
      last_checked_at=p.last_checked_at,
      last_checked_by=p.last_checked_by,
      updated_at=now(),
      updated_by=(select name from public.profiles where id=auth.uid())
    from jsonb_to_record(request_record.proposed_data) as p(
      name text,
      elevation_m integer,
      sleeping_beds integer,
      sleeping_dormitories integer,
      winter_room_capacity integer,
      showers text,
      picnic_lunches boolean,
      picnic_lunch_cost text,
      water_drinkable boolean,
      booking_url text,
      phone text,
      email text,
      guardian_name text,
      vendor boolean,
      costs text,
      guide_rate_offered boolean,
      other_notes text,
      last_checked_at timestamptz,
      last_checked_by text
    )
    where h.id=request_record.hut_id;

    if not found then
      raise exception 'Hut record not found';
    end if;
  end if;

  update public.update_requests
  set
    status=decision,
    reviewed_by=auth.uid(),
    reviewed_at=now(),
    review_comment=comment
  where id=request_record.id
  returning * into updated_request;

  return updated_request;
end;
$$;

revoke all on function public.review_update_request(bigint,text,text)
  from public,anon;
grant execute on function public.review_update_request(bigint,text,text)
  to authenticated;
