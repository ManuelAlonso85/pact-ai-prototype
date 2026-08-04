-- Sanitized portfolio sample: atomic, single-use beta access.
-- It demonstrates a product decision: constrain early access without leaking codes.

create table beta_invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  status text not null default 'available'
    check (status in ('available', 'redeemed', 'revoked')),
  redeemed_at timestamptz
);

create or replace function redeem_beta_invite(submitted_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_id uuid;
begin
  select id
    into selected_id
    from beta_invites
   where code_hash = encode(digest(upper(trim(submitted_code)), 'sha256'), 'hex')
     and status = 'available'
   for update;

  if selected_id is null then
    return 'invalid_or_used';
  end if;

  update beta_invites
     set status = 'redeemed', redeemed_at = now()
   where id = selected_id;

  return 'redeemed';
end;
$$;

-- Public clients should not call this function directly.
revoke all on function redeem_beta_invite(text) from public;

