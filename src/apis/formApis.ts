import { AxiosResponse } from "axios";
import {
  CreateSurveyResponse,
  SubmitSurveyResponse,
  SurveyCreateRequest,
  SurveyDetail,
  SurveyResponseRequest,
  SurveyResults,
  SurveySummary,
  SurveyUpdateRequest,
} from "../types/formTypes";
import tokenInstance from "./tokenInstance";

//
// ---------------- Admin API (관리자) ----------------
//

/**
 * 설문 생성 (관리자)
 * POST /surveys
 */
export const createSurvey = async (
  surveyData: SurveyCreateRequest,
): Promise<AxiosResponse<CreateSurveyResponse>> => {
  const response = await tokenInstance.post<CreateSurveyResponse>(
    `/surveys`,
    surveyData,
  );
  console.log("POST /surveys", response);
  return response;
};

/**
 * 설문 수정 (관리자)
 * PUT /surveys/{surveyId}
 */
export const updateSurvey = async (
  surveyId: number,
  surveyData: SurveyUpdateRequest,
): Promise<AxiosResponse<unknown>> => {
  // 200 OK, 응답 바디 명세 없음
  const response = await tokenInstance.put<unknown>(
    `/surveys/${surveyId}`,
    surveyData,
  );
  console.log(`PUT /surveys/${surveyId}`, response);
  return response;
};

/**
 * 설문 삭제 (관리자)
 * DELETE /surveys/{surveyId}
 */
export const deleteSurvey = async (
  surveyId: number,
): Promise<AxiosResponse<void>> => {
  // 204 No Content
  const response = await tokenInstance.delete<void>(`/surveys/${surveyId}`);
  console.log(`DELETE /surveys/${surveyId}`, response);
  return response;
};

/**
 * 설문 종료 (관리자)
 * PATCH /surveys/{surveyId}/close
 */
export const closeSurvey = async (
  surveyId: number,
): Promise<AxiosResponse<unknown>> => {
  // 200 OK, 응답 바디 명세 없음
  const response = await tokenInstance.patch<unknown>(
    `/surveys/${surveyId}/close`,
  );
  console.log(`PATCH /surveys/${surveyId}/close`, response);
  return response;
};

/**
 * 설문 결과/통계 조회 (관리자)
 * GET /surveys/{surveyId}/results
 */
export const getSurveyResults = async (
  surveyId: number,
): Promise<AxiosResponse<SurveyResults>> => {
  const response = await tokenInstance.get<SurveyResults>(
    `/surveys/${surveyId}/results`,
  );
  console.log(`GET /surveys/${surveyId}/results`, response);
  return response;
};

//
// ---------------- Common/User API (공용/사용자) ----------------
//

/**
 * 모든 설문 조회
 * GET /surveys
 */
export const getAllSurveys = async (): Promise<
  AxiosResponse<SurveySummary[]>
> => {
  const response = await tokenInstance.get<SurveySummary[]>(`/surveys`);
  console.log("GET /surveys", response);
  return response;
};

/**
 * 설문 상세 조회
 * GET /surveys/{surveyId}
 */
export const getSurveyDetail = async (
  surveyId: number,
): Promise<AxiosResponse<SurveyDetail>> => {
  const response = await tokenInstance.get<SurveyDetail>(
    `/surveys/${surveyId}`,
  );
  console.log(`GET /surveys/${surveyId}`, response);
  return response;
};

/**
 * 설문 답변 제출 (사용자)
 * POST /surveys/responses
 */
export const submitSurveyResponse = async (
  responseData: SurveyResponseRequest,
): Promise<AxiosResponse<SubmitSurveyResponse>> => {
  const response = await tokenInstance.post<SubmitSurveyResponse>(
    `/surveys/responses`,
    responseData,
  );
  console.log("POST /surveys/responses", response);
  return response;
};
