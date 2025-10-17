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

export const getAnnouncements = async (): Promise<
  AxiosResponse<Announcement[]>
> => {
  return await axiosInstance.get("/announcements");
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
