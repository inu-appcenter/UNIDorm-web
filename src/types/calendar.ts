export interface CalendarItem {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  title: string;
  link: string;
}

export interface CreateCalendarDto {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  title: string;
  link: string;
}
