// --- Enums / Literal Types ---

/** 질문 유형 (객관식, 주관식) */
export type QuestionType = "MULTIPLE_CHOICE" | "SHORT_ANSWER";

// --- Base Entities (GET 응답 기준) ---

/**
 * 설문 질문의 개별 선택지 (GET /surveys/{surveyId})
 */
export interface QuestionOption {
  id: number;
  optionText: string;
  optionOrder: number;
}

/**
 * 설문의 개별 질문 (GET /surveys/{surveyId})
 */
export interface SurveyQuestion {
  id: number;
  questionText: string;
  questionType: QuestionType;
  questionOrder: number;
  allowMultipleSelection: boolean;
  required: boolean; // GET 응답 스키마 기준
  options: QuestionOption[];
}

/**
 * 설문 목록 조회의 개별 설문 정보 (GET /surveys)
 */
export interface SurveySummary {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  startDate: string;
  endDate: string;
  createdDate: string;
  totalResponses: number;
  closed: boolean;
}

/**
 * 설문 상세 조회 정보 (GET /surveys/{surveyId})
 */
export interface SurveyDetail extends SurveySummary {
  questions: SurveyQuestion[];
}

// --- Result/Statistics Types (GET /surveys/{surveyId}/results) ---

/**
 * 객관식 질문의 선택지별 통계
 */
export interface OptionResult {
  optionId: number;
  optionText: string;
  count: number;
  percentage: number;
}

/**
 * 개별 질문의 결과 통계
 */
export interface QuestionResult {
  questionId: number;
  questionText: string;
  questionType: string; // 명세에 "string"으로 되어 있음
  optionResults: OptionResult[];
  shortAnswers: string[];
}

/**
 * 설문 전체 결과/통계 (GET /surveys/{surveyId}/results)
 */
export interface SurveyResults {
  surveyId: number;
  surveyTitle: string;
  totalResponses: number;
  questionResults: QuestionResult[];
}

// --- Request DTOs (POST/PUT 요청 바디) ---

/**
 * 설문 생성 시 개별 선택지 (POST /surveys)
 */
export interface OptionCreateRequest {
  optionText: string;
  optionOrder: number;
}

/**
 * 설문 생성 시 개별 질문 (POST /surveys)
 */
export interface QuestionCreateRequest {
  questionText: string;
  questionType: QuestionType;
  questionOrder: number;
  isRequired: boolean; // POST 요청 스키마 기준
  allowMultipleSelection: boolean;
  options: OptionCreateRequest[];
}

/**
 * 설문 생성 요청 DTO (POST /surveys)
 */
export interface SurveyCreateRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  questions: QuestionCreateRequest[];
}

/**
 * 설문 수정 요청 DTO (PUT /surveys/{surveyId})
 * (명세상 SurveyCreateRequest와 동일)
 */
export type SurveyUpdateRequest = SurveyCreateRequest;

/**
 * 설문 답변 제출 시 개별 답변 (POST /surveys/responses)
 */
export interface AnswerRequest {
  questionId: number;
  optionIds: number[];
  answerText: string | null;
}

/**
 * 설문 답변 제출 요청 DTO (POST /surveys/responses)
 */
export interface SurveyResponseRequest {
  surveyId: number;
  answers: AnswerRequest[];
}

// --- API Response Types ---

/**
 * 설문 생성 API 응답 (생성된 설문 ID)
 */
export type CreateSurveyResponse = number;

/**
 * 설문 답변 제출 API 응답 (제출된 응답 ID)
 */
export type SubmitSurveyResponse = number;
