export interface CalendarItem {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  link: string;
  description?: string;
  sourceAnnouncementId?: number;
}

export interface CreateCalendarDto {
  startDate: string;
  endDate: string;
  title: string;
  link: string;
}
