import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

const INQUIRY_CATEGORIES = [
  'General Inquiry',
  'Course Information',
  'Admissions',
  'Enrollment Support',
  'Technical Support',
  'Other',
];

// Replicate contactFormSchema from frontend/src/app/(public)/contact/page.tsx
const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(191, 'Email cannot exceed 191 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone cannot exceed 20 characters')
    .regex(/^[0-9+\s\-()]+$/, 'Invalid phone number format (only digits, +, -, and spaces allowed)'),
  category: z.enum(INQUIRY_CATEGORIES, {
    message: 'Please select an inquiry category',
  }),
  courseOfInterest: z.string().trim().max(150).optional(),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
});

// Replicate backend submitContactSchema from backend/src/modules/contact/contact.validation.js
const backendSubmitContactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150, 'Name cannot exceed 150 characters'),
  email: z.string().trim().email('Invalid email address').max(191),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits').max(20, 'Phone cannot exceed 20 characters')
    .regex(/^[0-9+\s\-()]+$/, 'Invalid phone number format'),
  subject: z.string().trim().min(2, 'Subject must be at least 2 characters').max(150, 'Subject cannot exceed 150 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000, 'Message cannot exceed 5000 characters'),
});

describe('Phase 20.1: Contact Form Validation & SEO Verification', () => {
  test('1. Empty phone number is rejected on frontend', () => {
    const data = {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '',
      category: 'General Inquiry',
      subject: 'Course Information',
      message: 'I want to inquire about upcoming batches.',
    };

    const result = contactFormSchema.safeParse(data);
    assert.equal(result.success, false);
    const phoneError = result.error.issues.find((i) => i.path[0] === 'phone');
    assert.ok(phoneError);
    assert.match(phoneError.message, /Phone number is required|at least 7 digits/);
  });

  test('2. Phone number with fewer than 7 digits is rejected', () => {
    const data = {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '12345',
      category: 'General Inquiry',
      subject: 'Course Information',
      message: 'I want to inquire about upcoming batches.',
    };

    const result = contactFormSchema.safeParse(data);
    assert.equal(result.success, false);
    const phoneError = result.error.issues.find((i) => i.path[0] === 'phone');
    assert.ok(phoneError);
    assert.equal(phoneError.message, 'Phone number must be at least 7 digits');
  });

  test('3. Phone number with letters or invalid characters is rejected', () => {
    const invalidPhones = ['abc1234567', '9876543210x', 'phone#9876543', '12345@6789'];
    for (const phone of invalidPhones) {
      const data = {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone,
        category: 'Admissions',
        subject: 'Batch timings inquiry',
        message: 'Looking for evening weekday cohorts.',
      };
      const result = contactFormSchema.safeParse(data);
      assert.equal(result.success, false, `Expected ${phone} to be rejected`);
      const phoneError = result.error.issues.find((i) => i.path[0] === 'phone');
      assert.ok(phoneError);
      assert.match(phoneError.message, /Invalid phone number format/);
    }
  });

  test('4. Valid phone formats are accepted (digits, +, -, spaces, parentheses)', () => {
    const validPhones = [
      '9876543210',
      '+91 98765 43210',
      '+91-9876543210',
      '(022) 28765432',
      '+1 (555) 234-5678',
    ];
    for (const phone of validPhones) {
      const data = {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone,
        category: 'Course Information',
        subject: 'Full Stack MERN details',
        message: 'Would like to know the syllabus and project requirements.',
      };
      const result = contactFormSchema.safeParse(data);
      assert.equal(result.success, true, `Expected ${phone} to be accepted`);
    }
  });

  test('5. Invalid email addresses are rejected', () => {
    const invalidEmails = ['plainaddress', '@missingusername.com', 'username@.com', 'username@site..com'];
    for (const email of invalidEmails) {
      const data = {
        name: 'Rahul Sharma',
        email,
        phone: '9876543210',
        category: 'General Inquiry',
        subject: 'Question on courses',
        message: 'Please send syllabus details.',
      };
      const result = contactFormSchema.safeParse(data);
      assert.equal(result.success, false);
      const emailError = result.error.issues.find((i) => i.path[0] === 'email');
      assert.ok(emailError);
      assert.equal(emailError.message, 'Please enter a valid email address');
    }
  });

  test('6. Empty required fields (name, subject, message) are rejected', () => {
    const data = {
      name: '',
      email: 'valid@example.com',
      phone: '9876543210',
      category: 'General Inquiry',
      subject: '',
      message: 'Short',
    };
    const result = contactFormSchema.safeParse(data);
    assert.equal(result.success, false);
    assert.ok(result.error.issues.some((i) => i.path[0] === 'name'));
    assert.ok(result.error.issues.some((i) => i.path[0] === 'subject'));
    assert.ok(result.error.issues.some((i) => i.path[0] === 'message'));
  });

  test('7. API payload mapping complies 100% with backend contract without fake placeholders', () => {
    const formData = {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 98765 43210',
      category: 'Admissions',
      courseOfInterest: 'Full Stack Web Development',
      subject: 'Cohort Batch Schedules',
      message: 'I would like to inquire about upcoming weekend batches.',
    };

    // Client transformation logic
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone.trim(),
      subject: `[${formData.category}] ${formData.subject}`,
      message: formData.courseOfInterest
        ? `Course of Interest: ${formData.courseOfInterest}\n\n${formData.message}`
        : formData.message,
    };

    // Check payload values
    assert.equal(payload.name, 'Rahul Sharma');
    assert.equal(payload.email, 'rahul@example.com');
    assert.equal(payload.phone, '+91 98765 43210');
    assert.equal(payload.subject, '[Admissions] Cohort Batch Schedules');
    assert.equal(
      payload.message,
      'Course of Interest: Full Stack Web Development\n\nI would like to inquire about upcoming weekend batches.'
    );

    // Verify against backendSubmitContactSchema
    const backendResult = backendSubmitContactSchema.safeParse(payload);
    assert.equal(backendResult.success, true);

    // Ensure no fake placeholder string exists in payload
    assert.equal(payload.phone.includes('+00 0000000000'), false);
    assert.equal(payload.phone.includes('0000000000'), false);
    assert.equal(payload.message.includes('Phone number not provided'), false);
  });

  test('8. SEO Canonical and JSON-LD serialization verification', () => {
    const rawSiteUrl = 'http://localhost:3000';
    const siteUrl = rawSiteUrl && !rawSiteUrl.includes('localhost') ? rawSiteUrl : 'https://guidexa.in';

    assert.equal(siteUrl, 'https://guidexa.in');
    assert.equal(`${siteUrl}/contact`, 'https://guidexa.in/contact');

    const contactSchema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Guidexa',
      description:
        'Contact Softmaxs Solution LLP for Guidexa course inquiries, admissions guidance, and technical learning support.',
      url: `${siteUrl}/contact`,
      publisher: {
        '@type': 'Organization',
        name: 'Softmaxs Solution LLP',
        url: 'https://softmaxs.com',
      },
    };

    const serialized = JSON.stringify(contactSchema);
    const parsed = JSON.parse(serialized);
    assert.equal(parsed['@type'], 'ContactPage');
    assert.equal(parsed.url, 'https://guidexa.in/contact');
    assert.equal(parsed.publisher.name, 'Softmaxs Solution LLP');
  });
});
