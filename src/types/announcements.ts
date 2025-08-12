export interface Announcement {
  viewCount: number;
  emergency: boolean;
  content: string;
  id: number;
  title: string;
  createdDate: string;
  updatedDate: string;
}

export interface AnnouncementDetail {
  id: number;
  title: string;
  writer: string;
  content: string;
  viewCount: number;
  createdDate: string;
  updatedDate: string;
}

export interface AnnouncementFile {
  filePath: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

export interface RequestAnnouncementDto {
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
