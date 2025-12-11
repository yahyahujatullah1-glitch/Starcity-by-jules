import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://voobijqmpshuwypkmihg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb2JpanFtcHNodXd5cGttaWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDgxODIsImV4cCI6MjA4MTAyNDE4Mn0.bto_OPUpMDIB2VEjwJUhsLAAXPjUYpHJGI6HIW_VB6g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
