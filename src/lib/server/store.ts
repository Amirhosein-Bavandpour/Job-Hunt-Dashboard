import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data.json');

interface Store {
  users: User[];
  apps: App[];
  companies: Company[];
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface App {
  id: string;
  company: string;
  position: string;
  status: string;
  salary: number | null;
  location: string;
  workMode: string;
  jobUrl?: string;
  notes?: string;
  interviewNotes?: string;
  appliedAt?: string;
  interviewDate?: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  website: string;
  note: string;
}

function ensureFile() {
  if (!existsSync(DATA_PATH)) {
    mkdirSync(process.cwd(), { recursive: true });
    writeFileSync(DATA_PATH, JSON.stringify({
      users: [],
      apps: [
        {
          id: '1', company: 'Acme Corp', position: 'Frontend Developer',
          status: 'interview', salary: 45000, location: 'Tehran', workMode: 'hybrid',
          jobUrl: 'https://acme.example.com/job', notes: 'Well-known product; strong design team.',
          interviewNotes: 'Q: How do you scale a component library? A: Design tokens + Storybook + versioning. Q: React perf — know useMemo/useCallback, code splitting, virtualize long lists.',
          appliedAt: '2026-09-01', interviewDate: '2026-09-18', createdAt: '2026-09-01T10:00:00Z',
        },
        {
          id: '2', company: 'Beta Inc', position: 'React Developer',
          status: 'applied', salary: 42000, location: 'Tehran', workMode: 'remote',
          jobUrl: 'https://beta.example.com/job', notes: 'Remote-friendly; good benefits.',
          interviewNotes: 'Research: they use Next.js 14 + Tailwind. Question to ask: how do you handle SSR vs CSR split?',
          appliedAt: '2026-09-03', createdAt: '2026-09-03T10:00:00Z',
        },
        {
          id: '3', company: 'Gamma LLC', position: 'UI Engineer',
          status: 'saved', salary: 38000, location: 'Tehran', workMode: 'on-site',
          jobUrl: 'https://gamma.example.com/job', notes: 'Saving for later; interesting stack.',
          appliedAt: '2026-09-05', createdAt: '2026-09-05T10:00:00Z',
        },
      ],
      companies: [
        { id: '1', name: 'Acme Corp', website: 'https://acme.example.com', note: 'Product company, design-led.' },
        { id: '2', name: 'Beta Inc', website: 'https://beta.example.com', note: 'Remote-friendly startup.' },
        { id: '3', name: 'Gamma LLC', website: 'https://gamma.example.com', note: 'Saved for later.' },
      ],
    }, null, 2));
  }
}

function readData() {
  ensureFile();
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf8')) as Store;
  } catch {
    return { users: [], apps: [], companies: [] };
  }
}

function writeData(store: Store) {
  writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
}

export type { Store };
export { readData, writeData };
