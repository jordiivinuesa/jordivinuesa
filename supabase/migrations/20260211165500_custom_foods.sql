-- Create custom_foods table
create table if not exists custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  brand text,
  calories numeric not null, -- per 100g
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  barcode text,
  image_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table custom_foods enable row level security;

-- Create policies
create policy "Users can view own custom foods"
  on custom_foods for select
  using (auth.uid() = user_id);

create policy "Users can insert own custom foods"
  on custom_foods for insert
  with check (auth.uid() = user_id);

create policy "Users can update own custom foods"
  on custom_foods for update
  using (auth.uid() = user_id);

create policy "Users can delete own custom foods"
  on custom_foods for delete
  using (auth.uid() = user_id);

-- Create index for barcode lookups
create index if not exists idx_custom_foods_barcode on custom_foods(barcode);
create index if not exists idx_custom_foods_user_id on custom_foods(user_id);
