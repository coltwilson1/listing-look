import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',

  // Pre-filled defaults so the site looks correct the first time you open Studio
  initialValue: {
    hero: {
      badge: 'Real Estate Marketing Made Easy',
      headlineStart: 'Your Listings Deserve a',
      headlineEmphasis: 'Beautiful Look',
      subheadline:
        'Beautiful social media graphics, postcards, and custom marketing materials — designed just for real estate agents. Place your order, get a proof, and go sell homes.',
      primaryButtonText: 'Browse Services',
      secondaryButtonText: 'Request Custom Design',
    },
    stats: [
      { _key: 'stat1', num: '48hrs', label: 'Proof turnaround time' },
      { _key: 'stat2', num: '1', label: 'Free revision per order' },
      { _key: 'stat3', num: '3', label: 'Product categories & growing' },
    ],
    howItWorks: {
      tag: 'The Process',
      title: 'Simple from start to sign.',
      subtitle:
        'No back-and-forth confusion. Just pick what you need, share your details, and we handle the rest.',
      steps: [
        {
          _key: 'step1',
          title: 'Browse & Order',
          description:
            'Pick a service or template from our catalog, fill in your listing details, and submit your order.',
        },
        {
          _key: 'step2',
          title: 'We Design It',
          description:
            'Our designer gets to work creating your custom materials within 48 hours.',
        },
        {
          _key: 'step3',
          title: 'Review Your Proof',
          description:
            "You'll receive a proof by email. One round of edits is included — just tell us what to tweak.",
        },
        {
          _key: 'step4',
          title: 'Approve & Go!',
          description:
            'Give the green light and receive your final print-ready or digital files.',
        },
      ],
    },
    services: {
      tag: 'What We Offer',
      title: 'Marketing materials that move listings.',
      subtitle:
        "Every piece is custom-designed for your brand and property. No templates that look like everyone else's.",
      items: [
        {
          _key: 'svc1',
          icon: '📲',
          title: 'Social Media Graphics',
          description:
            'Eye-catching graphics sized perfectly for Instagram, Facebook, and more — open houses, new listings, just sold, and beyond.',
          listItems: [
            'Instagram posts & stories',
            'Facebook event banners',
            'Open house announcements',
            'Just Listed / Just Sold sets',
          ],
          price: 'Starting at — Contact for pricing',
          buttonText: 'Order Now',
        },
        {
          _key: 'svc2',
          icon: '📮',
          title: 'Postcards & Print',
          description:
            'Tangible marketing that gets noticed. Beautiful, professionally designed postcards and print materials for your farm or listings.',
          listItems: [
            'Just Listed & Just Sold postcards',
            'Open house invitations',
            'Neighborhood farming mailers',
            'Print-ready files included',
          ],
          price: 'Starting at — Contact for pricing',
          buttonText: 'Order Now',
        },
        {
          _key: 'svc3',
          icon: '✨',
          title: 'Custom Design Request',
          description:
            "Have something specific in mind? Submit a custom request and we'll bring your vision to life — your brand, your style.",
          listItems: [
            'Brand kits & logo variations',
            'Seasonal campaigns',
            'Listing presentations',
            'Any creative project',
          ],
          price: 'Custom quote provided',
          buttonText: 'Get a Quote',
        },
      ],
    },
    customOrder: {
      tag: 'Custom Orders',
      title: 'Tell us exactly what you need.',
      subtitle:
        "Fill out the form and we'll get back to you within 24 hours with a quote and next steps.",
      steps: [
        {
          _key: 'wf1',
          icon: '📋',
          title: 'Submit Your Request',
          description:
            'Describe what you need, your style preferences, and any deadline requirements.',
        },
        {
          _key: 'wf2',
          icon: '💬',
          title: 'We Send a Quote',
          description: "You'll get a personalized quote via email within 24 hours.",
        },
        {
          _key: 'wf3',
          icon: '💸',
          title: 'Pay via Venmo',
          description:
            'Once you approve the quote, send payment via Venmo and we get started.',
        },
        {
          _key: 'wf4',
          icon: '🎨',
          title: 'Proof + 1 Revision',
          description:
            "We'll email you a proof within 48 hours. One revision is always included.",
        },
      ],
    },
    account: {
      tag: 'Your Account',
      title: 'Track every order in one place.',
      subtitle:
        'Create a free account to manage your orders, upload assets, and keep your brand info handy.',
      cards: [
        {
          _key: 'ac1',
          icon: '📦',
          title: 'Order History',
          description:
            'See every past and active order at a glance — status updates, delivery timelines, and downloadable final files.',
        },
        {
          _key: 'ac2',
          icon: '🖼️',
          title: 'Asset Vault',
          description:
            "Upload your headshot, logo, and brand colors once. We'll pull them automatically for every future order.",
        },
        {
          _key: 'ac3',
          icon: '✏️',
          title: 'Revision Requests',
          description:
            'Submit your one included revision directly through your dashboard — no more hunting through email chains.',
        },
      ],
    },
    payment: {
      heading: 'We accept payment via Venmo',
      body: "After your quote is approved, you'll receive our Venmo handle to complete your payment. Simple and fast.",
    },
    footer: {
      tagline:
        'Custom marketing materials for real estate agents who want their brand to stand out in every market.',
      servicesLinks: ['Social Media Graphics', 'Postcards & Print', 'Custom Design'],
      accountLinks: ['Create Account', 'Log In', 'How It Works'],
    },
  },

  fields: [
    // ── Hero ──────────────────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({ name: 'badge', title: 'Badge Text', type: 'string' }),
        defineField({
          name: 'headlineStart',
          title: 'Headline — plain part',
          type: 'string',
          description: 'e.g. "Your Listings Deserve a"',
        }),
        defineField({
          name: 'headlineEmphasis',
          title: 'Headline — coral italic part',
          type: 'string',
          description: 'e.g. "Beautiful Look"',
        }),
        defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 3 }),
        defineField({ name: 'primaryButtonText', title: 'Primary Button', type: 'string' }),
        defineField({ name: 'secondaryButtonText', title: 'Secondary Button', type: 'string' }),
      ],
    }),

    // ── Stats ─────────────────────────────────────────────────────────────
    defineField({
      name: 'stats',
      title: 'Stats Bar',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'num', title: 'Number / Value', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: { select: { title: 'num', subtitle: 'label' } },
        },
      ],
    }),

    // ── How It Works ──────────────────────────────────────────────────────
    defineField({
      name: 'howItWorks',
      title: 'How It Works',
      type: 'object',
      fields: [
        defineField({ name: 'tag', title: 'Section Tag', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 2 }),
        defineField({
          name: 'steps',
          title: 'Steps',
          type: 'array',
          validation: (R) => R.max(4),
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Step Title', type: 'string' }),
                defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
              ],
              preview: { select: { title: 'title', subtitle: 'description' } },
            },
          ],
        }),
      ],
    }),

    // ── Services ──────────────────────────────────────────────────────────
    defineField({
      name: 'services',
      title: 'Services',
      type: 'object',
      fields: [
        defineField({ name: 'tag', title: 'Section Tag', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 2 }),
        defineField({
          name: 'items',
          title: 'Service Cards',
          type: 'array',
          validation: (R) => R.max(3),
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'icon', title: 'Icon (emoji)', type: 'string' }),
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
                defineField({
                  name: 'listItems',
                  title: 'Bullet Points',
                  type: 'array',
                  of: [{ type: 'string' }],
                }),
                defineField({ name: 'price', title: 'Price Text', type: 'string' }),
                defineField({ name: 'buttonText', title: 'Button Text', type: 'string' }),
              ],
              preview: { select: { title: 'title', subtitle: 'price' } },
            },
          ],
        }),
      ],
    }),

    // ── Custom Order ──────────────────────────────────────────────────────
    defineField({
      name: 'customOrder',
      title: 'Custom Order Section',
      type: 'object',
      fields: [
        defineField({ name: 'tag', title: 'Section Tag', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 2 }),
        defineField({
          name: 'steps',
          title: 'Workflow Steps',
          type: 'array',
          validation: (R) => R.max(4),
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'icon', title: 'Icon (emoji)', type: 'string' }),
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
              ],
              preview: { select: { title: 'title', subtitle: 'description' } },
            },
          ],
        }),
      ],
    }),

    // ── Account ───────────────────────────────────────────────────────────
    defineField({
      name: 'account',
      title: 'Account Section',
      type: 'object',
      fields: [
        defineField({ name: 'tag', title: 'Section Tag', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 2 }),
        defineField({
          name: 'cards',
          title: 'Feature Cards',
          type: 'array',
          validation: (R) => R.max(3),
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'icon', title: 'Icon (emoji)', type: 'string' }),
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
              ],
              preview: { select: { title: 'title', subtitle: 'description' } },
            },
          ],
        }),
      ],
    }),

    // ── Payment Strip ─────────────────────────────────────────────────────
    defineField({
      name: 'payment',
      title: 'Payment Strip',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'body', title: 'Body Text', type: 'text', rows: 2 }),
      ],
    }),

    // ── Footer ────────────────────────────────────────────────────────────
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        defineField({ name: 'tagline', title: 'Brand Tagline', type: 'text', rows: 2 }),
        defineField({
          name: 'servicesLinks',
          title: 'Services Column — Link Labels',
          description: 'All 3 link to the #services section',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'accountLinks',
          title: 'Account Column — Link Labels',
          description: 'In order: Create Account, Log In, How It Works',
          type: 'array',
          of: [{ type: 'string' }],
        }),
      ],
    }),
  ],

  preview: {
    prepare: () => ({ title: 'Home Page' }),
  },
})
