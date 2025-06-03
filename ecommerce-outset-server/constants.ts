import type {
  NavItem, Persona, Testimonial, Stat, SocialLink, QuizQuestion, PersonaId,
  KpiCardData, TrafficSourcesData, PersonaAnalyticsData, ConversionTrackingData, ShadowFunnelData, ContentPerformanceData, ChartDataItem,
  RoadmapStep, LaunchTool, LaunchServiceTier, LaunchCommunityFeature, LaunchSuccessStory,
  ScaleHeroStat, BusinessDiagnosticTool, OptimizationFramework, ScaleServiceTier as ScaleServiceTierType, ScaleCaseStudy, ScaleInteractiveTool, ScaleMastermindFeature,
  MasterHeroProps, EcosystemComponentModel, ConceptualFramework, ImplementationBridge, KnowledgeDomain, MasteryVerificationMethod, MasterServiceTier as MasterServiceTierType, MasterInteractiveTool, MasterCommunityFeature as MasterCommunityFeatureType,
  InvestHeroProps, DueDiligenceItem, ValuationModel, RiskFactor, PortfolioTool, InvestmentOpportunity, InvestServiceTier as InvestServiceTierType, InvestAnalyticalTool, InvestorNetworkFeature,
  ConnectHeroProps, ExpertiseFramework, ClientConnectionOpportunity, ConnectServiceTier as ConnectServiceTierType, BusinessDevelopmentTool, ProviderCommunityFeature as ProviderCommunityFeatureType,
  PersonaSpecificExitContent,
  EmailSequence,
  DynamicContentVariant,
  EngagementLevel,
  BehavioralScoreMetrics,
  DemographicScoreMetrics,
  EngagementQualityScoreMetrics,
  LeadStage
} from './types';
import {
  LaunchIcon, ScaleIcon, MasterIcon, InvestIcon, ConnectIcon,
  FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon,
  UsersIcon, TrendingUpIcon, CheckCircleIcon, AlertTriangleIcon, BarChartIcon, FilterIcon, DownloadIcon, ZapIcon,
  FileTextIcon, LinkIcon, MailIcon, PlayCircleIcon, MessageSquareIcon,
  TargetIcon, ClipboardListIcon, ShieldCheckIcon, WrenchScrewdriverIcon, SparklesIcon, DollarSignIcon, UsersGroupIcon,
  ActivityIcon, BriefcaseIcon, CogIcon, DatabaseIcon, LightBulbIcon,
  BrainIcon, BookOpenIcon, NetworkIcon, PuzzlePieceIcon,
  ChartPieIcon, CalculatorIcon, BanknotesIcon, SearchIcon,
  HandshakeIcon, MegaphoneIcon, ServerStackIcon // Added ServerStackIcon for Integrations
} from './components/icons';

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Launch', href: '#launch-hub' },
  { label: 'Scale', href: '#scale-hub' },
  { label: 'Master', href: '#master-hub' },
  { label: 'Invest', href: '#invest-hub' },
  { label: 'Connect', href: '#connect-hub' },
  { label: 'Dashboard', href: '#dashboard'},
  { label: 'Integrations', href: '#integrations-dashboard' }, // New Item
  { label: 'Community', href: '#community' },
  { label: 'About', href: '#about' },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: 'Login', href: '#' },
  { label: 'Register', href: '#' },
];

export const PERSONAS_DATA: Persona[] = [
  {
    id: 'launch' as PersonaId,
    Icon: LaunchIcon,
    title: 'Startup Sam',
    description: 'Launch Your First Product with Confidence',
    memberCount: '4,200+ Sams',
    ctaText: 'Start Launching',
    ctaHref: '#launch-hub',
    accentColorClass: 'text-green-400',
    borderColorClass: 'border-green-400',
    buttonColorClass: 'bg-green-500 hover:bg-green-600',
    shadowColorClass: 'hover:shadow-green-500/40',
    longDescription: "You're at the exciting beginning of your Amazon journey! Startup Sams are typically pre-launch or in their first few months, eager to find a viable product and get it off the ground without costly mistakes. You value clear, step-by-step guidance and risk mitigation.",
    mascotImage: "https://picsum.photos/seed/launch_mascot/300/300",
    recommendedResources: [
      { title: "First Product Launch Guide (PDF)", type: "Free Download", link: "#" },
      { title: "7 Critical Mistakes New Sellers Make (Video)", type: "Free Training", link: "#" },
    ],
    serviceTierPreview: [{ name: "EO Launch Foundation", price: "$997", features: ["Product Selection Framework", "Listing Creation System", "Launch Strategy Development"], cta: "Explore Launch Program", }],
    strategySessionLink: "#book-launch-consult",
  },
  {
    id: 'scale' as PersonaId,
    Icon: ScaleIcon,
    title: 'Scaling Sarah',
    description: 'Break Revenue Plateaus Systematically',
    memberCount: '3,500+ Sarahs',
    ctaText: 'Start Scaling',
    ctaHref: '#scale-hub',
    accentColorClass: 'text-blue-400',
    borderColorClass: 'border-blue-400',
    buttonColorClass: 'bg-blue-500 hover:bg-blue-600',
    shadowColorClass: 'hover:shadow-blue-500/40',
    longDescription: "You've had some success on Amazon, but now you're hitting a growth ceiling. Scaling Sarahs have established products (3-7) and significant revenue ($15k-$50k/month) but face challenges like margin compression, operational bottlenecks, or replicating past successes. You're looking for systematic optimization and strategic expansion.",
    mascotImage: "https://picsum.photos/seed/scale_mascot/300/300",
    recommendedResources: [
      { title: "Growth Bottleneck Diagnostic Tool (Interactive)", type: "Free Tool", link: "#" },
      { title: "Operational Excellence Framework (PDF)", type: "Free Download", link: "#" },
    ],
    serviceTierPreview: [{ name: "EO Scale Acceleration", price: "$1,997", features: ["Business Diagnostic Assessment", "Optimization Frameworks", "Strategic Growth Planning"], cta: "Explore Scale Program", }],
    strategySessionLink: "#book-scale-consult",
  },
  {
    id: 'master' as PersonaId,
    Icon: MasterIcon,
    title: 'Learning Larry',
    description: 'Master Amazon Through Deep Understanding',
    memberCount: '2,800+ Larrys',
    ctaText: 'Start Mastering',
    ctaHref: '#master-hub',
    accentColorClass: 'text-purple-400',
    borderColorClass: 'border-purple-400',
    buttonColorClass: 'bg-purple-500 hover:bg-purple-600',
    shadowColorClass: 'hover:shadow-purple-500/40',
    longDescription: "You're driven by a desire to truly understand the Amazon ecosystem, not just follow tactics. Learning Larrys are often in the research or early implementation phase, investing time and resources into education. You value conceptual frameworks, principle-based learning, and connecting theory to practical application.",
    mascotImage: "https://picsum.photos/seed/master_mascot/300/300",
    recommendedResources: [
      { title: "Amazon Ecosystem Conceptual Model (PDF)", type: "Free Download", link: "#" },
      { title: "Knowledge-to-Action Workbook (Interactive)", type: "Free Tool", link: "#" },
    ],
    serviceTierPreview: [{ name: "EO Master Knowledge System", price: "$797", features: ["Knowledge Architecture Assessment", "Core Curriculum", "Conceptual Framework Mastery"], cta: "Explore Master Program", }],
    strategySessionLink: "#book-master-consult",
  },
  {
    id: 'invest' as PersonaId,
    Icon: InvestIcon,
    title: 'Investor Ian',
    description: 'Build Your Amazon Business Portfolio',
    memberCount: '1,900+ Ians',
    ctaText: 'Start Investing',
    ctaHref: '#invest-hub',
    accentColorClass: 'text-yellow-400',
    borderColorClass: 'border-yellow-400',
    buttonColorClass: 'bg-yellow-500 hover:bg-yellow-600',
    shadowColorClass: 'hover:shadow-yellow-500/40',
    longDescription: "You see Amazon businesses as investment opportunities. Investor Ians have capital ($50k-$500k+) and are looking to acquire or invest in e-commerce ventures. You need robust due diligence frameworks, valuation methodologies, and operational oversight systems. You prefer strategic involvement over day-to-day management.",
    mascotImage: "https://picsum.photos/seed/invest_mascot/300/300",
    recommendedResources: [
      { title: "Amazon Business Valuation Guide (PDF)", type: "Free Download", link: "#" },
      { title: "Due Diligence Checklist (Interactive)", type: "Free Tool", link: "#" },
    ],
    serviceTierPreview: [{ name: "EO Invest Foundation", price: "$1,997", features: ["Investment Strategy Development", "Due Diligence System", "Risk Assessment Framework"], cta: "Explore Invest Program", }],
    strategySessionLink: "#book-invest-consult",
  },
  {
    id: 'connect' as PersonaId,
    Icon: ConnectIcon,
    title: 'Provider Priya',
    description: 'Connect with Premium Amazon Clients',
    memberCount: '1,500+ Priyas',
    ctaText: 'Start Connecting',
    ctaHref: '#connect-hub',
    accentColorClass: 'text-teal-400',
    borderColorClass: 'border-teal-400',
    buttonColorClass: 'bg-teal-500 hover:bg-teal-600',
    shadowColorClass: 'hover:shadow-teal-500/40',
    longDescription: "You offer specialized services to Amazon sellers (PPC, listing optimization, etc.). Provider Priyas have established expertise but face challenges in client acquisition, value demonstration, and standing out in a crowded market. You're looking to connect with ideal clients who value quality over price and build sustainable client relationships.",
    mascotImage: "https://picsum.photos/seed/connect_mascot/300/300",
    recommendedResources: [
      { title: "Service Provider Positioning Guide (PDF)", type: "Free Download", link: "#" },
      { title: "Value Demonstration Framework (Interactive)", type: "Free Tool", link: "#" },
    ],
    serviceTierPreview: [{ name: "EO Connect Foundation", price: "$997", features: ["Service Positioning Assessment", "Expertise Showcase System", "Client Acquisition Framework"], cta: "Explore Connect Program", }],
    strategySessionLink: "#book-connect-consult",
  },
  {
    id: 'unknown' as PersonaId, // Fallback persona for quiz results if no strong match
    Icon: LightBulbIcon, // Generic icon
    title: "Your Unique Path",
    description: "Your profile shows a unique mix of goals and challenges. Let's explore a custom path for you!",
    memberCount: "Discover Your Fit",
    ctaText: "Explore Custom Options",
    ctaHref: "#contact", // Default to contact
    accentColorClass: 'text-gray-400',
    borderColorClass: 'border-gray-500',
    buttonColorClass: 'bg-gray-500 hover:bg-gray-600',
    shadowColorClass: 'hover:shadow-gray-500/40',
    longDescription: "Your responses indicate a unique blend of characteristics that don't fit neatly into one persona. This is great! It means you have a specific set of needs we can address. We recommend a quick chat to tailor the best resources and strategies for your Amazon journey.",
    mascotImage: "https://picsum.photos/seed/unknown_mascot/300/300",
    recommendedResources: [
      { title: "Comprehensive Amazon Success Guide (PDF)", type: "Free Download", link: "#" },
      { title: "EO Platform Overview (Video)", type: "Watch Now", link: "#" },
    ],
    serviceTierPreview: [{ name: "Custom Strategy Session", price: "Free", features: ["Personalized Needs Analysis", "Resource Recommendation", "Next Steps Planning"], cta: "Book Free Consult", }],
    strategySessionLink: "#book-consult", // General consult link
  },
];


export const HERO_STATS_DATA: Stat[] = [
  { label: 'Members', value: 14348, suffix: '+' },
  { label: 'Success Rate', value: 85, suffix: '%' },
  { label: 'Specialized Paths', value: 5 },
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah P.',
    role: '7-Figure Seller (Scaling Sarah)',
    image: 'https://picsum.photos/seed/sarah/100/100',
    text: "EO Scale transformed my stagnant business. The systematic approach helped me break through my revenue plateau in 3 months!",
    result: "Achieved 150% Revenue Growth",
    personaId: 'scale'
  },
  {
    id: '2',
    name: 'John B.',
    role: 'New Launcher (Startup Sam)',
    image: 'https://picsum.photos/seed/john/100/100',
    text: "I was overwhelmed with launching my first product. EO Launch gave me a clear roadmap and the confidence I needed. Launched successfully in 60 days!",
    result: "First Product Profitable in 90 Days",
    personaId: 'launch'
  },
  {
    id: '3',
    name: 'Maria L.',
    role: 'Service Provider (Provider Priya)',
    image: 'https://picsum.photos/seed/maria/100/100',
    text: "EO Connect helped me find high-quality clients who value my expertise. My business has grown significantly since joining.",
    result: "Client Base Increased by 50%",
    personaId: 'connect'
  },
];

export const SOCIAL_PROOF_METRICS: Stat[] = [
    { label: "Products Launched via EO", value: 7500, suffix: "+" },
    { label: "Avg. Member Growth", value: 67, suffix: "% YoY" },
    { label: "Active Experts", value: 200, suffix: "+" },
];

export const FOOTER_LINKS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Launch Path',
    items: [
      { label: 'First Product Guide', href: '#launch-hub', accentColor: 'text-green-400' },
      { label: 'Launch Roadmap', href: '#launch-hub', accentColor: 'text-green-400' },
    ],
  },
  {
    title: 'Scale Path',
    items: [
      { label: 'Growth Frameworks', href: '#scale-hub', accentColor: 'text-blue-400' },
      { label: 'Optimization Tools', href: '#scale-hub', accentColor: 'text-blue-400' },
    ],
  },
  {
    title: 'Master Path',
    items: [
      { label: 'Ecosystem Models', href: '#master-hub', accentColor: 'text-purple-400' },
      { label: 'Advanced Strategies', href: '#master-hub', accentColor: 'text-purple-400' },
    ],
  },
   {
    title: 'Invest Path',
    items: [
      { label: 'Due Diligence', href: '#invest-hub', accentColor: 'text-yellow-400' },
      { label: 'Valuation', href: '#invest-hub', accentColor: 'text-yellow-400' },
    ],
  },
  {
    title: 'Connect Path',
    items: [
      { label: 'Client Acquisition', href: '#connect-hub', accentColor: 'text-teal-400' },
      { label: 'Showcase Expertise', href: '#connect-hub', accentColor: 'text-teal-400' },
    ],
  },
  {
    title: 'General',
    items: [
      { label: 'About Us', href: '#about' },
      { label: 'Community Forum', href: '#community' },
      { label: 'Integrations', href: '#integrations-dashboard' },
      { label: 'Contact', href: '#contact' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Take the Quiz', href: '#quiz-modal' }
    ],
  },
];

export const SOCIAL_MEDIA_LINKS: SocialLink[] = [
  { name: 'Facebook', href: '#', Icon: FacebookIcon },
  { name: 'Twitter', href: '#', Icon: TwitterIcon },
  { name: 'LinkedIn', href: '#', Icon: LinkedInIcon },
  { name: 'Instagram', href: '#', Icon: InstagramIcon },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1_status',
    questionText: "What best describes your current Amazon selling status?",
    options: [
      { id: 'a1', text: "I haven't started selling yet / Just launched", scores: [{ personaId: 'launch', points: 5 }, { personaId: 'master', points: 1 }], crmScoreMapping: [{ category: 'businessStageAppropriate', points: 2 }] },
      { id: 'a2', text: "Selling for a few months, some initial sales", scores: [{ personaId: 'launch', points: 3 }, { personaId: 'scale', points: 2 }], crmScoreMapping: [{ category: 'businessStageAppropriate', points: 4 }] },
      { id: 'a3', text: "Established seller (1+ years) with consistent revenue", scores: [{ personaId: 'scale', points: 5 }, { personaId: 'invest', points: 1 }], crmScoreMapping: [{ category: 'businessStageAppropriate', points: 8 }] },
      { id: 'a4', text: "I'm primarily looking to learn about Amazon selling", scores: [{ personaId: 'master', points: 5 }] },
      { id: 'a5', text: "I offer services to Amazon sellers", scores: [{ personaId: 'connect', points: 5 }] },
      { id: 'a6', text: "I'm looking to buy/invest in Amazon businesses", scores: [{ personaId: 'invest', points: 5 }], crmScoreMapping: [{ category: 'businessStageAppropriate', points: 10 }] },
    ],
  },
  {
    id: 'q2_revenue',
    questionText: "What's your primary monthly revenue from Amazon (if selling)?",
    options: [
      { id: 'b1', text: "$0 - $1,000 (or N/A)", scores: [{ personaId: 'launch', points: 4 }, { personaId: 'master', points: 2 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 2}] },
      { id: 'b2', text: "$1,000 - $15,000", scores: [{ personaId: 'launch', points: 2 }, { personaId: 'scale', points: 3 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 5}] },
      { id: 'b3', text: "$15,000 - $50,000", scores: [{ personaId: 'scale', points: 5 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 10}] },
      { id: 'b4', text: "$50,000+", scores: [{ personaId: 'scale', points: 4 }, { personaId: 'invest', points: 3 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 15}] },
      { id: 'b5', text: "Not applicable (I provide services/invest)", scores: [{ personaId: 'connect', points: 3 }, { personaId: 'invest', points: 3 }] },
    ],
    skippable: true,
  },
  {
    id: 'q3_learning_style',
    questionText: "How do you prefer to learn new strategies?",
    options: [
      { id: 'c1', text: "Step-by-step guides and checklists", scores: [{ personaId: 'launch', points: 4 }] },
      { id: 'c2', text: "Deep conceptual understanding and frameworks", scores: [{ personaId: 'master', points: 5 }] },
      { id: 'c3', text: "Proven systems and optimization techniques", scores: [{ personaId: 'scale', points: 4 }] },
      { id: 'c4', text: "Data-driven analysis and case studies", scores: [{ personaId: 'invest', points: 3 }, { personaId: 'scale', points: 2 }] },
      { id: 'c5', text: "Networking and expert consultations", scores: [{ personaId: 'connect', points: 4 }, { personaId: 'invest', points: 2 }] },
    ],
  },
  {
    id: 'q4_biggest_challenge',
    questionText: "What's your biggest current challenge?",
    options: [
      { id: 'd1', text: "Finding the right product / Getting started", scores: [{ personaId: 'launch', points: 5 }] },
      { id: 'd2', text: "Scaling my current sales / Breaking plateaus", scores: [{ personaId: 'scale', points: 5 }] },
      { id: 'd3', text: "Understanding complex Amazon systems / Theory to practice", scores: [{ personaId: 'master', points: 5 }] },
      { id: 'd4', text: "Evaluating business opportunities / Due diligence", scores: [{ personaId: 'invest', points: 5 }] },
      { id: 'd5', text: "Finding ideal clients / Demonstrating my value", scores: [{ personaId: 'connect', points: 5 }] },
      { id: 'd6', text: "Information overload / Knowing who to trust", scores: [{ personaId: 'launch', points: 2 }, { personaId: 'master', points: 2 }] },
    ],
  },
  {
    id: 'q5_capital',
    questionText: "How much capital do you have available for inventory/investment (USD)?",
    options: [
      { id: 'e1', text: "< $5,000", scores: [{ personaId: 'launch', points: 4 }, { personaId: 'master', points: 2 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 3}] },
      { id: 'e2', text: "$5,000 - $15,000", scores: [{ personaId: 'launch', points: 5 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 7}] },
      { id: 'e3', text: "$15,000 - $50,000", scores: [{ personaId: 'scale', points: 4 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 10}] },
      { id: 'e4', text: "$50,000 - $500,000", scores: [{ personaId: 'invest', points: 5 }, { personaId: 'scale', points: 2 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 12}] },
      { id: 'e5', text: "$500,000+", scores: [{ personaId: 'invest', points: 5 }], crmScoreMapping: [{category: 'budgetIndicationPositive', points: 15}] },
      { id: 'e6', text: "Not applicable / Prefer not to say", scores: [{ personaId: 'connect', points: 2 }, { personaId: 'master', points: 1 }] },
    ],
    skippable: true,
    isSensitive: true,
  },
  {
    id: 'q6_role_preference',
    questionText: "What's your preferred role in business operations?",
    options: [
      { id: 'f1', text: "Hands-on implementer, doing most tasks myself", scores: [{ personaId: 'launch', points: 4 }, { personaId: 'master', points: 2 }] },
      { id: 'f2', text: "System builder, optimizing processes and delegating", scores: [{ personaId: 'scale', points: 5 }] },
      { id: 'f3', text: "Strategic overseer, focusing on high-level decisions", scores: [{ personaId: 'invest', points: 4 }] },
      { id: 'f4', text: "External expert, providing specialized support", scores: [{ personaId: 'connect', points: 5 }] },
      { id: 'f5', text: "Student/Researcher, focused on learning first", scores: [{ personaId: 'master', points: 4 }] },
    ],
  },
  {
    id: 'q7_decision_making',
    questionText: "How do you typically make important business decisions?",
    options: [
      { id: 'g1', text: "Cautiously, after extensive research and validation", scores: [{ personaId: 'launch', points: 3 }, { personaId: 'invest', points: 3 }] },
      { id: 'g2', text: "Data-driven, based on performance metrics and ROI", scores: [{ personaId: 'scale', points: 4 }, { personaId: 'invest', points: 2 }] },
      { id: 'g3', text: "Based on a deep understanding of underlying principles", scores: [{ personaId: 'master', points: 4 }] },
      { id: 'g4', text: "Through expert advice and proven frameworks", scores: [{ personaId: 'connect', points: 3 }, { personaId: 'launch', points: 2 }] },
      { id: 'g5', text: "Quickly, prioritizing action and iteration", scores: [{ personaId: 'scale', points: 2 }] },
    ],
  },
  {
    id: 'q8_timeline',
    questionText: "What's your ideal timeline for seeing significant results/progress?",
    options: [
      { id: 'h1', text: "Within 3 months (e.g., first launch, initial growth)", scores: [{ personaId: 'launch', points: 4 }] },
      { id: 'h2', text: "3-6 months (e.g., system optimization, portfolio building)", scores: [{ personaId: 'scale', points: 3 }, { personaId: 'invest', points: 3 }] },
      { id: 'h3', text: "6-12 months (e.g., sustainable scaling, mastery development)", scores: [{ personaId: 'scale', points: 2 }, { personaId: 'master', points: 3 }] },
      { id: 'h4', text: "Long-term, focused on foundational understanding first", scores: [{ personaId: 'master', points: 4 }] },
      { id: 'h5', text: "Varies per client/project (for service providers)", scores: [{ personaId: 'connect', points: 4 }] },
    ],
  },
  {
    id: 'q9_support_preference',
    questionText: "How do you prefer to get support or guidance?",
    options: [
      { id: 'i1', text: "Structured programs with clear milestones", scores: [{ personaId: 'launch', points: 4 }, { personaId: 'scale', points: 2 }] },
      { id: 'i2', text: "Community forums and peer discussions", scores: [{ personaId: 'master', points: 3 }, { personaId: 'connect', points: 2 }] },
      { id: 'i3', text: "Expert coaching and one-on-one consultations", scores: [{ personaId: 'scale', points: 3 }, { personaId: 'invest', points: 3 }] },
      { id: 'i4', text: "Self-paced learning with comprehensive resources", scores: [{ personaId: 'master', points: 4 }] },
      { id: 'i5', text: "Direct connections to relevant experts/partners", scores: [{ personaId: 'connect', points: 4 }, { personaId: 'invest', points: 2 }] },
    ],
  },
  {
    id: 'q10_long_term_goal',
    questionText: "What's your primary long-term Amazon-related goal?",
    options: [
      { id: 'j1', text: "Build a profitable first product and grow from there", scores: [{ personaId: 'launch', points: 5 }] },
      { id: 'j2', text: "Create a multi-million dollar, system-driven Amazon business", scores: [{ personaId: 'scale', points: 5 }] },
      { id: 'j3', text: "Achieve comprehensive mastery of the Amazon ecosystem", scores: [{ personaId: 'master', points: 5 }] },
      { id: 'j4', text: "Develop a successful portfolio of Amazon business investments", scores: [{ personaId: 'invest', points: 5 }] },
      { id: 'j5', text: "Become a recognized expert and sought-after service provider", scores: [{ personaId: 'connect', points: 5 }] },
    ],
  },
];

export const LEAD_SCORING_POINTS = {
  behavioral: {
    maxPoints: 50,
    quizCompletion: 15,
    videoEngagement75Plus: 10,
    toolUsageCompleted: 8,
    multiplePageVisitsHighValue: 5,
    resourceDownloadedWithEmail: 7,
    pricingPageExtendedVisit: 12,
    serviceInquiryMade: 20,
    calendarBookingMade: 25,
    defaultInteraction: 1, // For generic interactions not explicitly listed
  } as Record<keyof BehavioralScoreMetrics | 'defaultInteraction' | 'maxPoints', number>,
  demographic: {
    maxPoints: 30,
    personaAlignmentStrong: 15,
    personaAlignmentMedium: 7, // For secondary or less confident primary matches
    businessStageAppropriate: 10, // Points allocated based on quiz answers for stage fit
    budgetIndicationPositive: 15, // Points allocated based on quiz answers for budget fit
  } as Record<keyof DemographicScoreMetrics | 'maxPoints', number>,
  engagementQuality: {
    maxPoints: 20,
    emailInteractionPositive: 8, // Hypothetical: If tracking email clicks back to site
    socialMediaEngagementHigh: 5, // Hypothetical: If tracking social engagement leading to site
    communityParticipationActive: 7, // Hypothetical: If tracking community activity
    siteVisitFrequencyHigh: 4, // e.g., for 3+ visits in a short period
    sessionDurationLong: 3, // e.g., for avg session duration > 5 mins
    emailSubscription: 5, // For active email subscription status
  } as Record<keyof EngagementQualityScoreMetrics | 'maxPoints', number>,
};

export const LEAD_STAGE_THRESHOLDS: Record<LeadStage, number> = {
  AnonymousVisitor: 0,
  IdentifiedProspect: 21,
  EngagedLead: 41,
  MarketingQualifiedLead: 61,
  SalesQualifiedLead: 81,
  Opportunity: 81, // Also SQL, but specifically if inquiry/booking made
  Customer: Infinity, // Typically set manually after purchase
  Advocate: Infinity, // Typically set manually based on post-purchase behavior
};


export const MOCK_DASHBOARD_OVERVIEW_DATA = {
  realTimeVisitors: 123, 
  personaBreakdown: [
    { name: 'Startup Sam', value: 45, fill: '#4ade80' },
    { name: 'Scaling Sarah', value: 30, fill: '#60a5fa' },
    { name: 'Other', value: 25, fill: '#a78bfa' }
  ], 
  kpis: [
    { id: 'total_visitors', title: 'Total Visitors', value: '12,345', change: '+5.2%', changeType: 'positive', icon: UsersIcon, tooltip: 'Unique visitors in the selected period' },
    { id: 'quiz_completions', title: 'Quiz Completions', value: '1,023', change: '+10%', changeType: 'positive', icon: CheckCircleIcon, tooltip: 'Number of users who completed the persona quiz' },
    { id: 'leads_generated', title: 'Leads Generated', value: '876', change: '-2.1%', changeType: 'negative', icon: AlertTriangleIcon, tooltip: 'New leads (e.g. email captured via quiz/exit-intent)' },
    { id: 'avg_engagement', title: 'Avg. Engagement Score', value: '68/100', changeType: 'neutral', icon: BarChartIcon, tooltip: 'Average site-wide engagement score of visitors' },
  ] as KpiCardData[],
  comparison: [
    { metric: 'Visitors', today: 1250, yesterday: 1180 },
    { metric: 'Quiz Starts', today: 230, yesterday: 210 },
    { metric: 'Leads', today: 95, yesterday: 90 },
  ]
};
export const MOCK_TRAFFIC_SOURCES_DATA: TrafficSourcesData = { 
  organic: {name:'Organic Search', value: 4500, details: ['amazon seller tools', 'how to launch amazon product']}, 
  social: {name:'Social Media', value: 2800, breakdown: [{name: 'Facebook', value:1500}, {name:'YouTube', value:800}]}, 
  direct: {name:'Direct', value: 1800}, 
  email: {name:'Email Marketing', value: 1200, campaignPerformance: [{name:'Welcome Series', value:300, metric: 'clicks'}, {name:'Launch Promo', value:150, metric: 'signups'}]}, 
  paid: {name:'Paid Ads', value: 2045, roi: '+250%'} 
};
export const MOCK_PERSONA_ANALYTICS_DATA: PersonaAnalyticsData = { 
  distribution: [
    { name: 'Startup Sam', value: 4500, fill: '#4ade80' },
    { name: 'Scaling Sarah', value: 3000, fill: '#60a5fa' },
    { name: 'Learning Larry', value: 2000, fill: '#a78bfa' },
    { name: 'Investor Ian', value: 1500, fill: '#facc15' },
    { name: 'Provider Priya', value: 1345, fill: '#2dd4bf' },
  ], 
  quizCompletionRates: [{source: 'Organic', rate: 65}, {source: 'Social', rate: 75}, {source: 'Direct', rate: 55}], 
  confidenceScores: [ {name: '0-20%', value: 50}, {name: '21-40%', value: 120}, {name: '41-60%', value: 300}, {name: '61-80%', value: 450}, {name: '81-100%', value: 103}]
};
export const MOCK_CONVERSION_TRACKING_DATA: ConversionTrackingData = { 
  funnelVisualization: [
    {name: 'Visit', value: 12345}, 
    {name: 'Quiz Start', value: 3000, dropOff: 75.7}, 
    {name: 'Email Submit', value: 1023, dropOff: 65.9}, 
    {name: 'Service Inquiry', value: 200, dropOff: 80.4},
    {name: 'Enrollment', value: 50, dropOff: 75}
  ], 
  quizToEmailRate: 34.1, 
  emailToServiceInquiryRate: 19.5, 
  serviceInquiryToEnrollmentRate: 25, 
  revenueAttribution: { 
    byPersona: [{name: 'Scaling Sarah', value: 150000}, {name: 'Startup Sam', value: 75000}], 
    byChannel: [{name: 'Organic', value: 100000}, {name: 'Paid Ads', value: 80000}] 
  } 
};
export const MOCK_SHADOW_FUNNEL_DATA: ShadowFunnelData = { 
  exitIntentPopup: { views: 5000, conversions: 250, rate: 5 }, 
  abandonedQuizRecovery: { recovered: 150, rate: 15 }, 
  retargetingEffectiveness: [{name: 'Facebook Ads', value: 80}, {name: 'Google Ads', value: 50}], 
  emailSequencePerformance: [{sequenceName: 'Abandoned Quiz Q2', openRate: 40, clickRate:10}, {sequenceName: 'Welcome Series', openRate:60, clickRate: 25}] 
};
export const MOCK_CONTENT_PERFORMANCE_DATA: ContentPerformanceData = { 
  pageEngagement: [{page: '/launch-hub', avgTime: '5m 30s', persona:'launch'}, {page: '/scale-hub/diagnostic', avgTime: '7m 15s', persona: 'scale'}], 
  resourceDownloads: [{name: 'Product Launch Checklist', downloads: 1200}, {name: 'Scaling SOPs', downloads: 800}], 
  videoCompletion: [{video: 'Intro to EO', rate: 60}, {video: 'Advanced PPC', rate: 45}], 
  communityMetrics: [{name:'Active Users', value: 500}, {name:'Posts per Week', value: 150}] 
};


export const LAUNCH_HERO_PROPS = { headline: "Launch Your First Amazon Product, Systematically", subheadline: "Navigate the complexities of product selection, listing, and launching with our proven PathFinder System. Avoid costly mistakes and build a profitable foundation.", valueProps: ["Risk-Minimized Product Selection", "Step-by-Step 60-Day Launch Plan", "Essential Implementation Tools"], ctaText: "Start Your Launch Assessment", ctaHref: "#launch-assessment" };
export const LAUNCH_ROADMAP_STEPS: RoadmapStep[] = [ {id: 'validate', title: 'Phase 1: Validate Product Idea', tasks: ['Market Research', 'Competitor Analysis', 'Profitability Calculation'] }, {id: 'source', title: 'Phase 2: Source & Brand Product', tasks: ['Supplier Vetting', 'Sample Ordering', 'Branding Basics']} ];
export const PRODUCT_SELECTION_TOOLS: LaunchTool[] = [ {id: 'opp_finder', name: 'Opportunity Finder Tool', description: 'Analyzes market data to uncover product niches.', type: 'Interactive Tool'}, {id: 'profit_calc', name: 'Profitability Calculator', description: 'Estimates potential profit margins.', type: 'Interactive Tool'}, {id: 'sel_crit_checklist', name: 'Selection Criteria Checklist', description: 'Ensures product viability.', type: 'Downloadable PDF'}];
export const RISK_REDUCTION_PROTOCOLS = [{id:'sup_verify', name: 'Supplier Verification Protocol', description:'Checklist for vetting suppliers.'}, {id:'ip_check', name:'IP & Patent Check Guide', description:'Basic guide to avoid IP issues.'}];
export const LAUNCH_IMPLEMENTATION_TOOLS: LaunchTool[] = [{id:'list_opt_checklist', name: 'Listing Optimization Checklist', description: 'Step-by-step for high-converting listings.', type: 'PDF Checklist'}, {id: 'kw_guide', name: 'Keyword Research Guide (Basic)', description:'Intro to finding relevant keywords.', type:'Downloadable Doc'}, {id: 'brand_tool_preview', name:'Brand Builder Toolkit', description: 'Tools for logo, packaging, etc. (Preview)', type:'Tool Preview'}];
export const LAUNCH_SUCCESS_STORIES: LaunchSuccessStory[] = [{id:'s1', name: 'Mike R.', before: 'Overwhelmed by options', after: 'Launched in 55 days', result:'$5k first month sales'}];
export const LAUNCH_SERVICE_TIERS: LaunchServiceTier[] = [{id:'lfs', name: 'Launch Foundation System', price: '$997', description: 'Core system for DIY launchers.', roiCalc:'Est. $10k in 6 months', guarantee:'Launch success or refinement support'}];
export const LAUNCH_COMMUNITY_FEATURES: LaunchCommunityFeature[] = [{id:'qna', name:'Weekly Q&A Calls', description:'Get answers from experts.'}, {id:'forum', name:'Private Launch Forum', description: 'Connect with fellow launchers.'}];

export const SCALE_HERO_PROPS = { headline: "Break Revenue Plateaus & Scale to 7-Figures", subheadline: "Implement advanced systems for operational excellence, revenue optimization, and sustainable growth. Transition from operator to owner.", stats: [{label: "Avg. Client Growth", value: "120% YoY", icon: TrendingUpIcon}, {label: "Systems Implemented", value: "450+", icon: CogIcon}], ctaText: "Get Your Business Growth Diagnostic", ctaHref: "#scale-diagnostic" };
export const SCALE_BUSINESS_DIAGNOSTIC_TOOLS: BusinessDiagnosticTool[] = [{id:'bd_assess', name: '15-Point Diagnostic Assessment', description: 'Holistic business health check.', type: 'Assessment'}];
export const SCALE_OPERATIONAL_EXCELLENCE_FRAMEWORKS: OptimizationFramework[] = [{id:'sop_lib', name:'SOP Library Access', description: 'Templates for key Amazon processes.', category:'Operational Excellence', type: 'Template'}];
export const SCALE_REVENUE_OPTIMIZATION_SYSTEMS: OptimizationFramework[] = [{id:'ppc_opt', name: 'PPC Optimization Matrix', description: 'Framework for advanced campaign management.', category: 'Revenue Optimization', type: 'Matrix'}];
export const SCALE_SCALING_INFRASTRUCTURE: OptimizationFramework[] = [{id:'inv_plan', name: 'Inventory Planning System', description: 'Prevent stockouts & overstocking.', category: 'Scaling Infrastructure', type: 'System'}];
export const SCALE_CASE_STUDIES: ScaleCaseStudy[] = [{id:'cs1', clientName:'7-Figure Seller Inc.', challenge: 'Stagnant growth at $1.2M/yr', solutionApplied: 'EO Scale Systems', results: [{metric:'Revenue', value:'$2.5M/yr', improvement: '108% in 12 mo'}]}];
export const SCALE_SERVICE_PATHWAY: ScaleServiceTierType[] = [{id:'sap', name: 'Scale Acceleration Program', price:'$2,997', description:'Full diagnostic & system implementation.', timeline: '3-6 Months', features: ['Full Diagnostic', 'Custom Roadmap', 'Mastermind Access']}];
export const SCALE_INTERACTIVE_TOOLS: ScaleInteractiveTool[] = [{id:'profit_dash', name:'Profitability Dashboard', description:'Track true profit margins.', ctaText:'Connect Seller Central (Concept)'}];
export const SCALE_MASTERMIND_FEATURES: ScaleMastermindFeature[] = [{id:'elite_forum', name:'Elite Seller Forum', description:'Private group for 7-figure+ sellers.'}];

export const MASTER_HERO_PROPS: MasterHeroProps = { headline: "Achieve True Amazon Ecosystem Mastery", subheadline: "Go beyond tactics. Understand the fundamental principles, conceptual frameworks, and strategic models that drive sustainable success in the Amazon marketplace.", ctaText: "Take the Knowledge Architecture Assessment", ctaHref: "#master-assessment" };
export const MASTER_ECOSYSTEM_COMPONENTS: EcosystemComponentModel[] = [{id:'flywheel', name:'Amazon Flywheel Dynamics', description:'Understand interconnected growth loops.', detailsLink:'#'}];
export const MASTER_CONCEPTUAL_FRAMEWORKS: ConceptualFramework[] = [{id:'value_ladder', name:'Seller Value Ladder', summary:'Mapping customer journey to service offerings.', visualModelUrl: 'https://picsum.photos/seed/master_fw/300/150', applicationScenarios:['Service Design', 'Marketing Strategy']}];
export const MASTER_IMPLEMENTATION_BRIDGES: ImplementationBridge[] = [{id:'scenario_ppc', name:'PPC Strategy Scenario Module', type:'Scenario Module', description:'Apply bidding theories to case studies.', durationEstimate:'2 hours'}];
export const MASTER_KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [{id:'kd_mkt', name:'Market & Competitor Analysis', description:'Deep understanding of market forces.', assessmentAvailable:true}];
export const MASTER_VERIFICATION_METHODS: MasteryVerificationMethod[] = [{id:'mv_assess', name:'Domain Knowledge Assessment', type:'Assessment', description:'Test conceptual understanding.'}];
export const MASTER_SERVICE_TIERS: MasterServiceTierType[] = [{id:'ms_mastery_accel', name:'Mastery Accelerator Program', price:'$1,497', description:'Guided learning through core frameworks.', features:['Full Curriculum Access', 'Expert Coaching', 'Verification Pathway']}];
export const MASTER_INTERACTIVE_TOOLS: MasterInteractiveTool[] = [{id:'concept_map', name:'Ecosystem Concept Mapper', description:'Visually connect Amazon concepts.', toolType:'Concept Mapper'}];
export const MASTER_COMMUNITY_FEATURES: MasterCommunityFeatureType[] = [{id:'study_groups', name:'Peer Study Groups', description:'Collaborate on complex topics.'}];

export const INVEST_HERO_PROPS: InvestHeroProps = { headline: "Build & Optimize Your Amazon Business Portfolio", subheadline: "Leverage sophisticated due diligence, valuation, and risk management systems to acquire, grow, and exit Amazon businesses effectively.", ctaText: "Access Investment Strategy Assessment", ctaHref: "#invest-assessment" };
export const INVEST_DUE_DILIGENCE_ITEMS: DueDiligenceItem[] = [{id:'fin_dd', name:'Financial Statement Audit', description:'Verify accuracy of financial records.', category:'Financial'}];
export const INVEST_VALUATION_MODELS: ValuationModel[] = [{id:'sde_multi', name:'SDE Multiple Model', description:'Standard for small e-commerce.', type:'SDE Multiple'}];
export const INVEST_RISK_FACTORS: RiskFactor[] = [{id:'platform_risk', name:'Amazon Platform Risk', category:'Platform', mitigationStrategy:'Diversification, TOS Compliance'}];
export const INVEST_PORTFOLIO_TOOLS: PortfolioTool[] = [{id:'port_dash', name:'Portfolio Performance Dashboard', description:'Track key metrics across investments.', type:'Dashboard'}];
export const INVEST_OPPORTUNITIES: InvestmentOpportunity[] = [{id:'opp1', name:'Rapid Growth Pet Supplies Brand', category:'Pet Supplies', askingPriceRange:'$500k-$750k', sdeMultipleRange:'3.5x-4.0x', summary:'Strong niche, high growth.', highlight:'High ROI Potential'}];
export const INVEST_SERVICE_TIERS: InvestServiceTierType[] = [{id:'iso', name:'Investment Strategy & Ops', price:'$4,997', description:'Full suite for active investors.', features:['Deal Sourcing', 'Due Diligence Support', 'Portfolio Management System']}];
export const INVEST_ANALYTICAL_TOOLS: InvestAnalyticalTool[] = [{id:'roi_calc_invest', name:'Deal ROI Calculator', description:'Project returns for potential acquisitions.', toolType:'Calculator'}];
export const INVEST_NETWORK_FEATURES: InvestorNetworkFeature[] = [{id:'deal_share', name:'Private Deal Sharing', description:'Access off-market opportunities.'}];

export const CONNECT_HERO_PROPS: ConnectHeroProps = { headline: "Connect with Premium Amazon Clients & Partners", subheadline: "Elevate your service business by showcasing your expertise, attracting ideal clients, and leveraging our network for growth and collaboration.", ctaText: "Complete Your Service Positioning Assessment", ctaHref: "#connect-assessment" };
export const CONNECT_EXPERTISE_FRAMEWORKS: ExpertiseFramework[] = [{id:'expert_show', name:'Expertise Showcase Blueprint', description:'System to build authority.', type:'Framework', category:'Showcase'}];
export const CONNECT_CLIENT_ACQUISITION_METHODS: ExpertiseFramework[] = [{id:'ideal_client', name:'Ideal Client Profiling Tool', description:'Define your perfect client.', type:'Tool', category:'Acquisition'}];
export const CONNECT_VALUE_DEMO_TOOLS: ExpertiseFramework[] = [{id:'roi_present', name:'ROI Presentation Template', description:'Showcase client results effectively.', type:'Template', category:'Demonstration'}];
export const CONNECT_PREMIUM_POSITIONING: ExpertiseFramework[] = [{id:'tier_design', name:'Service Tier Design Framework', description:'Create compelling service packages.', type:'Framework', category:'Positioning'}];
export const CONNECT_OPPORTUNITIES: ClientConnectionOpportunity[] = [{id:'client_match', type:'Client Matching', description:'Get matched with sellers needing your skills.', ctaText:'View Matching Criteria'}];
export const CONNECT_SERVICE_TIERS: ConnectServiceTierType[] = [{id:'cga', name:'Client Growth Accelerator', price:'$1,297', description:'Systems for premium client acquisition.', features:['Positioning Assessment', 'Acquisition Frameworks', 'Community Access']}];
export const CONNECT_BIZ_DEV_TOOLS: BusinessDevelopmentTool[] = [{id:'proposal_gen', name:'Proposal Generator (Concept)', description:'Create professional proposals quickly.', toolType:'Framework'}];
export const CONNECT_PROVIDER_COMMUNITY: ProviderCommunityFeatureType[] = [{id:'provider_mastermind', name:'Provider Mastermind Groups', description:'Collaborate with top service providers.'}];


export const PERSONA_SPECIFIC_EXIT_CONTENT: Record<PersonaId | 'default_exit' | 'unknown', PersonaSpecificExitContent> = {
  launch: { headline: "Wait! Get Your Free Product Selection Risk Assessment", offer: "Our comprehensive checklist helps prevent costly mistakes when selecting your first product. Essential for new launchers!", ctaText: "Protect My Investment", accentColorClass: "green", imageUrl: "https://picsum.photos/seed/exit_launch/100/100" },
  scale: { headline: "Before You Go - Get Your Business Bottleneck Analysis", offer: "Pinpoint the top 3 growth blockers in your Amazon business with our free diagnostic framework.", ctaText: "Find My Bottlenecks", accentColorClass: "blue", imageUrl: "https://picsum.photos/seed/exit_scale/100/100" },
  master: { headline: "Complete Your Amazon Knowledge Gap Analysis", offer: "Receive a personalized learning roadmap and discover key implementation bridges to turn theory into action.", ctaText: "Get My Learning Path", accentColorClass: "purple", imageUrl: "https://picsum.photos/seed/exit_master/100/100" },
  invest: { headline: "Get Your Amazon Investment Due Diligence Checklist", offer: "Access our professional-grade evaluation framework to assess Amazon business opportunities like an expert.", ctaText: "Access Due Diligence", accentColorClass: "yellow", imageUrl: "https://picsum.photos/seed/exit_invest/100/100" },
  connect: { headline: "Discover Your Service Business Growth Opportunities", offer: "Take our quick assessment to identify key areas for client acquisition and premium positioning.", ctaText: "Analyze My Business", accentColorClass: "teal", imageUrl: "https://picsum.photos/seed/exit_connect/100/100" },
  default_exit: { headline: "Don't Leave Empty Handed!", offer: "Get our FREE 'Top 5 Amazon Success Factors' checklist and start your journey right!", ctaText: "Get My Free Checklist", accentColorClass: "orange", imageUrl: "https://picsum.photos/seed/exit_default/100/100" },
  unknown: { headline: "Unlock Your Amazon Potential!", offer: "Grab our exclusive guide to navigating the Amazon ecosystem effectively.", ctaText: "Download Free Guide", accentColorClass: "gray", imageUrl: "https://picsum.photos/seed/exit_unknown/100/100" }
};

export const HERO_HEADLINE_VARIANTS: Record<PersonaId | 'default' | 'returning', DynamicContentVariant> = {
  default: { key: 'headline_default', content: "Transform Your Amazon Journey with Systematic Success" },
  returning: { key: 'headline_returning', content: "Welcome Back! Let's Continue Your Amazon Success" },
  launch: { key: 'headline_launch', content: "Launch Your First Amazon Product With Confidence" },
  scale: { key: 'headline_scale', content: "Break Revenue Plateaus & Scale to 7-Figures" },
  master: { key: 'headline_master', content: "Achieve True Amazon Ecosystem Mastery" },
  invest: { key: 'headline_invest', content: "Build & Optimize Your Amazon Business Portfolio" },
  connect: { key: 'headline_connect', content: "Connect with Premium Amazon Clients & Partners" },
  unknown: { key: 'headline_unknown', content: "Discover Your Unique Path in the Amazon Ecosystem" },
  default_exit: { key: 'headline_default_exit', content: "One Last Thing Before You Go..." }
};

export const SMART_CTA_VARIANTS: Record<EngagementLevel, { hero: DynamicContentVariant, quiz_prompt: DynamicContentVariant }> = {
  low: {
    hero: { key: 'cta_hero_low', content: { text: "Discover Your Path", actionType: "quiz" } },
    quiz_prompt: { key: 'cta_quiz_low', content: { text: "Take the Quiz", actionType: "quiz" } },
  },
  medium: {
    hero: { key: 'cta_hero_medium', content: { text: "Explore Solutions", actionType: "pathways" } },
    quiz_prompt: { key: 'cta_quiz_medium', content: { text: "Get My Persona Insights", actionType: "quiz" } },
  },
  high: {
    hero: { key: 'cta_hero_high', content: { text: "View Program Details", actionType: "services" } },
    quiz_prompt: { key: 'cta_quiz_high', content: { text: "Unlock My Roadmap", actionType: "quiz" } },
  },
  very_high: {
    hero: { key: 'cta_hero_very_high', content: { text: "Book a Free Strategy Call", actionType: "consult" } },
    quiz_prompt: { key: 'cta_quiz_very_high', content: { text: "Discuss My Results", actionType: "consult_after_quiz" } },
  }
};