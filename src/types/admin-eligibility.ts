export type QualificationLevel =
  | 'any'
  | '10th'
  | '12th'
  | 'diploma'
  | 'graduate'
  | 'post_graduate';

export type ExperienceRequirement = 'fresher_allowed' | 'experience_required';

export interface CustomQuestionConfig {
  key: string;
  question: string;
  field_type: 'text' | 'select' | 'radio' | 'number';
  options?: string[];
  required: boolean;
  correct_answers?: string[];
}

export interface EligibilityRulesData {
  course_id?: number;
  eligibility_enabled: boolean;
  minimum_qualification?: QualificationLevel | null;
  minimum_percentage?: number | null;
  eligible_streams?: string[] | null;
  minimum_age?: number | null;
  maximum_age?: number | null;
  required_skills?: string[] | null;
  experience_required?: ExperienceRequirement | null;
  custom_questions?: CustomQuestionConfig[] | null;
  disclaimer?: string | null;
}

export interface EligibilityCheckItem {
  id: number;
  course_id: number;
  course_name?: string;
  user_id: number;
  student_name?: string;
  student_email?: string;
  is_eligible: boolean;
  score?: number | null;
  reasons?: string[] | null;
  answers: Record<string, unknown>;
  created_at: string;
}

export interface EligibilityChecksFilterParams {
  page?: number;
  limit?: number;
  result?: 'eligible' | 'not_eligible';
}
