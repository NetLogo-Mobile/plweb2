import Emitter from "./eventEmitter";

import type { Statistic } from "../pl-serve-type-main/type/main";

let hasUnreadNotification = false;

export function hasUnreadNotifications() {
  return hasUnreadNotification;
}

export function updateNotificationUnread(statistic?: Statistic | null) {
  const unreadMessages = statistic?.UnreadMessages ?? 0;
  const unreadLetters = statistic?.UnreadLetters ?? 0;
  setNotificationUnread(unreadMessages > 0 || unreadLetters > 0);
}

export function clearNotificationUnread() {
  setNotificationUnread(false);
}

function setNotificationUnread(hasUnread: boolean) {
  if (hasUnreadNotification === hasUnread) return;
  hasUnreadNotification = hasUnread;
  Emitter.emit("notificationUnreadChanged", hasUnreadNotification);
}
