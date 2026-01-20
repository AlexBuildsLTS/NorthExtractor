import { supabase } from '@/lib/supabase';
import { TablesInsert } from '@/supabase/database.types';

export const createScrapingJob = async (job: TablesInsert<'scraping_jobs'>) => {
  const { data, error } = await supabase
    .from('scraping_jobs')
    .insert(job)
    .select();

  if (error) {
    console.error('Error creating scraping job:', error);
    throw error;
  }
  return data[0];
};

export const createExtractedData = async (
  data: TablesInsert<'extracted_data'>,
) => {
  const { error } = await supabase.from('extracted_data').insert(data);

  if (error) {
    console.error('Error inserting extracted data:', error);
    throw error;
  }
};

export const createAiInsight = async (insight: TablesInsert<'ai_insights'>) => {
  const { error } = await supabase.from('ai_insights').insert(insight);

  if (error) {
    console.error('Error inserting AI insight:', error);
    throw error;
  }
};
