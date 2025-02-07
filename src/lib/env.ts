import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Stream
  NEXT_PUBLIC_STREAM_API_KEY: z.string().min(1),
  STREAM_SECRET_KEY: z.string().min(1),
  STREAM_APP_ID: z.string().min(1),
  
  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Redis (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Error Tracking
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Socket
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  
  // Optional configs
  NEXT_PUBLIC_FACETIME_HOST: z.string().url().optional(),
  NEXT_PUBLIC_GOOGLE_VERIFICATION: z.string().optional(),
});

const parseEnv = () => {
  try {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error(
        '❌ Invalid environment variables:',
        parsed.error.flatten().fieldErrors,
      );
      throw new Error('Invalid environment variables');
    }

    return parsed.data;
  } catch (error) {
    console.error('Error parsing environment variables:', error);
    // Return a default configuration for development
    if (process.env.NODE_ENV === 'development') {
      return {
        ...process.env,
        NODE_ENV: 'development'
      } as z.infer<typeof envSchema>;
    }
    throw error;
  }
};

export type Env = z.infer<typeof envSchema>;
export const env = parseEnv(); 