export interface Announcement {
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
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

export interface RequestAnnouncementDto {
  title: string;
  writer: string;
  content: string;
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
