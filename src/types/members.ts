export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  name: string;
  studentNumber: string;
  dormType: string;
  college: string;
  penalty: number;
  hasTimeTableImage: boolean;
  roommateCheckList: boolean;
  id: number;
  isAdmin: boolean;
}

export interface MyPost {
  id: number;
  title: string;
  type: string;
  createDate: string;
  filePath: string;
}
