import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a single instance to be reused
const supabase = createClientComponentClient()

export default supabase 