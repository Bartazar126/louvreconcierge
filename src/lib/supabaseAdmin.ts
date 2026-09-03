import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type OrderRow = {
  id: string;
  order_number: number;
  combo_group_id: string | null;
  combo_component: string | null;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string | null;
  visit_date: string;
  visit_time: string;
  order_type: string;
  product_id: string;
  adults: number;
  children: number;
  adult_count: number;
  youth_count: number;
  child_count: number;
  infant_count: number;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string | null;
  // Optional EU ticket columns; absent until orders_eu_ticket_upgrade.sql runs.
  ticket_region?: string | null;
  visitor_names?: string | null;
};

export type AvailabilityOverrideRow = {
  id: string;
  created_at: string;
  updated_at: string;
  product_id: string;
  combo_component?: string | null;
  visit_date: string;
  visit_time: string;
  is_closed: boolean;
  note: string | null;
};

export type ProductPriceRow = {
  product_id: string;
  face_value: number;
  eguide_fee: number;
  service_fee: number;
  updated_at: string;
};

export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase admin client is not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
