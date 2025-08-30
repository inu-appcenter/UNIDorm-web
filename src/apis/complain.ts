// 민원 삭제
import tokenInstance from "./tokenInstance.ts";
import { AxiosResponse } from "axios";
import {
  ComplaintCreateDto,
  ComplaintDetail,
  ComplaintResponse,
  MyComplaint,
} from "../types/complain.ts";

export const deleteComplaint = async (
  complaintId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    `/complaints/${complaintId}`,
  );
  console.log(response);
  return response;
};

// 민원 상세 조회
export const getComplaintDetail = async (
  complaintId: number,
): Promise<AxiosResponse<ComplaintDetail>> => {
  const response = await tokenInstance.get<ComplaintDetail>(
    `/complaints/${complaintId}`,
  );
  console.log(response);
  return response;
};

// 내 민원 목록 조회 (최신순)
export const getMyComplaints = async (): Promise<
  AxiosResponse<MyComplaint[]>
> => {
  const response = await tokenInstance.get<MyComplaint[]>(`/complaints`);
  console.log(response);
  return response;
};

// 민원 등록
export const createComplaint = async (
  dto: ComplaintCreateDto,
  files?: File[],
): Promise<AxiosResponse<ComplaintResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file));
  }

  const response = await tokenInstance.post<ComplaintResponse>(
    `/complaints`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  console.log(response);
  return response;
};

// 민원 수정
export const updateComplaint = async (
  complaintId: number,
  dto: ComplaintCreateDto,
  files?: File[],
): Promise<AxiosResponse<ComplaintResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file));
  }

  const response = await tokenInstance.put<ComplaintResponse>(
    `/complaints/${complaintId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  console.log(response);
  return response;
};
