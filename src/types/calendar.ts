export interface CalendarItem {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  title: string;
  link?: string | null;
  sourceAnnouncementId?: number | null;
}

export interface CreateCalendarDto {
  startDate: string;
  endDate: string;
  title: string;
  link: string;
}
