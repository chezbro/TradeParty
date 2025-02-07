declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_STREAM_API_KEY: string
    STREAM_SECRET_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    STREAM_APP_ID: string
    NEXT_PUBLIC_APP_URL: string
    STRIPE_SECRET_KEY: string
    STRIPE_PRICE_ID: string
    NEXT_PUBLIC_GOOGLE_VERIFICATION?: string
    // Add any other environment variables you're using
  }
} 