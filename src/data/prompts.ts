export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  preview: string;
  fullPrompt: string;
  usageInstructions: string[];
  exampleOutputs: string[];
  author: string;
  createdAt: string;
  tags: string[];
}

export const categories = [
  { id: 'chatgpt', name: 'ChatGPT', icon: '💬', color: 'from-emerald-500 to-teal-500' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  { id: 'claude', name: 'Claude', icon: '🧠', color: 'from-orange-500 to-amber-500' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', icon: '🖼️', color: 'from-violet-500 to-purple-500' },
  { id: 'business', name: 'Business', icon: '💼', color: 'from-blue-500 to-cyan-500' },
  { id: 'marketing', name: 'Marketing', icon: '📈', color: 'from-green-500 to-emerald-500' },
  { id: 'coding', name: 'Coding', icon: '💻', color: 'from-indigo-500 to-blue-500' },
  { id: 'creative', name: 'Creative Writing', icon: '✍️', color: 'from-fuchsia-500 to-pink-500' },
];

export const prompts: Prompt[] = [
  {
    id: '1',
    title: 'Ultimate Blog Post Generator',
    description: 'Generate SEO-optimized, engaging blog posts on any topic with proper structure, headings, and call-to-actions.',
    category: 'chatgpt',
    price: 9.99,
    rating: 4.9,
    reviews: 234,
    preview: 'Create a comprehensive, SEO-optimized blog post about [TOPIC] that includes an attention-grabbing introduction...',
    fullPrompt: 'You are an expert content writer and SEO specialist. Create a comprehensive, SEO-optimized blog post about [TOPIC] that includes:\n\n1. An attention-grabbing headline with the primary keyword\n2. A compelling introduction that hooks the reader\n3. Well-structured sections with H2 and H3 headings\n4. Bullet points and numbered lists for readability\n5. Internal linking suggestions\n6. A strong conclusion with a call-to-action\n7. Meta description suggestion (150-160 characters)\n\nTone: [TONE - professional/casual/friendly]\nWord count: [COUNT - 1000/1500/2000]\nTarget audience: [AUDIENCE]',
    usageInstructions: [
      'Replace [TOPIC] with your desired blog topic',
      'Specify the tone (professional, casual, or friendly)',
      'Set your target word count',
      'Define your target audience for better personalization'
    ],
    exampleOutputs: [
      'Generated a 1,500-word article on "10 Remote Work Productivity Tips" with 4.2% keyword density',
      'Created an engaging guide on "Sustainable Living" that ranked on page 1 within 2 weeks'
    ],
    author: 'ContentPro',
    createdAt: '2024-01-15',
    tags: ['seo', 'content', 'blogging', 'marketing']
  },
  {
    id: '2',
    title: 'Cinematic Scene Generator',
    description: 'Create stunning, photorealistic Midjourney prompts for cinematic scenes with perfect lighting and composition.',
    category: 'midjourney',
    price: 14.99,
    rating: 4.8,
    reviews: 189,
    preview: 'A cinematic wide-angle shot of [SUBJECT], golden hour lighting, volumetric fog...',
    fullPrompt: 'A cinematic wide-angle shot of [SUBJECT], [SETTING], golden hour lighting streaming through [ELEMENT], volumetric fog, atmospheric perspective, shot on ARRI Alexa, anamorphic lens flare, [COLOR PALETTE] color grading, ultra-detailed, hyperrealistic, 8k resolution --ar 21:9 --v 6 --style raw',
    usageInstructions: [
      'Replace [SUBJECT] with your main focus (person, landscape, object)',
      'Add [SETTING] for environmental context',
      'Specify [ELEMENT] for light source direction',
      'Choose your [COLOR PALETTE] (teal and orange, moody blues, warm earth tones)'
    ],
    exampleOutputs: [
      'Generated stunning sunset cityscape with perfect golden hour lighting',
      'Created moody forest scene with atmospheric fog and volumetric rays'
    ],
    author: 'ArtisticAI',
    createdAt: '2024-02-01',
    tags: ['midjourney', 'cinematic', 'photography', 'art']
  },
  {
    id: '3',
    title: 'Code Review Assistant',
    description: 'Get comprehensive code reviews with security analysis, performance tips, and best practice suggestions.',
    category: 'coding',
    price: 12.99,
    rating: 4.9,
    reviews: 312,
    preview: 'Analyze the following code for security vulnerabilities, performance issues, and adherence to best practices...',
    fullPrompt: 'You are a senior software engineer with 15+ years of experience. Analyze the following [LANGUAGE] code for:\n\n1. **Security Vulnerabilities**: SQL injection, XSS, CSRF, authentication issues\n2. **Performance Issues**: Time complexity, memory leaks, unnecessary computations\n3. **Code Quality**: SOLID principles, DRY, naming conventions\n4. **Best Practices**: Error handling, logging, documentation\n5. **Potential Bugs**: Edge cases, null checks, race conditions\n\nProvide specific line-by-line feedback with severity levels (Critical/High/Medium/Low) and suggested fixes.\n\nCode to review:\n```[LANGUAGE]\n[CODE]\n```',
    usageInstructions: [
      'Specify the programming language',
      'Paste your code in the designated area',
      'Optionally mention specific concerns or focus areas'
    ],
    exampleOutputs: [
      'Identified 3 SQL injection vulnerabilities and provided parameterized query solutions',
      'Found N+1 query issue and suggested eager loading pattern'
    ],
    author: 'DevMaster',
    createdAt: '2024-01-20',
    tags: ['coding', 'review', 'security', 'development']
  },
  {
    id: '4',
    title: 'Marketing Campaign Planner',
    description: 'Design complete multi-channel marketing campaigns with timelines, budgets, and KPI tracking.',
    category: 'marketing',
    price: 19.99,
    rating: 4.7,
    reviews: 156,
    preview: 'Create a comprehensive 90-day marketing campaign for [PRODUCT/SERVICE] targeting [AUDIENCE]...',
    fullPrompt: 'Create a comprehensive 90-day marketing campaign for [PRODUCT/SERVICE] with the following specifications:\n\n**Target Audience**: [AUDIENCE DEMOGRAPHICS]\n**Budget**: $[BUDGET]\n**Goals**: [PRIMARY GOALS]\n\nProvide:\n1. Campaign theme and core messaging\n2. Channel strategy (social media, email, paid ads, content)\n3. Weekly content calendar with post types and topics\n4. Budget allocation per channel\n5. KPI dashboard with metrics to track\n6. A/B testing recommendations\n7. Risk mitigation strategies\n8. Success criteria and milestone checkpoints',
    usageInstructions: [
      'Define your product or service clearly',
      'Specify target audience demographics and psychographics',
      'Set realistic budget constraints',
      'List 2-3 primary campaign goals'
    ],
    exampleOutputs: [
      'Created a SaaS launch campaign that generated 1,200 leads in first month',
      'Designed holiday campaign strategy with 340% ROI'
    ],
    author: 'GrowthHacker',
    createdAt: '2024-02-10',
    tags: ['marketing', 'campaigns', 'strategy', 'growth']
  },
  {
    id: '5',
    title: 'Business Plan Generator',
    description: 'Create investor-ready business plans with financial projections, market analysis, and growth strategies.',
    category: 'business',
    price: 24.99,
    rating: 4.8,
    reviews: 98,
    preview: 'Develop a comprehensive business plan for [BUSINESS IDEA] including executive summary, market analysis...',
    fullPrompt: 'Create a comprehensive, investor-ready business plan for [BUSINESS IDEA] in the [INDUSTRY] industry.\n\nInclude:\n1. **Executive Summary**: Vision, mission, value proposition\n2. **Market Analysis**: TAM, SAM, SOM, competitor analysis, market trends\n3. **Business Model**: Revenue streams, pricing strategy, cost structure\n4. **Go-to-Market Strategy**: Customer acquisition, partnerships, channels\n5. **Operations Plan**: Team structure, key processes, technology stack\n6. **Financial Projections**: 3-year P&L, cash flow, break-even analysis\n7. **Funding Requirements**: Use of funds, milestones, exit strategy\n8. **Risk Analysis**: SWOT, mitigation strategies\n\nTarget funding: $[AMOUNT]\nLocation: [LOCATION]\nStage: [SEED/SERIES A/GROWTH]',
    usageInstructions: [
      'Describe your business idea in detail',
      'Specify the industry and target market',
      'Define funding amount needed',
      'Indicate current business stage'
    ],
    exampleOutputs: [
      'Generated a fintech startup plan that secured $500K seed funding',
      'Created SaaS business plan with detailed unit economics'
    ],
    author: 'StartupGuru',
    createdAt: '2024-01-25',
    tags: ['business', 'startup', 'investors', 'planning']
  },
  {
    id: '6',
    title: 'Fantasy World Builder',
    description: 'Create rich, detailed fantasy worlds with lore, geography, cultures, and magic systems for your stories.',
    category: 'creative',
    price: 11.99,
    rating: 4.9,
    reviews: 267,
    preview: 'Design an immersive fantasy world called [WORLD NAME] with unique cultures, geography, and magic...',
    fullPrompt: 'Create an immersive fantasy world called [WORLD NAME] with the following elements:\n\n**Core Concept**: [THEME/INSPIRATION]\n**Era**: [MEDIEVAL/ANCIENT/STEAMPUNK/etc.]\n\nDevelop:\n1. **Geography**: Continents, kingdoms, notable locations, climate\n2. **History**: Creation myth, major historical events, current era\n3. **Cultures**: 3-5 distinct civilizations with customs, beliefs, conflicts\n4. **Magic System**: Rules, sources of power, limitations, practitioners\n5. **Creatures**: Unique flora, fauna, mythical beings\n6. **Politics**: Power structures, alliances, ongoing conflicts\n7. **Economy**: Trade goods, currencies, commerce routes\n8. **Languages**: Naming conventions, common phrases\n9. **Potential Story Hooks**: Conflicts, mysteries, prophecies',
    usageInstructions: [
      'Name your world and define its core theme',
      'Choose the technological/cultural era',
      'Specify any must-have elements or inspirations',
      'Indicate the scale (single kingdom vs. multiple continents)'
    ],
    exampleOutputs: [
      'Created a steampunk world with airship nations and crystal-based magic',
      'Designed an underwater civilization with bioluminescent architecture'
    ],
    author: 'LoreMaster',
    createdAt: '2024-02-05',
    tags: ['creative', 'writing', 'worldbuilding', 'fantasy']
  },
  {
    id: '7',
    title: 'Claude Research Assistant',
    description: 'Transform Claude into a thorough research assistant that provides cited, well-organized insights.',
    category: 'claude',
    price: 8.99,
    rating: 4.6,
    reviews: 145,
    preview: 'You are a meticulous research assistant. Analyze [TOPIC] by examining multiple perspectives...',
    fullPrompt: 'You are a meticulous research assistant with expertise in academic research methodologies. Analyze [TOPIC] by:\n\n1. **Overview**: Provide a comprehensive introduction to the topic\n2. **Key Concepts**: Define and explain fundamental terms and ideas\n3. **Multiple Perspectives**: Present at least 3 different viewpoints or schools of thought\n4. **Evidence Analysis**: Evaluate the strength of various arguments\n5. **Current Developments**: Highlight recent research or trends\n6. **Practical Applications**: How this knowledge can be applied\n7. **Gaps & Controversies**: Identify areas of ongoing debate\n8. **Further Reading**: Suggest specific areas for deeper exploration\n\nFormat with clear headings, bullet points, and maintain academic rigor while being accessible to a general audience.',
    usageInstructions: [
      'Specify your research topic clearly',
      'Indicate your knowledge level (beginner/intermediate/expert)',
      'Mention if you need focus on specific aspects',
      'Note any time constraints or word limits'
    ],
    exampleOutputs: [
      'Produced comprehensive analysis of quantum computing applications in cryptography',
      'Generated balanced overview of sustainable energy policy debates'
    ],
    author: 'ResearchPro',
    createdAt: '2024-02-15',
    tags: ['claude', 'research', 'academic', 'analysis']
  },
  {
    id: '8',
    title: 'Product Photography Style',
    description: 'Generate stunning product photography prompts for Stable Diffusion with commercial-quality results.',
    category: 'stable-diffusion',
    price: 13.99,
    rating: 4.7,
    reviews: 178,
    preview: 'Professional product photography of [PRODUCT], studio lighting, gradient background...',
    fullPrompt: 'Professional product photography of [PRODUCT], studio lighting setup with [LIGHTING STYLE], [BACKGROUND COLOR] gradient background, floating product with soft shadow, commercial advertisement quality, 8k resolution, sharp focus on product details, [MOOD] atmosphere, professional color grading, shot with medium format camera, product retouching, clean minimalist composition\n\nNegative prompt: blurry, low quality, distorted, text, watermark, oversaturated, amateur lighting',
    usageInstructions: [
      'Describe the product in detail',
      'Choose lighting style (soft diffused, dramatic rim, natural)',
      'Select background gradient colors',
      'Define the mood (luxury, playful, professional, minimalist)'
    ],
    exampleOutputs: [
      'Created luxury watch advertisement with perfect reflections',
      'Generated skincare product shot with dewy, fresh aesthetic'
    ],
    author: 'StudioAI',
    createdAt: '2024-01-30',
    tags: ['stable-diffusion', 'product', 'photography', 'commercial']
  }
];

export const featuredPrompts = prompts.slice(0, 6);
