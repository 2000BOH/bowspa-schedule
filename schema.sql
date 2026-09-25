-- Turso 데이터베이스에 한 번만 실행하세요.
create table if not exists schedules (
  week       text not null,          -- 예: '2026-9-4'  (연-월-주차)
  person     text not null,          -- lee | hong | han | kim
  data       text not null,          -- { work: {...}, sup: {...} } JSON
  updated_at text default (datetime('now')),
  primary key (week, person)
);
