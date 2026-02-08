export enum CISSPDomain {
  SecurityAndRiskManagement = "Security and Risk Management",
  AssetSecurity = "Asset Security",
  SecurityArchitectureAndEngineering = "Security Architecture and Engineering",
  CommunicationAndNetworkSecurity = "Communication and Network Security",
  IdentityAndAccessManagement = "Identity and Access Management (IAM)",
  SecurityAssessmentAndTesting = "Security Assessment and Testing",
  SecurityOperations = "Security Operations",
  SoftwareDevelopmentSecurity = "Software Development Security"
}

export enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard"
}

export interface FlashcardData {
  id: string;
  domain: string;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
  difficulty: Difficulty;
}

export interface QuestionBatchResponse {
  questions: FlashcardData[];
}

export interface UserAnswer {
  questionId: string;
  domain: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timestamp: number;
}
