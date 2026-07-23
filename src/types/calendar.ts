export interface CalendarItem {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  title: string;
  link: string;
  sourceAnnouncementId?: number;
}

export interface CreateCalendarDto {
  startDate: string;
  endDate: string;
  title: string;
  link: string;
}
