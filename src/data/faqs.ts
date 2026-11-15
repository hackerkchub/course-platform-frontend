export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES = [
  'All',
  'Admissions & Enrollment',
  'Courses & Curriculum',
  'Live Learning & Batches',
  'Pricing & Fees',
  'Certifications',
  'Career Support',
  'Technical Requirements',
  'Demo Classes',
] as const;

export type FAQCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_ITEMS: FAQItem[] = [
  // 1. Admissions & Enrollment
  {
    id: 'adm-1',
    category: 'Admissions & Enrollment',
    question: 'How do I enroll in a live engineering cohort?',
    answer:
      'You can browse our course catalog, choose a program, and click "Book Free Demo Class" or review upcoming batch dates. If a program is marked as Free, you can enroll instantly using your student account.',
  },
  {
    id: 'adm-2',
    category: 'Admissions & Enrollment',
    question: 'Are there any prerequisites before joining an advanced cohort?',
    answer:
      'Each course page details specific prerequisites under the "Prerequisites" section. Beginner programs require basic programming logic, whereas advanced tracks (such as Distributed Systems or Cloud DevOps) assume familiarity with fundamental data structures and web development basics.',
  },
  {
    id: 'adm-3',
    category: 'Admissions & Enrollment',
    question: 'Can I check my academic eligibility before enrolling?',
    answer:
      'Yes. Every course detail page includes an interactive "Check Eligibility" tool where you can input your current qualification and experience level to receive instant academic fit guidance.',
  },

  // 2. Courses & Curriculum
  {
    id: 'cur-1',
    category: 'Courses & Curriculum',
    question: 'How is the curriculum structured?',
    answer:
      'Curricula are divided into progressive modules comprising live interactive sessions, guided coding labs, and production capstone projects. You can view the complete module-by-module syllabus directly on each course page.',
  },
  {
    id: 'cur-2',
    category: 'Courses & Curriculum',
    question: 'Will I have access to recorded lectures if I miss a live class?',
    answer:
      'Yes. All live cohort sessions are recorded and uploaded to the student learning portal so you can review concepts at your own pace alongside class notes and repository code.',
  },
  {
    id: 'cur-3',
    category: 'Courses & Curriculum',
    question: 'Is the course material updated for recent technology versions?',
    answer:
      'Our curriculum is continuously maintained by veteran faculty to reflect production industry standards, including modern frameworks like Next.js 15, React 19, TypeScript, Docker, and cloud-native architectures.',
  },

  // 3. Live Learning & Batches
  {
    id: 'bat-1',
    category: 'Live Learning & Batches',
    question: 'What are the typical batch timings and schedules?',
    answer:
      'Cohorts are offered across weekday evening and weekend morning schedules designed for working professionals and university students. Specific class days and timings are published in the "Upcoming Cohort Schedules" section of each course page.',
  },
  {
    id: 'bat-2',
    category: 'Live Learning & Batches',
    question: 'What is the cohort batch size?',
    answer:
      'Batches maintain controlled seat limits to ensure direct interaction with the instructor, collaborative peer code reviews, and dedicated doubt-clearing time.',
  },

  // 4. Pricing & Fees
  {
    id: 'pri-1',
    category: 'Pricing & Fees',
    question: 'Are there any hidden charges or registration fees?',
    answer:
      'No. The published tuition fee is transparent and displayed clearly on each course page. Tax applicability (GST) is explicitly stated next to the tuition price.',
  },
  {
    id: 'pri-2',
    category: 'Pricing & Fees',
    question: 'Are free courses genuinely free?',
    answer:
      'Yes. Courses marked with the "FREE" badge provide 100% complimentary curriculum access to registered students without requiring any payment or credit card details.',
  },
  {
    id: 'pri-3',
    category: 'Pricing & Fees',
    question: 'Are flexible installment options available?',
    answer:
      'Selected cohorts offer installment milestones as configured by academic administration. You can discuss installment suitability directly with our academic counseling team via WhatsApp or telephone.',
  },

  // 5. Certifications
  {
    id: 'cer-1',
    category: 'Certifications',
    question: 'Will I receive a course completion certificate?',
    answer:
      'Students who complete all required modules, attend live cohort sessions, and successfully submit the capstone engineering project receive an official course completion certificate.',
  },
  {
    id: 'cer-2',
    category: 'Certifications',
    question: 'How can employers verify my certificate?',
    answer:
      'Certificates include a verifiable certificate ID accessible in your student learning portal under the Certifications tab.',
  },

  // 6. Career Support
  {
    id: 'car-1',
    category: 'Career Support',
    question: 'What career assistance does the platform provide?',
    answer:
      'Students receive portfolio architecture reviews, production-grade GitHub capstone guidance, and resume alignment sessions with faculty mentors to showcase practical engineering competence.',
  },
  {
    id: 'car-2',
    category: 'Career Support',
    question: 'Do you offer a guaranteed placement promise?',
    answer:
      'We focus on rigorous skills mastery, practical portfolio development, and interview preparation rather than making unverified 100% placement guarantees. Our instructors mentor you to meet actual engineering hiring standards.',
  },

  // 7. Technical Requirements
  {
    id: 'tec-1',
    category: 'Technical Requirements',
    question: 'What hardware and software do I need to attend classes?',
    answer:
      'You need a modern laptop or desktop computer (Windows, macOS, or Linux) with at least 8 GB RAM, a stable broadband internet connection, a webcam, and a microphone for interactive discussions. Instructions for installing code editors and runtime environments are provided before cohort start.',
  },
  {
    id: 'tec-2',
    category: 'Technical Requirements',
    question: 'Can I access the student portal on a mobile device or tablet?',
    answer:
      'Yes. The student portal, course syllabus, and lecture recordings are fully responsive and accessible across mobile phones, tablets, and desktop browsers.',
  },

  // 8. Demo Classes
  {
    id: 'dem-1',
    category: 'Demo Classes',
    question: 'How do I book a free demo session?',
    answer:
      'Navigate to the desired course page and click "Book Free Demo Class". Choose your preferred demo format (live session or recorded overview) and date. You will receive an instant confirmation reference number.',
  },
  {
    id: 'dem-2',
    category: 'Demo Classes',
    question: 'What happens during the demo class?',
    answer:
      'During the demo session, the faculty member reviews key industry tools, walks through a live coding demonstration, explains the cohort roadmap, and answers student questions.',
  },
];
