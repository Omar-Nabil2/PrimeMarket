import { Inotification } from "./inotification";

export interface INotificationSummary {
  notifications: Inotification[];
  unreadCount: number;
}
