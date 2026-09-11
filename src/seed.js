require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Talent = require('./models/Talent');
const Service = require('./models/Service');

const SERVICES = [
  {
    slug: 'bpo',
    title: 'Managed Back-Office & BPO Pods',
    icon: 'fa-headset',
    desc: '24/7 omnichannel support, order management, and secure quality audit workflows.',
    sla: '99.8%',
    speed: '72 Hours',
    savings: '58%',
    banner:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    order: 1,
  },
  {
    slug: 'staffing',
    title: 'Healthcare Remote Staffing',
    icon: 'fa-user-nurse',
    desc: 'Pre-vetted clinical ops, care coordinators, and telehealth liaisons for US systems.',
    sla: '99.9%',
    speed: '24 Hours',
    savings: '65%',
    banner:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    order: 2,
  },
  {
    slug: 'web',
    title: 'Web Development Solutions',
    icon: 'fa-laptop-code',
    desc: 'Custom web applications, secure enterprise portals, and scalable cloud architectures.',
    sla: '100%',
    speed: '72 Hours',
    savings: '55%',
    banner:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    order: 3,
  },
  {
    slug: 'design',
    title: 'Graphic Designing Solutions',
    icon: 'fa-palette',
    desc: 'High-impact brand identities, UI/UX systems, marketing collateral, and digital assets.',
    sla: '99.5%',
    speed: '24 Hours',
    savings: '60%',
    banner:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    order: 4,
  },
];

const TALENTS = [
  {
    name: 'Dr. Elena Rostova',
    role: 'Clinical Operations Lead',
    type: 'Healthcare',
    rate: 24,
    exp: '8+ yrs',
    rating: 4.9,
    certs: ['HIPAA Certified', 'RN BSN'],
    status: 'Available Now',
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    location: 'US-Eastern Time',
    skills: { ClinicalOps: 95, HIPAA: 100, EHR: 90, Coordination: 92, SLA: 98 },
    order: 1,
  },
  {
    name: 'Marcus Vance',
    role: 'Medical Billing & RCM Specialist',
    type: 'BPO & RCM',
    rate: 16,
    exp: '6 yrs',
    rating: 5.0,
    certs: ['Kareo Master', 'Epic Systems'],
    status: 'Available Now',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    location: 'Central Time',
    skills: { ClinicalOps: 60, HIPAA: 98, EHR: 95, Coordination: 85, SLA: 99 },
    order: 2,
  },
  {
    name: 'Sofia Chen',
    role: 'Senior Full-Stack Developer',
    type: 'Tech & Web',
    rate: 28,
    exp: '7 yrs',
    rating: 4.9,
    certs: ['AWS Certified', 'Next.js'],
    status: 'In Demand',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    location: 'Pacific Time',
    skills: { ClinicalOps: 40, HIPAA: 90, EHR: 88, Coordination: 70, SLA: 96 },
    order: 3,
  },
  {
    name: 'Lucas Brody',
    role: 'Senior UI/UX & Graphic Designer',
    type: 'Design Solutions',
    rate: 22,
    exp: '6 yrs',
    rating: 4.9,
    certs: ['Figma Master', 'Brand Systems'],
    status: 'Available Now',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    location: 'Eastern Time',
    skills: { ClinicalOps: 30, HIPAA: 80, EHR: 75, Coordination: 88, SLA: 95 },
    order: 4,
  },
];

async function seed() {
  await connectDB();

  // Services and talents are reference data — safe to replace wholesale.
  await Service.deleteMany({});
  await Service.insertMany(SERVICES);
  console.log(`[seed] services: ${SERVICES.length}`);

  await Talent.deleteMany({});
  await Talent.insertMany(TALENTS);
  console.log(`[seed] talents: ${TALENTS.length}`);

  // The admin account is only created when credentials are supplied and no
  // account exists yet — we never overwrite a real password.
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (email && password) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`[seed] admin already exists: ${existing.email} (left untouched)`);
    } else {
      await User.create({
        name: process.env.SEED_ADMIN_NAME || 'Teamliva Admin',
        email,
        password,
        role: 'admin',
      });
      console.log(`[seed] admin created: ${email}`);
    }
  } else {
    console.log(
      '[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin.\n' +
        '       Set them in .env, or POST /api/auth/register (open until the first account exists).'
    );
  }

  await mongoose.connection.close();
  console.log('[seed] done');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
