import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('Supabase');

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Supabase credentials not configured. Supabase features disabled.');
      throw new Error('Supabase not configured');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });

    logger.info('Supabase client initialized');
  }

  return supabaseClient;
}

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('users').select('count').limit(1);
    
    if (error) {
      logger.error('Supabase connection test failed', error);
      return false;
    }
    
    logger.info('Supabase connection successful');
    return true;
  } catch (error: any) {
    logger.error('Supabase connection failed', error);
    return false;
  }
}
