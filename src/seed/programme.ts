// Content for the Project Team, Events and Materials pages.
// Only facts published on shapeproject.org (pages and news posts) are used here;
// anything not yet published is shown as "planned" or "coming soon" until the CMS fills it in.
import { workPackages, partners } from './site';

export const coordinator = {
  name: 'Prof. Kirimi Kiriamiti',
  role: 'Project Coordinator',
  institution: 'Moi University',
  country: 'Kenya',
  text: 'Moi University coordinates SHAPE and leads overall implementation, project management and quality assurance across the consortium (Work Package 1).',
};

export const associatedPartners = [
  { name: 'Konza Technopolis Development Authority', country: 'Kenya', flag: 'ke', icon: 'Building2' },
  { name: 'Université du Burundi', country: 'Burundi', flag: 'bi', icon: 'GraduationCap' },
  { name: 'Institute of Social Policy and Research', country: 'South Sudan', flag: 'ss', icon: 'Landmark' },
] as const;

/** Partners enriched with the work packages each institution leads. */
export const institutions = partners.map((p) => ({
  ...p,
  leads: workPackages.filter((w) => w.lead === p.name).map((w) => ({ wp: w.wp, title: w.title, color: w.color, tint: w.tint })),
  region: ['Kenya', 'Somalia', 'Uganda'].includes(p.country) ? 'East Africa' : 'Europe',
}));

export type EventItem = {
  title: string;
  type: 'Meeting' | 'Launch' | 'Hackathon' | 'Training' | 'Pilot';
  start: string; // ISO date, or YYYY-MM for planned items
  end?: string;
  location: string;
  text: string;
  image?: string;
  link?: string;
  planned?: boolean;
  month: number; // project month, used on the Gantt chart
};

export const events: EventItem[] = [
  {
    title: 'SHAPE Project Official Launch',
    type: 'Launch',
    start: '2026-06-18',
    location: 'Online',
    text: 'Consortium partners from Kenya, Uganda, Somalia, Estonia, Germany and Lithuania met to establish a shared vision and align on the implementation plan.',
    image: '/images/news/WhatsApp-Image-2026-09-12-at-1.21.04-PM.jpeg',
    link: '/news/shape-project-officially-launches/',
    month: 18,
  },
  {
    title: 'International Partners Meeting',
    type: 'Meeting',
    start: '2026-09-28',
    end: '2026-10-02',
    location: 'Mombasa, Kenya',
    text: 'Hosted by Moi University: partners aligned on objectives, launched key work packages, visited Fort Jesus and the Mama Ngina Waterfront, and held technical workshops.',
    image: '/images/news/WhatsApp-Image-2026-09-29-at-2.37.40-PM.jpeg',
    link: '/news/shape-consortium-convenes-partners-meeting-in-mombasa-to-set-the-course-for-smart-city-education-in-east-africa/',
    month: 21,
  },
  {
    title: 'Train-the-Trainer Sandbox',
    type: 'Training',
    start: '2027-01',
    location: 'Partner universities',
    text: 'First cohort of trained trainers for the new smart city curriculum (deliverable D3.3).',
    planned: true,
    month: 25,
  },
  {
    title: 'Open Innovation Hackathons (×3)',
    type: 'Hackathon',
    start: '2027-01',
    end: '2027-10',
    location: 'East African partner universities',
    text: 'Three hackathons run through the new Open Innovation Labs, connecting students with city, industry and government challenges (deliverable D4.3).',
    planned: true,
    month: 25,
  },
  {
    title: 'Pilot Courses — First Student Cohort',
    type: 'Pilot',
    start: '2027-09',
    location: 'Partner universities',
    text: 'First students take the pilot smart city courses; feedback drives refinement before accreditation (deliverable D3.4).',
    planned: true,
    month: 33,
  },
];

export const photoAlbums = [
  {
    title: 'Partners Meeting, Mombasa',
    date: 'Sep–Oct 2026',
    link: events[1].link,
    photos: [
      ...Array.from({ length: 18 }, (_, i) => `/images/news/Shapeteam-${i + 1}.jpeg`),
      '/images/news/WhatsApp-Image-2026-09-29-at-2.37.40-PM.jpeg',
      '/images/news/WhatsApp-Image-2026-09-29-at-2.37.39-PM.jpeg',
      '/images/news/WhatsApp-Image-2026-09-29-at-2.37.38-PM.jpeg',
      '/images/news/WhatsApp-Image-2026-09-29-at-2.36.28-PM.jpeg',
      '/images/news/WhatsApp-Image-2026-09-29-at-2.36.27-PM.jpeg',
    ],
  },
  {
    title: 'Official Launch (online)',
    date: 'Jun 2026',
    link: events[0].link,
    photos: [
      '/images/news/WhatsApp-Image-2026-09-12-at-1.21.04-PM.jpeg',
      '/images/news/WhatsApp-Image-2026-09-12-at-1.21.05-PM-1.jpeg',
      '/images/news/WhatsApp-Image-2026-09-12-at-1.21.05-PM.jpeg',
    ],
  },
];

export const brandAssets = [
  { title: 'SHAPE + EU logo (colour)', file: '/images/Shape-and-EU-scaled.png', note: 'Use on light backgrounds' },
  { title: 'SHAPE logo (white)', file: '/images/White-SHAPE-final-Logo-1-1024x431.png', note: 'Use on dark or photo backgrounds', dark: true },
  { title: 'Co-funded by the EU emblem', file: '/images/EU-scaled.png', note: 'Required on all project outputs' },
  { title: 'Open University of Kenya logo', file: '/images/ouk-logo.png', note: 'Host institution — OUK teal #037b90 · coral #ff7f50' },
  { title: 'SHAPE icon', file: '/images/cropped-SHAPE-final-Logo-192x192.jpeg', note: 'Square avatar / favicon' },
];
