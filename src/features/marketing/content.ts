/** Homepage content, and the copy for the business page. The hero photos are [SAMPLE]. */

export const HERO_TILES = [
  { src: '/images/deals/pizza.webp', alt: 'A wood-fired pizza', offer: '25%', label: 'off pizza' },
  {
    src: '/images/deals/coffee.webp',
    alt: 'Cups of coffee on a table',
    offer: 'BOGO',
    label: 'karak',
  },
  { src: '/images/auth/students.webp', alt: 'Five students laughing together', main: true },
  {
    src: '/images/deals/gym.webp',
    alt: 'Rows of dumbbells in a gym',
    offer: '30%',
    label: 'off gyms',
  },
  { src: '/images/deals/books.webp', alt: 'A row of books', offer: '15%', label: 'off books' },
];

export const PROCESS_STEPS = [
  { title: 'Verify once', body: 'University email or student card. No CNIC, ever.' },
  { title: 'Show your code', body: 'Claim at the counter, or order online.' },
  { title: 'Pay the student price', body: 'Free for students. Nothing to subscribe to.' },
];

export const BUSINESS_FACTS = [
  { value: '5%', label: 'on completed orders' },
  { value: 'PKR 0', label: 'to join' },
  { value: 'No hardware', label: 'any screen works' },
];

export const BUSINESS_STEPS = [
  {
    title: 'List a deal',
    body: 'Get approved, then publish an in-store deal or an online product.',
  },
  {
    title: 'Approve at the counter',
    body: 'A student shows a live code. Your cashier takes the cash and taps approve.',
  },
  {
    title: 'Settle at PKR 2,000',
    body: 'We log 5% on each completed order. You settle when it reaches the limit.',
  },
];

export const BUSINESS_FAQS = [
  {
    question: 'Do I need any hardware or a QR stand?',
    answer: 'No. Cashiers approve claims on any phone, tablet or computer.',
  },
  {
    question: 'When do I pay commission?',
    answer:
      'Only on completed orders. For cash at the counter or on delivery, the 5% is added to your store ledger, and you transfer it when it reaches PKR 2,000.',
  },
  {
    question: 'What happens if I reach the limit?',
    answer:
      'New orders pause until you settle. As soon as we confirm your transfer, they start again.',
  },
  {
    question: 'Can my staff use it without seeing my ledger?',
    answer: 'Yes. Cashiers can only see and approve claims at their own branch.',
  },
];

export const FAQS = [
  {
    question: 'Is it really free for students?',
    answer:
      "Yes. There's no membership fee and no subscription. Shops pay us a 5% commission on completed orders, so you never pay anything to use MyPerkify.",
  },
  {
    question: 'Which universities are supported?',
    answer:
      "Any university or college in Pakistan. If your institution gives you an .edu.pk email you're verified instantly. Otherwise upload your student card and we'll check it by hand.",
  },
  {
    question: "Why don't you ask for my CNIC?",
    answer:
      "We only need to know you're enrolled. A university email or student card proves that, so collecting your national ID would be unnecessary risk for you.",
  },
  {
    question: 'What happens when the 5-minute code runs out?',
    answer:
      "Nothing is lost. Tap claim again for a fresh code. Codes expire so that a screenshot can't be shared or used twice.",
  },
  {
    question: 'How do businesses pay the commission?',
    // I-03: the prototype's "Online payments are settled automatically" is removed. Nothing in
    // the client's brief supports it. Revisit once D-05 and D-06 are decided.
    answer:
      'For cash at the counter or on delivery, the 5% is added to your store ledger. When it reaches PKR 2,000 you transfer it to us, and new orders keep flowing.',
  },
];
