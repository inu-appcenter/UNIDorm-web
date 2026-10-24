import { useQuery } from "@tanstack/react-query";
import {
  getAllSurveys,
  getSurveyDetail,
  getSurveyResults,
} from "@/apis/formApis";

export const surveyKeys = {
  all: ["surveys"] as const,
  list: () => ["surveys", "list"] as const,
  detail: (id: number) => ["surveys", "detail", id] as const,
  results: (id: number) => ["surveys", "results", id] as const,
};

/** 설문(폼) 목록. */
export const useSurveys = () =>
  useQuery({
    queryKey: surveyKeys.list(),
    queryFn: async () => (await getAllSurveys()).data,
  });

/** 설문 상세 (질문 목록 포함). */
export const useSurveyDetail = (id: number | undefined) =>
  useQuery({
    queryKey: surveyKeys.detail(id ?? 0),
    queryFn: async () => (await getSurveyDetail(id!)).data,
    enabled: !!id,
  });

/** 관리자: 설문 응답 결과. */
export const useSurveyResults = (id: number | undefined) =>
  useQuery({
    queryKey: surveyKeys.results(id ?? 0),
    queryFn: async () => (await getSurveyResults(id!)).data,
    enabled: !!id,
  });
