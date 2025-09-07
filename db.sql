-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.budget_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid DEFAULT gen_random_uuid(),
  status character varying DEFAULT '50'::character varying,
  item_name character varying DEFAULT '255'::character varying,
  purchasing_source character varying DEFAULT '255'::character varying,
  quantity bigint,
  unit_price numeric,
  shipping_tax numeric,
  total_price numeric,
  purchase_link text,
  CONSTRAINT budget_items_pkey PRIMARY KEY (id),
  CONSTRAINT budget_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid DEFAULT gen_random_uuid(),
  description text,
  price numeric,
  quantity bigint,
  total_amount numeric,
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL DEFAULT '255'::character varying,
  description text,
  start_date date,
  end_date date,
  total_budget numeric,
  updated_at timestamp without time zone DEFAULT now(),
  customer_name character varying DEFAULT '50'::character varying,
  customer_desc text,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid DEFAULT gen_random_uuid(),
  transaction_date date,
  description character varying DEFAULT '255'::character varying,
  debit numeric,
  credit numeric,
  transaction_type character varying DEFAULT '50'::character varying,
  proof_document_url text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);