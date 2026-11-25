export interface FAQItem {
  id: string;
  category: FAQCategoryName;
  question: string;
  answer: string;
  tags?: string[];
}

export const FAQ_CATEGORIES = [
  'All',
  'General About Guidexa',
  'Courses & Programs',
  'Enrollment & Registration',
  'Payments & Pricing',
  'Learning Experience',
  'Curriculum & Projects',
  'Assessments & Assignments',
  'Certificates & Verification',
  'Live Classes & Mentorship',
  'Account & Technical Issues',
] as const;

export type FAQCategory = (typeof FAQ_CATEGORIES)[number];
export type FAQCategoryName = Exclude<FAQCategory, 'All'>;

export const POPULAR_TOPICS = [
  { label: 'Certificates', tag: 'certificate', category: 'Certificates & Verification' },
  { label: 'Enrollment', tag: 'enroll', category: 'Enrollment & Registration' },
  { label: 'Prerequisites', tag: 'prerequisites', category: 'Courses & Programs' },
  { label: 'Projects', tag: 'project', category: 'Curriculum & Projects' },
  { label: 'Free Courses', tag: 'free', category: 'Payments & Pricing' },
  { label: 'Live Sessions', tag: 'live', category: 'Live Classes & Mentorship' },
];

export const FAQ_ITEMS: FAQItem[] = [
  // 1. General About Guidexa
  {
    id: 'gen-1',
    category: 'General About Guidexa',
    question: 'What is Guidexa?',
    answer:
      'Guidexa is a modern technology education platform developed under Softmaxs Solution LLP. We provide structured learning paths, practical hands-on exercises, real-world project evaluations, and mentor guidance to help learners build production-ready engineering skills.',
    tags: ['general', 'about', 'softmaxs', 'platform'],
  },
  {
    id: 'gen-2',
    category: 'General About Guidexa',
    question: 'Who can learn on Guidexa?',
    answer:
      'Guidexa is built for anyone serious about mastering technology—including university students seeking practical coding skills, career switchers building strong software foundations, and experienced engineers upskilling in distributed systems, full-stack architecture, or AI.',
    tags: ['general', 'students', 'beginners', 'professionals'],
  },
  {
    id: 'gen-3',
    category: 'General About Guidexa',
    question: 'Which technology domains are covered on Guidexa?',
    answer:
      'Our catalog spans Computer Science & Algorithms, Full Stack Web Development (React, Next.js, Node.js), Backend & Distributed Systems, Cloud Architecture & DevOps (Docker, Linux), and Applied Data Science & AI.',
    tags: ['general', 'topics', 'full stack', 'backend', 'ai', 'cloud'],
  },
  {
    id: 'gen-4',
    category: 'General About Guidexa',
    question: 'Is Guidexa affiliated with an organization?',
    answer:
      'Yes, Guidexa is an educational initiative developed and operated under Softmaxs Solution LLP, dedicated to delivering honest, high-quality technical education and industry-aligned skills training.',
    tags: ['general', 'organization', 'softmaxs'],
  },

  // 2. Courses & Programs
  {
    id: 'crs-1',
    category: 'Courses & Programs',
    question: 'How can I view the course curriculum before enrolling?',
    answer:
      'Every course detail page features a complete curriculum breakdown. You can inspect all modules, chapters, individual lesson titles, estimated study hours, and learning outcomes prior to making any enrollment decision.',
    tags: ['courses', 'curriculum', 'syllabus'],
  },
  {
    id: 'crs-2',
    category: 'Courses & Programs',
    question: 'Are Guidexa courses beginner-friendly?',
    answer:
      'Yes. We offer courses tailored to all skill levels. Beginner-level courses start from fundamental syntax and core computational thinking without assuming prior programming knowledge. Each course clearly displays its intended skill level (Beginner, Intermediate, or Advanced).',
    tags: ['courses', 'beginner', 'skill level'],
  },
  {
    id: 'crs-3',
    category: 'Courses & Programs',
    question: 'What are course prerequisites and how do I check them?',
    answer:
      'Each course page lists explicit prerequisites under "What You Should Know Before Starting". You can also use our interactive "Check Eligibility" tool to assess whether a course matches your background before you enroll.',
    tags: ['courses', 'prerequisites', 'eligibility'],
  },
  {
    id: 'crs-4',
    category: 'Courses & Programs',
    question: 'Are courses self-paced or cohort-based?',
    answer:
      'Guidexa combines self-paced video lessons and reading materials with scheduled cohort batches and live mentor workshops, giving you the flexibility to learn on your own schedule while enjoying structured guidance and peer accountability.',
    tags: ['courses', 'self-paced', 'cohort', 'format'],
  },

  // 3. Enrollment & Registration
  {
    id: 'enr-1',
    category: 'Enrollment & Registration',
    question: 'How do I create a student account on Guidexa?',
    answer:
      'You can create a student account in seconds by clicking "Sign In" or "Enroll Now" and choosing either one-click Google Authentication or entering your email and password.',
    tags: ['enrollment', 'register', 'account', 'sign up'],
  },
  {
    id: 'enr-2',
    category: 'Enrollment & Registration',
    question: 'How do I enroll in a free course?',
    answer:
      'Courses marked with the "FREE" badge can be joined instantly. Simply log into your student account, open the course page, and click "Enroll for Free". You will receive immediate access to all lessons and materials.',
    tags: ['enrollment', 'free', 'instant access'],
  },
  {
    id: 'enr-3',
    category: 'Enrollment & Registration',
    question: 'How do I enroll in a paid or cohort program?',
    answer:
      'On the course page, you can review upcoming batch schedules and click "Book Free Demo Class" or contact our admissions desk. Our academic counselors will verify your batch timing and assist you through registration.',
    tags: ['enrollment', 'paid', 'cohort', 'admissions'],
  },
  {
    id: 'enr-4',
    category: 'Enrollment & Registration',
    question: 'Where can I access my enrolled courses?',
    answer:
      'Once enrolled, all your active and completed programs appear in your Student Dashboard (/student/courses), where you can track progress and jump right back into your current lesson.',
    tags: ['enrollment', 'access', 'dashboard', 'student portal'],
  },

  // 4. Payments & Pricing
  {
    id: 'pay-1',
    category: 'Payments & Pricing',
    question: 'Where can I check course pricing?',
    answer:
      'All course tuition fees are transparently published in the pricing card on each course page. We believe in upfront pricing with zero hidden registration fees or unexpected charges.',
    tags: ['pricing', 'tuition', 'cost', 'fees'],
  },
  {
    id: 'pay-2',
    category: 'Payments & Pricing',
    question: 'Are free courses genuinely 100% free?',
    answer:
      'Yes. Courses labeled "FREE" provide complete access to all included modules, videos, reading materials, and quizzes without requiring any credit card details or commitments.',
    tags: ['pricing', 'free courses', 'no credit card'],
  },
  {
    id: 'pay-3',
    category: 'Payments & Pricing',
    question: 'Are flexible installment or EMI options available?',
    answer:
      'Yes. Selected engineering cohorts offer multi-part installment options. You can discuss flexible installment plans directly with our admissions counseling desk before finalizing your enrollment.',
    tags: ['pricing', 'installments', 'emi', 'split payment'],
  },
  {
    id: 'pay-4',
    category: 'Payments & Pricing',
    question: 'How can I verify my payment status?',
    answer:
      'Payment confirmations and invoice receipts are verified and updated in your student account dashboard under your enrolled courses. If you need assistance with payment verification, you can contact our admissions desk with your enrollment reference ID.',
    tags: ['pricing', 'payment status', 'verification', 'receipt'],
  },

  // 5. Learning Experience
  {
    id: 'lrn-1',
    category: 'Learning Experience',
    question: 'How are lessons delivered on Guidexa?',
    answer:
      'Lessons are delivered through dual-format modules featuring high-definition video walkthroughs and companion technical reading notes. You can watch step-by-step code demonstrations and copy reference snippets directly.',
    tags: ['learning', 'video', 'reading notes', 'delivery'],
  },
  {
    id: 'lrn-2',
    category: 'Learning Experience',
    question: 'Can I pause and resume lessons where I left off?',
    answer:
      'Yes. Guidexa automatically saves your playback timestamp and lesson completion state across all devices. When you return to a course, click "Resume Learning" to pick up exactly where you paused.',
    tags: ['learning', 'resume', 'playback', 'tracking'],
  },
  {
    id: 'lrn-3',
    category: 'Learning Experience',
    question: 'How is my learning progress tracked?',
    answer:
      'Your learning progress is tracked via real-time telemetry. You can view your completion percentage, completed lessons, pending assignments, and quiz scores directly on your Student Learning Portal.',
    tags: ['learning', 'progress', 'telemetry', 'completion'],
  },
  {
    id: 'lrn-4',
    category: 'Learning Experience',
    question: 'Can I access course materials on mobile devices?',
    answer:
      'Yes. The Guidexa learning platform is fully responsive and optimized for smartphones, tablets, laptops, and desktop computers.',
    tags: ['learning', 'mobile', 'responsive', 'tablet'],
  },

  // 6. Curriculum & Projects
  {
    id: 'cur-1',
    category: 'Curriculum & Projects',
    question: 'Will I build real projects during my course?',
    answer:
      'Yes. Hands-on projects are central to Guidexa pedagogy. Depending on your track, you will build full-stack web applications, RESTful APIs, relational databases, distributed systems, or AI-integrated software that reflect real industry standards.',
    tags: ['curriculum', 'projects', 'capstone', 'portfolio'],
  },
  {
    id: 'cur-2',
    category: 'Curriculum & Projects',
    question: 'Are source code and starter templates provided?',
    answer:
      'Yes. Lessons include links to starter code repositories, architectural diagrams, syntax cheatsheets, and downloadable references within the learning portal.',
    tags: ['curriculum', 'code', 'starter repo', 'resources'],
  },
  {
    id: 'cur-3',
    category: 'Curriculum & Projects',
    question: 'Is the curriculum updated for modern technologies?',
    answer:
      'Yes. Our curriculum is continually updated to match modern production environments, including Next.js 15, React 19, TypeScript, Node.js, Docker, and generative AI engineering tooling.',
    tags: ['curriculum', 'technologies', 'updates', 'modern stack'],
  },

  // 7. Assessments & Assignments
  {
    id: 'asm-1',
    category: 'Assessments & Assignments',
    question: 'How are quizzes and knowledge checks conducted?',
    answer:
      'Interactive quizzes are integrated throughout modules to test concept retention. Quizzes provide immediate grading, question explanations, and review attempts for self-evaluation.',
    tags: ['assessments', 'quizzes', 'tests', 'knowledge check'],
  },
  {
    id: 'asm-2',
    category: 'Assessments & Assignments',
    question: 'How are project assignments evaluated?',
    answer:
      'Course assignments are submitted directly through the student portal and evaluated by instructors against clear technical rubrics. You receive detailed feedback and marks on code structure, functionality, and best practices.',
    tags: ['assessments', 'assignments', 'evaluation', 'rubrics'],
  },
  {
    id: 'asm-3',
    category: 'Assessments & Assignments',
    question: 'Can I resubmit an assignment if I need to make improvements?',
    answer:
      'Yes. If an instructor requests revisions or if you want to improve your project based on feedback, our assignment system supports resubmission workflows to help you reach the required proficiency.',
    tags: ['assessments', 'resubmission', 'feedback', 'revisions'],
  },

  // 8. Certificates & Verification
  {
    id: 'cer-1',
    category: 'Certificates & Verification',
    question: 'What are the criteria to earn a certificate?',
    answer:
      'To earn an official Guidexa course completion certificate, students must achieve 100% curriculum completion, complete all module quizzes, and successfully pass evaluated project assignments.',
    tags: ['certificates', 'criteria', 'completion', 'eligibility'],
  },
  {
    id: 'cer-2',
    category: 'Certificates & Verification',
    question: 'How can employers verify my Guidexa certificate?',
    answer:
      'Every certificate features a tamper-resistant, cryptographically verifiable Certificate ID and a public verification link. Employers and recruiters can verify credential authenticity online at any time.',
    tags: ['certificates', 'verification', 'credential id', 'employers'],
  },
  {
    id: 'cer-3',
    category: 'Certificates & Verification',
    question: 'Can I share my certificate on LinkedIn and resumes?',
    answer:
      'Yes. You can download a high-resolution digital certificate and copy your unique verification link to add directly to your LinkedIn licenses & certifications profile or resume.',
    tags: ['certificates', 'linkedin', 'share', 'resume'],
  },

  // 9. Live Classes & Mentorship
  {
    id: 'liv-1',
    category: 'Live Classes & Mentorship',
    question: 'Are live interactive sessions available?',
    answer:
      'Yes. Many of our programs include scheduled live cohort classes, interactive Q&A workshops, and instructor-led architecture reviews to complement self-paced learning.',
    tags: ['live', 'classes', 'cohort', 'workshops'],
  },
  {
    id: 'liv-2',
    category: 'Live Classes & Mentorship',
    question: 'What happens if I miss a scheduled live class?',
    answer:
      'All live sessions are recorded and archived within your student learning portal alongside class notes and code files, allowing you to catch up anytime.',
    tags: ['live', 'recordings', 'replays', 'missed class'],
  },
  {
    id: 'liv-3',
    category: 'Live Classes & Mentorship',
    question: 'How can I ask questions and resolve doubts?',
    answer:
      'You can post questions in lesson-specific discussion boards where instructors and fellow cohort learners collaborate, or attend scheduled live doubt-clearing sessions.',
    tags: ['live', 'doubts', 'questions', 'discussions', 'forum'],
  },

  // 10. Account & Technical Issues
  {
    id: 'tec-1',
    category: 'Account & Technical Issues',
    question: 'What hardware or software do I need to learn?',
    answer:
      'You need a standard computer (Windows, macOS, or Linux) with at least 8 GB of RAM and a reliable internet connection. All necessary free development tools (VS Code, Node.js, Git) are introduced in step-by-step setup guides in your first module.',
    tags: ['technical', 'system requirements', 'hardware', 'software'],
  },
  {
    id: 'tec-2',
    category: 'Account & Technical Issues',
    question: 'What should I do if I encounter a login or technical issue?',
    answer:
      'You can reach out to our technical support team via the contact form on /contact or email us at support. If you forgot your password, use the "Forgot Password" link on the login page to securely reset your credentials.',
    tags: ['technical', 'login', 'support', 'password reset'],
  },
];
