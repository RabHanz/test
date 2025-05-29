
import type { EmailSequence, PersonaId } from '../types';

export const EMAIL_SEQUENCES: EmailSequence[] = [
  // --- ABANDONED QUIZ SEQUENCES ---
  {
    id: 'abandoned_quiz_q2_exit',
    name: 'Abandoned Quiz - Exited After Question 2',
    description: 'Targets users who start the quiz but leave after completing up to question 2.',
    triggerEvent: 'quiz_abandoned_at_q2',
    steps: [
      { day: 0, subject: "Quick question about your Amazon goals...", body: "Hi [Name],\n\nWe saw you started the Ecommerce Outset persona quiz but didn't get far. \n\nJust curious, what's your biggest hurdle right now with Amazon? Sometimes just naming it is the first step!\n\nReply to this email – we read every response.\n\nBest,\nThe EO Team", cta: { text: "Continue Quiz", link: "#quiz-modal" } },
      { day: 2, subject: "Still pondering those Amazon goals?", body: "Hey [Name],\n\nFinding your footing on Amazon can be tricky. Our quiz is designed to quickly point you to resources that can genuinely help, no matter your current stage.\n\nWhy not give it another few minutes? You might be surprised by what you discover.\n\nCheers,\nThe EO Team", cta: { text: "Finish the Quiz & Get Clarity", link: "#quiz-modal" } },
    ]
  },
  {
    id: 'abandoned_quiz_q5_exit',
    name: 'Abandoned Quiz - Exited After Question 5',
    description: 'Targets users who complete up to question 5, showing more engagement.',
    triggerEvent: 'quiz_abandoned_at_q5',
    steps: [
      { day: 0, subject: "We noticed you're serious about Amazon success...", body: "Hi [Name],\n\nYou were making great progress on the Ecommerce Outset persona quiz! It looks like you're invested in figuring out your next steps on Amazon.\n\nLife happens, but your personalized insights are just a few clicks away. Pick up where you left off?\n\nRegards,\nThe EO Team", cta: { text: "Resume Quiz", link: "#quiz-modal" } },
      { day: 2, subject: "Unlock Your Amazon Potential: Free Resource", body: "Hi [Name],\n\nSince you're exploring how to succeed on Amazon, you might find our '[Relevant Freebie Title]' guide useful. It covers [brief benefit].\n\nIf you complete the quiz, we can tailor even more specific resources for you.\n\nTo your success,\nThe EO Team", cta: { text: "Download Free Guide", link: "#" } }, // Link to a generic valuable freebie
    ]
  },
  {
    id: 'abandoned_quiz_q8_exit',
    name: 'Abandoned Quiz - Exited After Question 8',
    description: 'Targets users who are very close to completing the quiz.',
    triggerEvent: 'quiz_abandoned_at_q8',
    steps: [
      { day: 0, subject: "You're almost there! Your Amazon path awaits.", body: "Hi [Name],\n\nYou were SO close to finishing the Ecommerce Outset persona quiz and getting your personalized roadmap!\n\nDon't miss out on insights tailored specifically to your situation. It only takes a couple more minutes.\n\nSee you on the other side,\nThe EO Team", cta: { text: "Get My Results Now", link: "#quiz-modal" } },
      { day: 1, subject: "See what [Similar Persona] achieved...", body: "Hi [Name],\n\nMany sellers who align with the path you were heading towards (based on your answers so far!) have found success like [brief, relevant testimonial snippet].\n\nYour tailored strategy can make all the difference. Complete the quiz to see yours.\n\nBest,\nThe EO Team", cta: { text: "Complete My Personalized Quiz", link: "#quiz-modal" } },
    ]
  },
  {
    id: 'abandoned_quiz_before_results',
    name: 'Abandoned Quiz - Exited Before Viewing Results',
    description: 'Targets users who complete all questions but don\'t view the results page.',
    triggerEvent: 'quiz_completed_did_not_view_results',
    steps: [
      { day: 0, subject: "Your personalized Amazon roadmap is ready!", body: "Hi [Name],\n\nGreat news! You completed the Ecommerce Outset persona quiz, and your personalized results are compiled and waiting for you.\n\nDiscover your primary Amazon seller persona and the specific strategies that will work best for you.\n\nKindly,\nThe EO Team", cta: { text: "View My Personalized Results", link: "#quiz-modal" } }, // Link should ideally take them to results if possible, or back to quiz to re-trigger calc.
      { day: 1, subject: "Don't leave your Amazon strategy to chance, [Name]", body: "Hi [Name],\n\nYour tailored Amazon success path, based on your quiz answers, is still waiting. This isn't generic advice – it's specific to YOU.\n\nUnderstanding your persona is the first step to more effective action.\n\nRegards,\nThe EO Team", cta: { text: "See My Custom Roadmap", link: "#quiz-modal" } },
    ]
  },

  // --- PERSONA-SPECIFIC NURTURE SEQUENCES ---
  {
    id: 'nurture_startup_sam',
    name: 'Nurture - Startup Sam (7-Day)',
    description: '7-day nurture sequence for users identified as Startup Sam.',
    triggerEvent: 'quiz_result_primary_persona_launch',
    audiencePersona: ['launch' as PersonaId],
    steps: [
      { day: 1, subject: "Your Product Selection Safety Net, Sam!", 
        body: "Hi [Name],\n\nWelcome to the Startup Sam path! We know launching your first product can feel like navigating a minefield. That's why we emphasize risk reduction from day one.\n\nOur 'Product Selection Risk Assessment' (included in your Launch Hub resources) is crucial. It helps you avoid common pitfalls that sink new sellers.\n\nWhat's your biggest fear about choosing a product?\n\nTo your safe launch,\nThe EO Team", 
        cta: { text: "Access Launch Hub Resources", link: "#launch-hub" } },
      { day: 2, subject: "The #1 Mistake That Costs New Sellers $5,000+ (And How to Avoid It)", 
        body: "Hey [Name],\n\nMany new sellers lose thousands by [common mistake, e.g., ordering too much inventory of an unvalidated product].\n\nLearn from [brief anonymous case study snippet, e.g., 'Seller X who lost $7k'] how crucial upfront validation is. Our system helps prevent this.\n\nAre you validating your product ideas effectively?\n\nStay sharp,\nThe EO Team", 
        cta: { text: "Learn about Product Validation", link: "#launch-hub/product-selection" } },
      { day: 3, subject: "Your 60-Day Amazon Launch Roadmap (Preview)", 
        body: "Hi [Name],\n\nFeeling overwhelmed? A clear plan is everything. We've mapped out a 60-day launch sequence, broken down into manageable daily and weekly tasks.\n\nGrab a preview of the first week's plan [link to a PDF or section]. Imagine having this clarity for your entire launch!\n\nPlan your work, work your plan,\nThe EO Team", 
        cta: { text: "Get Roadmap Preview", link: "#launch-hub/roadmap" } },
      { day: 4, subject: "He Was a Beginner Too: [Startup Sam Success Story Name]'s Journey", 
        body: "Hi [Name],\n\nMeet [Success Story Name], who started just like you and [achieved specific result, e.g., 'launched successfully in 50 days, profitable in 3 months'] using the EO Launch system.\n\n[Link to a short testimonial video or written story]. Inspiration to keep you going!\n\nIt's possible,\nThe EO Team", 
        cta: { text: "Watch [Name]'s Story", link: "#launch-hub/success-stories" } },
      { day: 5, subject: "Is the EO Launch Foundation Program Right for You, [Name]?", 
        body: "Hi [Name],\n\nOur Launch Foundation program is designed to give you everything you need: Product Selection Framework, Listing Creation System, and Launch Strategy Development.\n\nIt’s for serious beginners who want to do it right the first time. Explore the details and see if it fits your ambitions.\n\nInvest in your success,\nThe EO Team", 
        cta: { text: "Explore Launch Foundation Program", link: "#launch-hub/services" } },
      { day: 6, subject: "Limited Spots: Join the Next Launch Foundation Cohort?", 
        body: "Hi [Name],\n\nTo ensure personalized attention, we limit spots in our Launch Foundation program. The next cohort is filling up.\n\nIf you're considering getting structured support for your launch, now's a good time to decide.\n\nDon't miss out,\nThe EO Team", 
        cta: { text: "Check Availability & Enroll", link: "#launch-hub/services" } },
      { day: 7, subject: "Your Amazon Launch Journey Starts Here, [Name]", 
        body: "Hi [Name],\n\nThis is your moment. Armed with the right knowledge and systems, you CAN launch a successful Amazon product.\n\nWhether you use our free resources or join a program, we're here to support your journey.\n\nWhat's your first step today?\n\nLet's do this,\nThe EO Team", 
        cta: { text: "Book a Free Launch Consult", link: "#book-launch-consult" } },
    ]
  },
  {
    id: 'nurture_scaling_sarah',
    name: 'Nurture - Scaling Sarah (7-Day)',
    description: '7-day nurture sequence for users identified as Scaling Sarah.',
    triggerEvent: 'quiz_result_primary_persona_scale',
    audiencePersona: ['scale' as PersonaId],
    steps: [
      { day: 1, subject: "The Plateau-Breaking Framework for Your Amazon Business, [Name]", 
        body: "Hi [Name],\n\nWelcome to the Scaling Sarah path! Hitting revenue plateaus is common, but breaking through them requires a systematic approach, not just more tactics.\n\nOur 'Growth Bottleneck Diagnostic' (available in your Scale Hub) is the first step to identifying what's truly holding you back.\n\nReady to diagnose your growth engine?\n\nScale systematically,\nThe EO Team", 
        cta: { text: "Access Scale Hub Tools", link: "#scale-hub" } },
      { day: 2, subject: "Why 80% of Sellers Stagnate at $25K/Month (And How to Be the 20%)", 
        body: "Hey [Name],\n\nMany sellers get stuck because [common scaling issue, e.g., 'lack of operational systems' or 'undifferentiated products']. The path to $100k/month and beyond requires a shift in strategy.\n\nOur Scale Acceleration program focuses on building these critical systems. What's your current biggest scaling challenge?\n\nThink bigger,\nThe EO Team", 
        cta: { text: "Discover Scaling Systems", link: "#scale-hub/operational-excellence" } },
      { day: 3, subject: "Preview Your Business Diagnostic Results ([Name])", 
        body: "Hi [Name],\n\nImagine having a clear report card for your business, highlighting strengths, weaknesses, and exact areas for optimization.\n\nOur Business Diagnostic tool (part of the Scale program) provides this. [Link to a sample report or interactive preview]. This clarity is game-changing.\n\nKnowledge is power,\nThe EO Team", 
        cta: { text: "See Sample Diagnostic", link: "#scale-hub/diagnostic" } },
      { day: 4, subject: "How Sarah J. Systematically Broke $100K/Month on Amazon", 
        body: "Hi [Name],\n\nMeet Sarah J., a seller who was stuck at $30k/month before implementing the EO Scale frameworks. She [achieved specific result, e.g., 'streamlined her operations, optimized her listings, and hit $105k/month within 6 months'].\n\n[Link to her case study]. Real results, real systems.\n\nSuccess leaves clues,\nThe EO Team", 
        cta: { text: "Read Sarah J.'s Case Study", link: "#scale-hub/case-studies" } },
      { day: 5, subject: "[Name], A Deep Dive into the EO Scale Acceleration Program", 
        body: "Hi [Name],\n\nThe Scale Acceleration program isn't just more information. It's a transformation system: Business Diagnostic, Custom Optimization Roadmap, and ongoing Mastermind Support.\n\nIf you're serious about building a 7-figure, saleable Amazon asset, this is for you. Explore the full program details.\n\nYour next level awaits,\nThe EO Team", 
        cta: { text: "Explore Scale Acceleration Program", link: "#scale-hub/services" } },
      { day: 6, subject: "Scale Mastermind Access Closing Soon for New Members", 
        body: "Hi [Name],\n\nOur elite Scaling Masterminds provide invaluable peer support and expert guidance. Access is typically bundled with our Scale Acceleration program, and spots are limited to ensure quality interaction.\n\nIf you're looking for that high-level strategy and accountability, consider this your invitation.\n\nLevel up your network,\nThe EO Team", 
        cta: { text: "Learn About Mastermind Access", link: "#scale-hub/mastermind" } },
      { day: 7, subject: "Your Amazon Scaling Journey Awaits, [Name]", 
        body: "Hi [Name],\n\nYou have the potential to build a significantly larger and more profitable Amazon business. The key is systematic scaling.\n\nWhat's one system you can improve in your business this week? Start there, or let us guide you.\n\nTo your continued growth,\nThe EO Team", 
        cta: { text: "Book a Free Scale Strategy Call", link: "#book-scale-consult" } },
    ]
  },
  // Placeholder for Learning Larry
  {
    id: 'nurture_learning_larry',
    name: 'Nurture - Learning Larry (7-Day)',
    description: '7-day nurture sequence for Learning Larry personas.',
    triggerEvent: 'quiz_result_primary_persona_master',
    audiencePersona: ['master' as PersonaId],
    steps: [ { day: 1, subject: "Welcome, Knowledge Seeker!", body: "Details for Learning Larry day 1...", cta: { text: "Explore Master Hub", link: "#master-hub"}} ] // Add more steps
  },
  // Placeholder for Investor Ian
  {
    id: 'nurture_investor_ian',
    name: 'Nurture - Investor Ian (7-Day)',
    description: '7-day nurture sequence for Investor Ian personas.',
    triggerEvent: 'quiz_result_primary_persona_invest',
    audiencePersona: ['invest' as PersonaId],
    steps: [ { day: 1, subject: "Building Your Amazon Portfolio", body: "Details for Investor Ian day 1...", cta: { text: "Explore Invest Hub", link: "#invest-hub"}} ] // Add more steps
  },
  // Placeholder for Provider Priya
  {
    id: 'nurture_provider_priya',
    name: 'Nurture - Provider Priya (7-Day)',
    description: '7-day nurture sequence for Provider Priya personas.',
    triggerEvent: 'quiz_result_primary_persona_connect',
    audiencePersona: ['connect' as PersonaId],
    steps: [ { day: 1, subject: "Connecting with Premium Clients", body: "Details for Provider Priya day 1...", cta: { text: "Explore Connect Hub", link: "#connect-hub"}} ] // Add more steps
  },

  // --- BEHAVIORAL TRIGGER EMAILS ---
  {
    id: 'pricing_page_abandon_immediate',
    name: 'Pricing Page Abandonment - Immediate',
    description: 'Sent immediately after a user spends time on a pricing page and leaves without CTA.',
    triggerEvent: 'pricing_page_abandonment_immediate', // Example trigger name
    steps: [
      { subject: "Questions about our Ecommerce Outset programs?", 
        body: "Hi [Name],\n\nSaw you were checking out our program details. Do you have any questions I can help answer? \n\nWe have a comprehensive FAQ here: [Link to FAQ]\n\nSometimes a quick chat is easier. Feel free to book a no-obligation call: [Link to Calendar]\n\nBest,\nThe EO Team",
        cta: {text: "See Program FAQs", link: "#faq"} }
    ]
  },
  {
    id: 'pricing_page_abandon_24hr',
    name: 'Pricing Page Abandonment - 24 Hours',
    description: 'Sent 24 hours after pricing page abandonment.',
    triggerEvent: 'pricing_page_abandonment_24hr',
    steps: [
      { subject: "The ROI of Investing in Your Amazon Success", 
        body: "Hi [Name],\n\nThinking about the investment in an EO program? Consider the potential ROI.\n\n[Success Story Snippet with ROI focus, e.g., 'Jane D. invested $X and saw $Y return in Z months.']\n\nUse our ROI calculator to see your potential: [Link to ROI Calculator Tool]\n\nPlus, hear from members who've seen transformational results: [Link to Testimonials]\n\nTo your growth,\nThe EO Team",
        cta: {text: "Calculate Your ROI", link: "#roi-calculator-tool"} } // Placeholder link
    ]
  },
  // Add more pricing page abandonment emails (72hr, 1 week)
  // Add video drop-off trigger emails
  // Add tool usage abandonment emails
];
