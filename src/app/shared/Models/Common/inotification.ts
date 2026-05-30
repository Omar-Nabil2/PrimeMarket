export interface Inotification {
id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readOn: string | null;
  createdOn: string;
}
