-- Pathfinder Phase 2 Reference Seed Catalog Migration
-- Description: Inserts legitimate production reference catalog records for careers, core skills, and career-skill mapping. Zero fake user or progress data.

-- 1. SEED CAREERS CATALOG
INSERT INTO public.careers (id, slug, title, category, description) VALUES
  ('11111111-1111-4111-a111-111111111111', 'software-developer', 'Software Developer', 'Software Engineering', 'Design, build, and maintain full-stack web applications, REST APIs, and core backend server architectures.'),
  ('22222222-2222-4222-a222-222222222222', 'data-scientist', 'Data Scientist', 'Data Science & AI', 'Analyze structured/unstructured datasets, design statistical models, and train machine learning algorithms.'),
  ('33333333-3333-4333-a333-333333333333', 'devops-engineer', 'DevOps / Cloud Engineer', 'Infrastructure', 'Automate continuous integration pipelines, manage cloud container orchestration, and maintain high-availability infrastructure.'),
  ('44444444-4444-4444-a444-444444444444', 'frontend-engineer', 'Frontend Engineer', 'Software Engineering', 'Craft intuitive, accessible user interfaces, client-side web application architectures, and visual design systems.')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description;

-- 2. SEED SKILLS CATALOG
INSERT INTO public.skills (id, slug, name, category, difficulty, description, estimated_hours) VALUES
  ('a1111111-1111-4111-b111-111111111111', 'python-programming', 'Python Programming', 'Programming Languages', 'beginner', 'Core syntax, data types, control flow, functions, and object-oriented programming in Python.', 30),
  ('a2222222-2222-4222-b222-222222222222', 'dsa-fundamentals', 'Data Structures & Algorithms', 'Computer Science Fundamentals', 'intermediate', 'Arrays, linked lists, stacks, queues, hash maps, sorting algorithms, and big-O analysis.', 50),
  ('a3333333-3333-4333-b333-333333333333', 'sql-dbms', 'SQL & Database Management Systems', 'Database Systems', 'intermediate', 'Relational data modeling, SQL queries, normalization, indexing, and transaction management.', 40),
  ('a4444444-4444-4444-b444-444444444444', 'html-css-fundamentals', 'HTML5 & Modern CSS', 'Web Development', 'beginner', 'Semantic markup, flexbox, grid, responsive layout principles, and accessibility standards.', 25),
  ('a5555555-5555-4555-b555-555555555555', 'javascript-typescript', 'JavaScript & TypeScript', 'Programming Languages', 'intermediate', 'Modern ECMAScript features, async/await, type system annotations, and DOM manipulation.', 45),
  ('a6666666-6666-4666-b666-666666666666', 'react-framework', 'React Framework', 'Frontend Development', 'intermediate', 'Component-driven architecture, state management, hooks, routing, and lifecycle performance.', 40),
  ('a7777777-7777-4777-b777-777777777777', 'linux-system-admin', 'Linux Systems & Shell Scripting', 'Infrastructure', 'intermediate', 'Command line utilities, file system permissions, process management, and bash automation.', 35),
  ('a8888888-8888-4888-b888-888888888888', 'docker-containers', 'Docker Containerization', 'DevOps & Cloud', 'intermediate', 'Building container images, writing Dockerfiles, compose multi-container environments, and networking.', 30)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  estimated_hours = EXCLUDED.estimated_hours;

-- 3. SEED CAREER-SKILLS MATRIX
INSERT INTO public.career_skills (career_id, skill_id, importance) VALUES
  -- Software Developer
  ('11111111-1111-4111-a111-111111111111', 'a1111111-1111-4111-b111-111111111111', 'essential'),
  ('11111111-1111-4111-a111-111111111111', 'a2222222-2222-4222-b222-222222222222', 'essential'),
  ('11111111-1111-4111-a111-111111111111', 'a3333333-3333-4333-b333-333333333333', 'essential'),
  ('11111111-1111-4111-a111-111111111111', 'a5555555-5555-4555-b555-555555555555', 'recommended'),

  -- Data Scientist
  ('22222222-2222-4222-a222-222222222222', 'a1111111-1111-4111-b111-111111111111', 'essential'),
  ('22222222-2222-4222-a222-222222222222', 'a2222222-2222-4222-b222-222222222222', 'recommended'),
  ('22222222-2222-4222-a222-222222222222', 'a3333333-3333-4333-b333-333333333333', 'essential'),

  -- DevOps Engineer
  ('33333333-3333-4333-a333-333333333333', 'a7777777-7777-4777-b777-777777777777', 'essential'),
  ('33333333-3333-4333-a333-333333333333', 'a8888888-8888-4888-b888-888888888888', 'essential'),
  ('33333333-3333-4333-a333-333333333333', 'a1111111-1111-4111-b111-111111111111', 'recommended'),

  -- Frontend Engineer
  ('44444444-4444-4444-a444-444444444444', 'a4444444-4444-4444-b444-444444444444', 'essential'),
  ('44444444-4444-4444-a444-444444444444', 'a5555555-5555-4555-b555-555555555555', 'essential'),
  ('44444444-4444-4444-a444-444444444444', 'a6666666-6666-4666-b666-666666666666', 'essential')
ON CONFLICT (career_id, skill_id) DO UPDATE SET
  importance = EXCLUDED.importance;
