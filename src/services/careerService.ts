import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { CareerOption } from '@/types';
import type { Database } from '@/types/database';

type CareerRow = Database['public']['Tables']['careers']['Row'];

export const careerService = {
  async getCareers(): Promise<CareerOption[]> {
    if (!isSupabaseConfigured) {
      // Fallback local static data if Supabase connection is not present
      return [
        {
          id: '11111111-1111-4111-a111-111111111111',
          slug: 'software-developer',
          title: 'Software Developer',
          category: 'Software Engineering',
          description: 'Design, build, and maintain full-stack web applications, REST APIs, and core backend server architectures.',
          demandLevel: 'High',
          avgSalaryRange: 'Market Standard',
          requiredSkillsCount: 4,
          featured: true,
        },
        {
          id: '22222222-2222-4222-a222-222222222222',
          slug: 'data-scientist',
          title: 'Data Scientist',
          category: 'Data Science & AI',
          description: 'Analyze structured/unstructured datasets, design statistical models, and train machine learning algorithms.',
          demandLevel: 'High',
          avgSalaryRange: 'Market Standard',
          requiredSkillsCount: 3,
        },
        {
          id: '33333333-3333-4333-a333-333333333333',
          slug: 'devops-engineer',
          title: 'DevOps / Cloud Engineer',
          category: 'Infrastructure',
          description: 'Automate continuous integration pipelines, manage cloud container orchestration, and maintain high-availability infrastructure.',
          demandLevel: 'High',
          avgSalaryRange: 'Market Standard',
          requiredSkillsCount: 3,
        },
        {
          id: '44444444-4444-4444-a444-444444444444',
          slug: 'frontend-engineer',
          title: 'Frontend Engineer',
          category: 'Software Engineering',
          description: 'Craft intuitive, accessible user interfaces, client-side web application architectures, and visual design systems.',
          demandLevel: 'High',
          avgSalaryRange: 'Market Standard',
          requiredSkillsCount: 3,
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .order('title', { ascending: true });

      if (error || !data) return [];
      const rows = data as CareerRow[];

      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        description: row.description || '',
        demandLevel: 'High',
        avgSalaryRange: 'Market Standard',
        requiredSkillsCount: 4,
      }));
    } catch (e: unknown) {
      console.error('Error fetching careers:', e);
      return [];
    }
  },
};
