import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jinhdunxlfdkatylykbr.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbmhkdW54bGZka2F0eWx5a2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTg3OTIsImV4cCI6MjA4Njk5NDc5Mn0.coeipHtkL8J2BX1kRHFz-GVy-RnrE2UzPlqtVFpp95c";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
