import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://pehrgemvfoqtjaaukhbz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaHJnZW12Zm9xdGphYXVraGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTgwMDYsImV4cCI6MjA4NzUzNDAwNn0.fsVpSV0JngoE04CUcSLcxzDxncbFdgFuVJ8D674Pi0U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)