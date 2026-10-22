export type PageBgType = "white" | "gray";

export interface RouteHandle {
  bg?: PageBgType;
  title?: string;
  [key: string]: unknown;
}
