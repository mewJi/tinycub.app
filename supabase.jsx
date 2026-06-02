const SUPABASE_URL = "https://atlpsgdwhwjmmxcmecsa.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bHBzZ2R3aHdqbW14Y21lY3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNzkxODMsImV4cCI6MjA5NTk1NTE4M30.q7b11JzvXWvTnVL95KfFFvG8EySUhmfCOQML7MjwXiU";

window.supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
