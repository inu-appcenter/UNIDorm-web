import { ANNOUNCE_SUB_CATEGORY_LIST } from "../constants/announcement.ts";

export interface Announcement {
  announcementType: string;
  viewCount: number;
  emergency: boolean;
  content: string;
  id: number;
  title: string;
  createdDate: string;
  updatedDate: string;
}

export interface AnnouncementDetail {
  announcementType: string;
  emergency: boolean;

  id: number;
  title: string;
  writer: string;
  content: string;
  viewCount: number;
  createdDate: string;
  updatedDate: string;
  link?: string;
}

export interface AnnouncementFile {
  filePath: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

export interface RequestAnnouncementDto {
  category: (typeof ANNOUNCE_SUB_CATEGORY_LIST)[number]["value"];
  title: string;
  writer: string;
  content: string;
  isEmergency: boolean;
}

export interface AnnouncementUpdateRequest {
  title: string;
  writer: string;
  content: string;
}

export interface AnnouncementUpdateResponse {
  id: number;
  title: string;
  createdDate: string;
  updatedDate: string;
}

export interface AnnouncementResponse {
  id: number;
  title: string;
  content: string;
  createdDate: string;
  updatedDate: string;
  viewCount: number;
  emergency: boolean;
}
