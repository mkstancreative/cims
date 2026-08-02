// Create Log Book
export type CreateLogBookActivity = {
  date: string;
  dayOfWeek: string;
  activity: string;
  description: string;
  hoursSpent: number;
  skillsUsed: string[];
};

export interface CreateLogBookPayload {
  weekNumber: number;
  title: string;
  activities: CreateLogBookActivity[];
  challengesFaced?: string;
  lessonsLearned?: string;
  nextWeekPlan?: string;
}

// Update Log Book
export type UpdateLogBookActivity = {
  date: string;
  dayOfWeek: string;
  activity: string;
  description: string;
  hoursSpent: number;
  skillsUsed: string[];
};

export interface UpdateLogBookPayload {
  id: string;
  weekNumber: number;
  title: string;
  activities: UpdateLogBookActivity[];
  challengesFaced?: string;
  lessonsLearned?: string;
  nextWeekPlan?: string;
}

// Get Log Books
export interface LogBook {
  _id: string;
  weekNumber: number;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  createdAt: string;
  totalHours: number;
}

export interface GetLogBooksResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: LogBook[];
}

// Get Log Book By Id
export interface LogBookActivity {
  _id: string;
  date: string;
  activity: string;
  description: string;
  hoursSpent: number;
  skillsUsed: string[];
}

export interface LogBookDetails {
  _id: string;
  student: string;
  weekNumber: number;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  activities: LogBookActivity[];
  challengesFaced: string;
  lessonsLearned: string;
  nextWeekPlan: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  aiFraudScore: number;
  createdAt: string;
  updatedAt: string;
  totalHours: number;
  __v: number;
}

export interface GetLogBookByIdResponse {
  success: boolean;
  data: LogBookDetails;
}

// Submit Log Book
export type SubmitLogBookResponse = {
  success: boolean;
  message: string;
};

// Manual LogBook Request
export interface ManualLogbookApprovalResponse {
  success: boolean;
  message: string;
  data: {
    sent: boolean;
    message: string;
    supervisorEmail: string;
    expiresIn: string;
  };
}

// Delete Log Book
export type DeleteLogBookResponse = {
  success: boolean;
  message: string;
};

// Update Student Profile
export interface Guarantor {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface UpdateStudentProfilePayload {
  phone: string;
  guarantor: Guarantor;
}

// Upload Passport
export interface UploadPassportPayload {
  photo: File;
}

// Student Weekly Progress
export interface StudentWeeklyProgress {
  itStatus:
    | "active"
    | "completed"
    | "inactive"
    | "seeking_placement"
    | "pending_verification"
    | "placed";
  weeksCompleted: number;
  daysRemaining: number;
  totalWeeks: number;
  progressPercent: number;
  logbooksSubmitted: number;
  logbooksApproved: number;
  missedWeeks: number[];
  minimumRequired: number;
  meetsRequirement: boolean;
}

export interface GetStudentWeeklyProgressResponse {
  success: boolean;
  data: StudentWeeklyProgress;
}

// FMC progress endpoint (/students/progress) — alias kept stable for consumers.
export type StudentProgress = StudentWeeklyProgress;
export type GetStudentProgressResponse = GetStudentWeeklyProgressResponse;

// Confirm Placement for Company
export interface ConfirmPlacementPayload {
  acceptanceLetter: File;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState?: string;
  companyPhone?: string;
  companyEmail?: string;
  industry?: string;
  position: string;
  department?: string;
  startDate: string;
  supervisorName: string;
  supervisorPhone?: string;
  supervisorEmail?: string;
  supervisorPosition?: string;
  companyType?: "private" | "public" | "ngo" | "government" | "other";
}

// View Placement Status
export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
}

export interface Company {
  _id: string;
  companyName: string;
  phone: string;
  verificationStatus: "pending" | "verified" | "rejected";
  address: CompanyAddress;
}

export interface Placement {
  position: string;
  department: string;
  startDate: string;
  acceptanceLetterUrl: string;
  status: "pending" | "verified" | "rejected";
  company: Company;
}

export interface IndustrialSupervisor {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface SchoolSupervisorUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SchoolSupervisor {
  _id: string;
  user: SchoolSupervisorUser;
  staffId: string;
  department: string;
  specialization: string;
}

export interface Supervisors {
  industrial: IndustrialSupervisor;
  school: SchoolSupervisor;
}

export interface ITPeriod {
  startDate: string;
  endDate: string;
  expectedDuration: number;
}

export interface PlacementStatusData {
  itStatus:
    | "active"
    | "completed"
    | "inactive"
    | "seeking_placement"
    | "pending_verification"
    | "placed";
  placement: Placement;
  supervisors: Supervisors;
  itPeriod: ITPeriod;
}

export interface ViewPlacementStatusResponse {
  success: boolean;
  data: PlacementStatusData;
}

// ── Report Types ────────────────────────────────────────────────────────────

export interface TechnicalSkill {
  _id: string;
  skill: string;
  proficiency: string;
  evidence: string[];
  weeksUsed: number;
}

export interface SoftSkill {
  _id: string;
  skill: string;
  evidence: string[];
}

export interface SkillsAnalysis {
  technicalSkills: TechnicalSkill[];
  softSkills: SoftSkill[];
}

export interface ProfessionalGrowth {
  summary: string;
  keyAreas: string[];
  recommendations: string[];
}

export interface AiScoreBreakdown {
  logbookQuality: number;
  logbookConsistency: number;
  technicalSkills: number;
  professionalGrowth: number;
  challengesOvercome: number;
  communication: number;
}

export interface AiScore {
  breakdown: AiScoreBreakdown;
  total: number;
  grade: string;
  reasoning: string[];
}

export interface WeeklySummary {
  _id: string;
  weekNumber: number;
  title: string;
  summary: string;
  keyLearnings: string[];
  hoursSpent: number;
}

export interface ChallengeAnalysis {
  _id: string;
  weekNumber: number;
  challenge: string;
  solution: string;
  outcome: string;
}

export interface StudentReport {
  _id: string;
  student: string;
  status: string;
  executiveSummary: string;
  conclusion: string;
  generatedAt: string;
  totalHoursLogged: number;
  totalWeeksCompleted: number;
  uniqueSkillsUsed: number;
  skillsAnalysis: SkillsAnalysis;
  professionalGrowth: ProfessionalGrowth;
  aiScore: AiScore;
  weeklySummaries: WeeklySummary[];
  challengesAnalysis: ChallengeAnalysis[];
  createdAt: string;
  updatedAt: string;
}

export interface GetStudentReportResponse {
  success: boolean;
  message: string;
  data: StudentReport;
}

// Preview AI Score
export interface AiPreviewData {
  currentLogbooks: number;
  predictedScore: number;
  predictedGrade: string;
  breakdown: AiScoreBreakdown;
  reasoning: string[];
  disclaimer: string;
}

export interface PreviewAiScoreResponse {
  success: boolean;
  message: string;
  data: AiPreviewData;
  // Populated when success === false (not enough logbooks)
  currentLogbooks?: number;
  required?: number;
}

// AI Analyze Skills
export interface SkillCount {
  skill: string;
  count: number;
}

export interface AiSkillsData {
  totalSkills: number;
  skillsByFrequency: SkillCount[];
  topSkills: SkillCount[];
  emergingSkills: SkillCount[];
  totalHoursSpent: number;
  totalWeeks: number;
  consistencyScore: number;
}

export interface AiAnalyzeSkillsResponse {
  success: boolean;
  data: AiSkillsData;
}
