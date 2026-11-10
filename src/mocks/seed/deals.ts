import type { DealMode } from '@/features/deals/types';

/** [SAMPLE] Fictional brands, prices, branches and distances. Never ship as real data. */

export const CATEGORIES = [
  { id: 'all', label: 'Everything' },
  { id: 'food', label: 'Food & drink' },
  { id: 'books', label: 'Books & stationery' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'tech', label: 'Tech & repairs' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'travel', label: 'Travel' },
  { id: 'care', label: 'Grooming' },
];

export type SeedOption = {
  id: string;
  label: string;
  subLabel: string;
  regularPrice: number;
  studentPrice: number;
};

export type SeedBranch = {
  id: string;
  name: string;
  city: string;
  address: string;
  opensAt: string;
  closesAt: string;
  distance: string;
  statusLabel: string;
  isOpen: boolean;
};

export type SeedDeal = {
  id: string;
  slug: string;
  merchantId: string;
  status: 'draft' | 'live' | 'ended';
  title: string;
  heading: string;
  description: string;
  summaryLine: string;
  mode: DealMode;
  categoryId: string;
  brand: { name: string; initials: string; color: string };
  stamp: { offer: string; label: string };
  stampLong: string;
  location: string;
  priceUnit: string | null;
  artSeed: number;
  image: string | null;
  facts: { icon: 'calendar' | 'clock' | 'store' | 'shield'; label: string }[];
  branchesHeading: string;
  branches: SeedBranch[];
  terms: { label: string; value: string }[];
  options: SeedOption[];
  optionsLegend: string;
  deliveryFee: number;
  deliveryEstimate: string;
  maxQuantity: number;
  claimsPerDay: number;
  endsLabel: string;
  relatedHeading: string;
};

type Brief = {
  id: number;
  slug: string;
  brand: string;
  initials: string;
  color: string;
  categoryId: string;
  mode: DealMode;
  offer: string;
  label?: string;
  title: string;
  regularPrice: number;
  studentPrice: number;
  area: string;
  address: string;
  distance: string;
  priceUnit?: string;
  summary: string;
  image: string;
};

const DEFAULT_TERMS = {
  store: {
    label: 'In store',
    value: 'Show your live code. Screenshots and expired codes are not accepted.',
  },
  online: { label: 'Delivery', value: 'Delivery charge is added at checkout.' },
  other: {
    label: 'Other offers',
    value: "Can't be combined with other promotions or bank discounts.",
  },
};

function fromBrief(brief: Brief): SeedDeal {
  const isOnlineOnly = brief.mode === 'online';
  return {
    id: String(brief.id),
    slug: brief.slug,
    merchantId: brief.brand
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-$/, ''),
    status: 'live',
    title: brief.title,
    heading: brief.title,
    description: '',
    summaryLine: brief.summary,
    mode: brief.mode,
    categoryId: brief.categoryId,
    brand: { name: brief.brand, initials: brief.initials, color: brief.color },
    stamp: { offer: brief.offer, label: brief.label ?? 'off' },
    stampLong: brief.label ?? 'off',
    location: isOnlineOnly ? 'Delivers nationwide' : `${brief.area} · ${brief.distance}`,
    priceUnit: brief.priceUnit ?? null,
    artSeed: brief.id,
    image: `/images/deals/${brief.image}.webp`,
    facts: [
      { icon: 'clock', label: '1 claim a day' },
      {
        icon: 'store',
        label: isOnlineOnly
          ? 'Delivery'
          : brief.mode === 'both'
            ? 'In store, delivery'
            : 'In store',
      },
    ],
    branchesHeading: 'Branches',
    branches: isOnlineOnly
      ? []
      : [
          {
            id: `${brief.id}-main`,
            name: brief.area,
            city: 'Lahore',
            address: brief.address,
            opensAt: '11:00',
            closesAt: '23:00',
            distance: brief.distance,
            statusLabel: 'Open until 11:00 pm',
            isOpen: true,
          },
        ],
    terms: [
      { label: 'Limit', value: 'One claim per student per day.' },
      isOnlineOnly ? DEFAULT_TERMS.online : DEFAULT_TERMS.store,
      DEFAULT_TERMS.other,
    ],
    options: [
      {
        id: `${brief.id}-standard`,
        label: brief.title,
        subLabel: brief.brand,
        regularPrice: brief.regularPrice,
        studentPrice: brief.studentPrice,
      },
    ],
    optionsLegend: 'Choose your option',
    deliveryFee: isOnlineOnly ? 150 : 0,
    deliveryEstimate: '2 to 4 days',
    maxQuantity: 2,
    claimsPerDay: 1,
    endsLabel: 'Ends 31 Dec 2026',
    relatedHeading: 'More deals you might like',
  };
}

const CRUST_AND_CO: SeedDeal = {
  id: '3',
  slug: 'crust-and-co-large-pizzas',
  merchantId: 'crust-and-co',
  status: 'live',
  title: 'Large pizzas, Monday to Thursday',
  heading: '25% off large pizzas, Monday to Thursday',
  description: 'Wood-fired pizzas, for dine-in, takeaway or delivery.',
  summaryLine: 'Pizza · 3 branches in Lahore · Delivers city-wide',
  mode: 'both',
  categoryId: 'food',
  brand: { name: 'Crust & Co.', initials: 'C&', color: '#E2552F' },
  stamp: { offer: '25%', label: 'off' },
  stampLong: 'off large pizzas',
  location: 'DHA Phase 5 · 2.4 km',
  priceUnit: null,
  artSeed: 3,
  image: '/images/deals/pizza.webp',
  facts: [
    { icon: 'calendar', label: 'Mon to Thu' },
    { icon: 'clock', label: '1 claim a day' },
    { icon: 'store', label: 'Dine-in, takeaway, delivery' },
  ],
  branchesHeading: 'Branches in Lahore',
  branches: [
    {
      id: '3-dha',
      name: 'DHA Phase 5',
      city: 'Lahore',
      address: 'Block CCA, near Y Block market',
      opensAt: '12:00',
      closesAt: '01:00',
      distance: '2.4 km',
      statusLabel: 'Open until 1:00 am',
      isOpen: true,
    },
    {
      id: '3-gulberg',
      name: 'Gulberg III',
      city: 'Lahore',
      address: 'Main Boulevard, opposite Liberty',
      opensAt: '12:00',
      closesAt: '00:00',
      distance: '3.8 km',
      statusLabel: 'Open until 12:00 am',
      isOpen: true,
    },
    {
      id: '3-johar',
      name: 'Johar Town',
      city: 'Lahore',
      address: 'Block R1, near Emporium Mall',
      opensAt: '12:00',
      closesAt: '23:00',
      distance: '6.1 km',
      statusLabel: 'Opens at 12:00 pm',
      isOpen: false,
    },
  ],
  terms: [
    { label: 'Valid', value: 'Monday to Thursday, all day. Not on public holidays.' },
    { label: 'Limit', value: 'One claim per student per day, up to two pizzas per claim.' },
    DEFAULT_TERMS.store,
    {
      label: 'Delivery',
      value: 'Discount applies to food only. Delivery charge is added at checkout.',
    },
    DEFAULT_TERMS.other,
  ],
  options: [
    {
      id: '3-large',
      label: 'Large 14"',
      subLabel: 'Serves 3 to 4',
      regularPrice: 2400,
      studentPrice: 1800,
    },
    {
      id: '3-medium',
      label: 'Medium 12"',
      subLabel: 'Serves 2',
      regularPrice: 1800,
      studentPrice: 1350,
    },
    {
      id: '3-combo',
      label: 'Large + 1.5 L drink',
      subLabel: 'Serves 3 to 4, with a drink',
      regularPrice: 2800,
      studentPrice: 2100,
    },
  ],
  optionsLegend: 'Choose your pizza',
  deliveryFee: 150,
  deliveryEstimate: '35–50 min',
  maxQuantity: 2,
  claimsPerDay: 1,
  endsLabel: 'Ends 31 Dec 2026',
  relatedHeading: 'More food deals near DHA',
};

const BRIEFS: Brief[] = [
  {
    id: 1,
    slug: 'bun-kabab-bros-combo',
    image: 'burger',
    brand: 'Bun Kabab Bros',
    initials: 'BK',
    color: '#2933E0',
    categoryId: 'food',
    mode: 'in_store',
    offer: '20%',
    title: 'Any combo, dine-in or takeaway',
    regularPrice: 850,
    studentPrice: 680,
    area: 'Gulberg III',
    address: 'Main Market, Gulberg III',
    distance: '1.2 km',
    summary: 'Street food · Gulberg III',
  },
  {
    id: 2,
    slug: 'chai-theory-karak-bogo',
    image: 'coffee',
    brand: 'Chai Theory',
    initials: 'CT',
    color: '#D2871B',
    categoryId: 'food',
    mode: 'in_store',
    offer: 'BOGO',
    label: 'karak',
    title: 'Buy one karak chai, get one free',
    regularPrice: 440,
    studentPrice: 220,
    area: 'MM Alam Rd',
    address: 'MM Alam Road, Gulberg',
    distance: '0.6 km',
    summary: 'Tea house · MM Alam Rd',
  },
  {
    id: 4,
    slug: 'paper-trail-textbooks',
    image: 'books',
    brand: 'Paper Trail Books',
    initials: 'PT',
    color: '#0E8A62',
    categoryId: 'books',
    mode: 'online',
    offer: '15%',
    title: 'Course textbooks and past papers',
    regularPrice: 3200,
    studentPrice: 2720,
    area: 'Johar Town',
    address: '',
    distance: '',
    summary: 'Bookshop · Delivers nationwide',
  },
  {
    id: 5,
    slug: 'ironside-fitness-membership',
    image: 'gym',
    brand: 'Ironside Fitness',
    initials: 'IF',
    color: '#4D5A12',
    categoryId: 'fitness',
    mode: 'in_store',
    offer: '30%',
    title: 'Monthly membership, no joining fee',
    regularPrice: 5000,
    studentPrice: 3500,
    area: 'Johar Town',
    address: 'Block J, Johar Town',
    distance: '3.1 km',
    priceUnit: '/month',
    summary: 'Gym · Johar Town',
  },
  {
    id: 6,
    slug: 'threadline-kurtas',
    image: 'kurta',
    brand: 'Threadline',
    initials: 'TL',
    color: '#C2306B',
    categoryId: 'fashion',
    mode: 'online',
    offer: '18%',
    title: 'Everyday kurtas and co-ords',
    regularPrice: 3900,
    studentPrice: 3198,
    area: 'Model Town',
    address: '',
    distance: '',
    summary: 'Clothing · Delivers nationwide',
  },
  {
    id: 7,
    slug: 'pixel-fix-lab-repairs',
    image: 'circuit',
    brand: 'Pixel Fix Lab',
    initials: 'PF',
    color: '#1F7FB8',
    categoryId: 'tech',
    mode: 'in_store',
    offer: '30%',
    title: 'Phone screen and battery repair',
    regularPrice: 6500,
    studentPrice: 4550,
    area: 'Mall Road',
    address: 'Hall Road, off Mall Road',
    distance: '1.8 km',
    summary: 'Repairs · Mall Road',
  },
  {
    id: 8,
    slug: 'inkpot-stationers',
    image: 'stationery',
    brand: 'Inkpot Stationers',
    initials: 'IS',
    color: '#9B3FD1',
    categoryId: 'books',
    mode: 'in_store',
    offer: '10%',
    title: 'Everything in store, including art supplies',
    regularPrice: 1500,
    studentPrice: 1350,
    area: 'Gulberg III',
    address: 'Mini Market, Gulberg III',
    distance: '0.9 km',
    summary: 'Stationery · Gulberg III',
  },
  {
    id: 9,
    slug: 'roadrunner-tours-weekends',
    image: 'mountains',
    brand: 'Roadrunner Tours',
    initials: 'RT',
    color: '#1F7FB8',
    categoryId: 'travel',
    mode: 'online',
    offer: '12%',
    title: 'Weekend trips to Naran and Hunza',
    regularPrice: 24500,
    studentPrice: 21560,
    area: 'DHA Phase 5',
    address: '',
    distance: '',
    summary: 'Tours · Books nationwide',
  },
  {
    id: 10,
    slug: 'byte-gear-audio',
    image: 'earbuds',
    brand: 'Byte Gear',
    initials: 'BG',
    color: '#2933E0',
    categoryId: 'tech',
    mode: 'online',
    offer: 'PKR 1k',
    title: 'Wireless earbuds and power banks',
    regularPrice: 6999,
    studentPrice: 5999,
    area: 'MM Alam Rd',
    address: '',
    distance: '',
    summary: 'Electronics · Delivers nationwide',
  },
  {
    id: 11,
    slug: 'scoop-street-shakes',
    image: 'icecream',
    brand: 'Scoop Street',
    initials: 'SS',
    color: '#C2306B',
    categoryId: 'food',
    mode: 'in_store',
    offer: '15%',
    title: 'Ice cream and shakes after 6 pm',
    regularPrice: 600,
    studentPrice: 510,
    area: 'DHA Phase 5',
    address: 'Y Block, DHA Phase 5',
    distance: '1.4 km',
    summary: 'Desserts · DHA Phase 5',
  },
  {
    id: 12,
    slug: 'studio-ten-haircut',
    image: 'barber',
    brand: 'Studio Ten',
    initials: 'ST',
    color: '#4D5A12',
    categoryId: 'care',
    mode: 'in_store',
    offer: '25%',
    title: 'Haircut and beard trim',
    regularPrice: 1600,
    studentPrice: 1200,
    area: 'Model Town',
    address: 'Link Road, Model Town',
    distance: '2.0 km',
    summary: 'Barber · Model Town',
  },
  {
    id: 13,
    slug: 'tandoor-lane-thali',
    image: 'thali',
    brand: 'Tandoor Lane',
    initials: 'TL',
    color: '#4D5A12',
    categoryId: 'food',
    mode: 'in_store',
    offer: '30%',
    title: 'Student thali, lunch on weekdays',
    regularPrice: 900,
    studentPrice: 630,
    area: 'DHA Phase 6',
    address: 'Main Boulevard, DHA Phase 6',
    distance: '2.9 km',
    summary: 'Desi food · DHA Phase 6',
  },
];

const briefs = BRIEFS.map(fromBrief);

/** Order matches the prototype's directory. */
export const DEALS: SeedDeal[] = [briefs[0]!, briefs[1]!, CRUST_AND_CO, ...briefs.slice(2)];
