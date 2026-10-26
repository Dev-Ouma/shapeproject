export const contact = {
  phone: '+252613997777',
  email: 'shape@mu.edu.so',
};

export const socials = [
  { name: 'Facebook', href: 'https://facebook.com/shapeprojecteu', icon: 'facebook' },
  { name: 'X', href: 'https://x.com/shapeprojecteu', icon: 'x' },
  { name: 'LinkedIn', href: 'http://www.linkedin.com/in/shapeprojecteu', icon: 'linkedin' },
  { name: 'YouTube', href: 'https://youtube.com/@shapeprojecteu', icon: 'youtube' },
  { name: 'Instagram', href: 'https://instagram.com/shapeprojecteu', icon: 'instagram' },
] as const;

export type NavItem = { label: string; href: string; children?: NavItem[] };

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about/',
    children: [
      { label: 'About Project', href: '/about/' },
      { label: 'Partners', href: '/partners/' },
      { label: 'Project Team', href: '/project-team/' },
    ],
  },
  { label: 'Deliverables', href: '/deliverables/' },
  { label: 'Project Team', href: '/project-team/' },
  { label: 'Materials', href: '/materials/' },
  { label: 'Events', href: '/events/' },
  { label: 'Project Book', href: '/project-book/' },
  { label: 'Contact', href: '/contact/' },
];

export const slides = [
  {
    image: '/images/slider1.png',
    title: 'Empowering Universities to Shape Smarter Cities',
    text: 'SHAPE strengthens higher education institutions in East Africa by developing innovative curricula, building academic capacity, and fostering international collaboration to prepare the next generation of smart city leaders.',
    cta: { label: 'Learn More', href: '/about/' },
  },
  {
    image: '/images/slider2.png',
    title: 'Driving Innovation for Inclusive and Sustainable Urban Development',
    text: 'Through education, research, artificial intelligence, open data, and innovation, SHAPE supports the development of resilient, people-centered, and sustainable smart cities across Kenya, Somalia, and Uganda.',
    cta: { label: 'Explore Our Activities', href: '/about/#thematic' },
  },
  {
    image: '/images/slider3.png',
    title: 'Connecting Europe and East Africa for a Smarter Future',
    text: 'SHAPE brings together nine universities and regional stakeholders to promote knowledge exchange, strengthen institutional capacity, and establish a sustainable EU–East Africa Smart City Alliance.',
    cta: { label: 'Meet Our Partners', href: '/#shape_partners' },
  },
];

export const facts = [
  { num: '36', unit: 'months', icon: 'Calendar', label: 'Project Duration', sub: '2025 – 2028', text: 'Three years, from curriculum design and staff training through to a self-sustaining regional alliance.', tag: 'ERASMUS-EDU-2025-CBHE-STRAND-2' },
  { num: '9', unit: 'partners', icon: 'GraduationCap', label: 'Partner Institutions', sub: 'EU & East Africa', text: 'Nine universities, coordinated by Moi University, pairing European technical expertise with East African context.', tag: 'Coordinator: Moi University' },
  { num: '3', unit: 'countries', icon: 'Globe', label: 'East African Focus', sub: 'Direct impact zone', text: 'Higher education institutions and city stakeholders in Kenya, Somalia, and Uganda are the primary beneficiaries.', tag: 'Kenya · Somalia · Uganda' },
  { num: '12', unit: 'areas', icon: 'Lightbulb', label: 'Thematic Focus', sub: 'AI to urban planning', text: 'From AI and open data to smart mobility, energy, health, and community engagement in city planning.', tag: '12 smart city domains' },
  { num: 'Erasmus+', unit: '', icon: 'Star', label: 'EACEA Funded', sub: 'Capacity Building', text: 'Backed by the European Education and Culture Executive Agency under Capacity Building in Higher Education.', tag: 'Strand 2 · CBHE' },
  { num: '1', unit: 'alliance', icon: 'Network', label: 'Regional Alliance', sub: 'Beyond the project', text: 'A new EU–East Africa Smart Cities Alliance keeps universities, industry, and government collaborating long-term.', tag: 'Lasting beyond 2028' },
] as const;

export const partners = [
  { name: 'Moi University', role: 'Coordinator', country: 'Kenya', flag: 'ke', logo: '/images/moi-university.png', url: 'https://mu.ac.ke/', text: 'Project coordinator, leading overall implementation of SHAPE.' },
  { name: 'University of Tartu', role: 'Academic Partner', country: 'Estonia', flag: 'ee', logo: '/images/universitat-tartu-logo-png_seeklogo-495546-Dimitris-Simeonidis.png', url: 'https://cs.ut.ee/en', text: 'European partner contributing digital innovation and research expertise.' },
  { name: 'Otto-von-Guericke-University Magdeburg', role: 'Academic Partner', country: 'Germany', flag: 'de', logo: '/images/OVGU-Logo.jpeg', url: 'https://www.ovgu.de/', text: 'Technical partner supporting AI and smart city engineering.' },
  { name: 'Red Sea University', role: 'Academic Partner', country: 'Somalia', flag: 'so', logo: '/images/Redsea_logo.jpeg', url: 'https://rsu.edu.so/', text: 'Academic partner strengthening higher education and local capacity.' },
  { name: 'Open University of Kenya', role: 'Academic Partner', country: 'Kenya', flag: 'ke', logo: '/images/OUK-Enhanced-Logo.png', url: 'https://ouk.ac.ke/', text: 'Distance-learning partner expanding access to smart city education.' },
  { name: 'Mogadishu University', role: 'Academic Partner', country: 'Somalia', flag: 'so', logo: '/images/MU-Logo-Best-2.png', url: 'https://mu.edu.so', text: 'Academic partner advancing smart city curricula and research.' },
  { name: 'Makerere University', role: 'Academic Partner', country: 'Uganda', flag: 'ug', logo: '/images/makerere_logo.png', url: 'https://mak.ac.ug/', text: "Leading research partner within Uganda's higher education sector." },
  { name: 'Kampala International University', role: 'Academic Partner', country: 'Uganda', flag: 'ug', logo: '/images/logo-of-KIU.jpg', url: 'https://kiu.ac.ug/', text: 'Academic partner building institutional capacity and skills.' },
  { name: 'Lithuanian University of Health Sciences', role: 'Academic Partner', country: 'Lithuania', flag: 'lt', logo: '/images/LSMU_PAGRINDINIS-juodas-scaled.png', url: 'https://lsmu.lt/en/', text: 'European partner contributing smart health expertise.' },
];

export const aboutParagraphs = [
  'The Smart City Higher Education Advancement Program in East Africa (SHAPE) is an Erasmus+ Capacity Building in Higher Education initiative designed to address the growing shortage of smart city skills across East Africa, particularly in Kenya, Somalia, and Uganda. Rapid urbanization in the region has created increasing demand for professionals capable of planning, designing, and managing smart, sustainable, and inclusive cities. However, higher education institutions currently lack specialized curricula, qualified academic staff, practical training facilities, and strong collaboration with industry and public institutions.',
  'SHAPE responds to these challenges by modernizing higher education through innovative curricula, academic capacity building, digital learning, research collaboration, and open innovation. The project combines the technical expertise of European universities with the contextual knowledge of East African institutions to develop educational programmes that reflect the realities and priorities of African cities rather than replicating models developed elsewhere.',
  "The project will introduce new Master's level courses and micro-credentials covering key smart city domains, including Artificial Intelligence, Open Data, Smart Mobility, Smart Energy, Smart Health, Community Engagement, and Sustainable Urban Development. Academic staff will receive specialized training, while universities will establish Open Innovation Labs to promote entrepreneurship, applied research, hackathons, and collaboration with industry and government.",
  'Beyond curriculum development, SHAPE aims to create lasting partnerships between universities, municipalities, industry, civil society, and policymakers through a new EU–East Africa Smart Cities Alliance. By strengthening higher education institutions and producing highly skilled graduates, the project contributes to sustainable economic growth, digital transformation, and resilient urban development throughout East Africa. The initiative also aligns closely with the EU Global Gateway Strategy, supporting digital innovation, green transition, sustainable transport, and inclusive governance across Sub-Saharan Africa.',
];

export const goal =
  'To strengthen higher education institutions in East Africa by developing innovative academic programmes, practical innovation ecosystems, and skilled graduates capable of designing, implementing, and sustaining smart, inclusive, and sustainable cities across Kenya, Somalia, and Uganda.';
export const mission =
  'To modernize higher education through innovative curricula, digital technologies, industry collaboration, and capacity building that empower universities to produce professionals with the knowledge, skills, and leadership needed to drive sustainable smart city development in East Africa.';

export const thematicAreas = [
  { title: 'Smart Cities & Sustainable Urban Development', icon: 'Building2' },
  { title: 'Artificial Intelligence & Data-Driven Decision Making', icon: 'Cpu' },
  { title: 'Open Data & Digital Governance', icon: 'Database' },
  { title: 'Smart Energy & Renewable Energy Systems', icon: 'Zap' },
  { title: 'Smart Mobility & Intelligent Transport Systems', icon: 'Bus' },
  { title: 'Smart Health & Digital Healthcare', icon: 'ShieldPlus' },
  { title: 'Internet of Things (IoT) & Sensor Technologies', icon: 'Radio' },
  { title: 'Community Engagement & Citizen Participation', icon: 'Users' },
  { title: 'Innovation & Entrepreneurship', icon: 'Lightbulb' },
  { title: 'Digital Transformation in Higher Education', icon: 'Monitor' },
  { title: 'Open Innovation Labs & Hackathons', icon: 'FlaskConical' },
  { title: 'Capacity Building & Curriculum Development', icon: 'GraduationCap' },
] as const;

export const targetGroups = [
  { title: 'Universities & HEIs in Kenya, Somalia & Uganda', icon: 'School' },
  { title: 'Academic Staff, Researchers & Administrators', icon: 'UserRound' },
  { title: 'Undergraduate & Postgraduate Students', icon: 'BookOpen' },
  { title: 'Government Institutions & Municipalities', icon: 'Landmark' },
  { title: 'Smart City Practitioners & Urban Planners', icon: 'Ruler' },
  { title: 'Technology Companies & Innovation Hubs', icon: 'Briefcase' },
  { title: 'Entrepreneurs & Startups', icon: 'Rocket' },
  { title: 'Civil Society Organizations', icon: 'HeartHandshake' },
  { title: 'Local Communities in Urban Development', icon: 'Activity' },
  { title: 'Public & Private Sector Stakeholders', icon: 'Handshake' },
] as const;

export const impacts = [
  { icon: 'Mail', title: 'New Accredited Curricula', text: 'New accredited smart city curricula and micro-credential programmes introduced across partner universities.' },
  { icon: 'UserCheck', title: 'Stronger Academic Staff', text: 'Academic staff equipped with modern teaching methodologies and advanced smart city competencies.' },
  { icon: 'Lightbulb', title: 'Open Innovation Labs', text: 'Open Innovation Labs established within East African universities to promote innovation, entrepreneurship, and applied research.' },
  { icon: 'Users', title: 'Deeper Collaboration', text: 'Stronger collaboration between universities, governments, industry, and local communities in addressing urban development challenges.' },
  { icon: 'FileText', title: 'Employable Graduates', text: 'Enhanced digital, technical, and entrepreneurial skills among students and graduates, improving employability and regional economic growth.' },
  { icon: 'Globe', title: 'International Collaboration', text: 'Increased international collaboration through virtual exchanges, joint research, and knowledge sharing between European and East African institutions.' },
  { icon: 'Network', title: 'A Lasting Alliance', text: "A sustainable EU–East Africa Smart Cities Alliance established to continue collaboration beyond the project's lifetime." },
  { icon: 'TrendingUp', title: 'Long-Term Regional Impact', text: 'Long-term contribution to inclusive, resilient, and sustainable smart city development across East Africa through higher education transformation.' },
] as const;

// Month 1 = January 2025, as on the original site.
export const PROJECT_START = new Date(Date.UTC(2025, 0, 1));
export const PROJECT_MONTHS = 36;
export function projectMonth(date: Date = new Date()): number {
  const m = (date.getUTCFullYear() - PROJECT_START.getUTCFullYear()) * 12 + (date.getUTCMonth() - PROJECT_START.getUTCMonth()) + 1;
  return Math.min(Math.max(m, 1), PROJECT_MONTHS);
}
export const CURRENT_PROJECT_MONTH = projectMonth();

export const workPackages = [
  {
    wp: 1, icon: 'Settings', color: '#037B90', tint: '#E3F3F6', lead: 'Moi University', start: 1, end: 36,
    title: 'Project Management & Coordination Activities',
    summary: 'Oversees day-to-day coordination, quality assurance, and reporting to keep SHAPE on schedule and aligned across every partner institution.',
    deliverables: [
      { code: 'D1.1', desc: 'Data management plan' },
      { code: 'D1.2', desc: 'Progress Report to EU' },
      { code: 'D1.3', desc: 'Quality assurance: MEAL — monitoring, evaluation, accountability and learning strategy' },
    ],
  },
  {
    wp: 2, icon: 'PencilRuler', color: '#16A394', tint: '#E7F8F5', lead: 'Open University of Kenya', start: 2, end: 12,
    title: 'Establishing Design Requirements for Smart Cities in Sub-Saharan Africa',
    listTitle: 'Establishing Design Requirements for Building Smart Cities in Sub-Saharan Africa Region',
    summary: "Assesses regional needs and educational gaps to shape a strategic roadmap for a smart city curriculum built for East Africa's realities.",
    deliverables: [
      { code: 'D2.1', desc: 'Report on needs and competencies for smart cities in East Africa' },
      { code: 'D2.2', desc: 'Report on educational reform needs in partner universities in East Africa' },
      { code: 'D2.3', desc: 'Strategic roadmap for East African partner universities to develop a comprehensive smart city curriculum' },
    ],
  },
  {
    wp: 3, icon: 'BookOpen', color: '#7C5CFC', tint: '#F1EDFF', lead: 'Kampala International University', start: 10, end: 33,
    title: 'Building a New Educational Curriculum for Smart Cities',
    listTitle: 'Building a New Educational Curriculum for Smart Cities Across EU and Sub-Saharan Africa',
    summary: "Develops and pilots new Master's-level courses, open online learning, and trainer programmes spanning smart city disciplines.",
    deliverables: [
      { code: 'D3.1', desc: "Master's-level new and updated educational curriculum on smart cities and their different aspects (e.g. smart energy, smart health etc.)" },
      { code: 'D3.2', desc: 'Open online courses' },
      { code: 'D3.3', desc: 'Train the Trainer sandbox — first cohort of trained trainers' },
      { code: 'D3.4', desc: 'First cohort of students from pilot courses — feedback and refinement' },
      { code: 'D3.5', desc: "Accreditation of developed micro-credentials and updated master's programmes" },
    ],
  },
  {
    wp: 4, icon: 'Zap', color: '#FF7F50', tint: '#FFEEE6', lead: 'University of Tartu', start: 25, end: 34,
    title: 'Implementation of Smart City Acceleration & Open Innovation Programme',
    listTitle: 'Implementation of Smart City Acceleration Initiative & Open Innovation Programme',
    summary: 'Establishes Open Innovation Labs and hackathons, and launches the EU–East Africa Smart City Alliance, turning research into practice.',
    deliverables: [
      { code: 'D4.1', desc: 'Handbook on training of trainers for open innovation / smart city labs' },
      { code: 'D4.2', desc: 'Open innovation labs in partner universities of East Africa' },
      { code: 'D4.3', desc: '3 Open Innovation Hackathons' },
      { code: 'D4.4', desc: 'Initiation document for the EU–East Africa Smart City Alliance' },
      { code: 'D4.5', desc: 'Report on virtual exchanges' },
    ],
  },
  {
    wp: 5, icon: 'Megaphone', color: '#E4568C', tint: '#FCEBF1', lead: 'Mogadishu University', start: 1, end: 36,
    title: 'Dissemination, Exploitation, Sustainability & Communication',
    listTitle: 'Dissemination, Exploitation, Sustainability and Communication Management',
    summary: "Builds SHAPE's public presence and long-term sustainability through communication strategy, outreach, and digital channels.",
    deliverables: [
      { code: 'D5.1', desc: 'Dissemination, communication and networking strategy' },
      { code: 'D5.2', desc: 'Website and social media pages development' },
      { code: 'D5.3', desc: 'Sustainability strategy' },
      { code: 'D5.4', desc: 'List of outreach activities' },
    ],
  },
];

export type Status = 'done' | 'progress' | 'upcoming';

export function wpStatus(wp: { start: number; end: number }): Status {
  if (wp.end < CURRENT_PROJECT_MONTH) return 'done';
  if (wp.start > CURRENT_PROJECT_MONTH) return 'upcoming';
  return 'progress';
}

export const statusLabel: Record<Status, string> = {
  done: 'Completed',
  progress: 'In Progress',
  upcoming: 'Upcoming',
};

export function wpProgress(wp: { start: number; end: number }): number {
  const s = wpStatus(wp);
  if (s === 'done') return 100;
  if (s === 'upcoming') return 0;
  const pct = Math.round(((CURRENT_PROJECT_MONTH - wp.start) / (wp.end - wp.start)) * 100);
  return Math.max(4, Math.min(96, pct));
}

export const disclaimer =
  'Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.';
