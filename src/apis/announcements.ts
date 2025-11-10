import { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance.ts";
import {
  Announcement,
  AnnouncementDetail,
  AnnouncementFile,
  AnnouncementResponse,
  AnnouncementUpdateRequest,
  AnnouncementUpdateResponse,
  RequestAnnouncementDto,
} from "../types/announcements.ts";
import axiosInstance from "./axiosInstance.ts";
import { ManagedFile } from "../hooks/useFileHandler.ts";

/**
 * 모든 공지사항을 조회합니다.
 *
 * @param type 공지사항 작성 주체 (DORMITORY, UNI_DORM, SUPPORTERS)
 * @param category 공지사항 카테고리 (ALL, LIFE_GUIDANCE, FACILITY, EVENT_LECTURE, BTL_DORMITORY, MOVE_IN_OUT, ETC)
 * @param search 검색어 (옵션)
 */
export const getAnnouncements = async (
  type: string = "DORMITORY",
  category: string = "ALL",
  search?: string,
): Promise<AxiosResponse<Announcement[]>> => {
  const params: Record<string, string> = { type, category };
  if (search) params.search = search;

  return await axiosInstance.get("/announcements", { params });
};

export const getAnnouncementDetail = async (
  announcementId: number,
): Promise<AxiosResponse<AnnouncementDetail>> => {
  return await axiosInstance.get(`/announcements/${announcementId}`);
};

export const getAnnouncementFiles = async (
  announcementId: number,
): Promise<AxiosResponse<AnnouncementFile[]>> => {
  return await axiosInstance.get(`/announcements/${announcementId}/image`);
};

export const createAnnouncement = async (
  data: RequestAnnouncementDto,
  files?: ManagedFile[],
): Promise<AxiosResponse<void>> => {
  const formData = new FormData();

  formData.append(
    "requestAnnouncementDto",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", file.file);
    });
  }

  return await tokenInstance.post("/announcements", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateAnnouncement = async (
  announcementId: number,
  data: AnnouncementUpdateRequest,
): Promise<AxiosResponse<AnnouncementUpdateResponse>> => {
  return await tokenInstance.put(`/announcements/${announcementId}`, data);
};

export const updateAnnouncementWithFiles = async (
  announcementId: number,
  data: RequestAnnouncementDto,
  files?: ManagedFile[],
): Promise<AxiosResponse<AnnouncementResponse>> => {
  const formData = new FormData();

  formData.append(
    "requestAnnouncementDto",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", file.file);
    });
  }

  return await tokenInstance.put(
    `/announcements/${announcementId}/with-files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export const deleteAnnouncement = async (
  announcementId: number,
): Promise<AxiosResponse<void>> => {
  return await tokenInstance.delete(`/announcements/${announcementId}`);
};
export const deleteAnnouncementFile = async (
  announcementId: number,
  filePath: string,
): Promise<AxiosResponse<void>> => {
  return await tokenInstance.delete(`/announcements/${announcementId}/file`, {
    params: { filePath },
  });
};
