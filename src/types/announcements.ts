import {
  ANNOUNCE_CATEGORY_LIST,
  ANNOUNCE_SUB_CATEGORY_LIST,
} from "@/constants/announcement";

import type {
  AnnounceType,
  AnnounceSubCategory,
} from "@/constants/announcement";

export interface Announcement {
  type: (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"];
  category: (typeof ANNOUNCE_SUB_CATEGORY_LIST)[number]["value"];

  viewCount: number;
  emergency: boolean;
  content: string;
  id: number;
  title: string;
  createdDate: string;
  updatedDate: string;
}

export interface AnnouncementPost {
  id: number;
  category: AnnounceSubCategory; //"ALL",
  type: AnnounceType; //"ALL",
  title: string; //"기숙사 공지사항",
  content: string; //"기숙사 생활 관련 중요한 공지사항입니다. 자세한 내용은...",
  createdDate: string; //"2026-01-27T15:43:50.935Z",
  updatedDate: string; //"2026-01-27T15:43:50.935Z",
  viewCount: number;
  emergency: boolean;
}

export interface AnnouncementDetail {
  announcementType: (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"];
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
