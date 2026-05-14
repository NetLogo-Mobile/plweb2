// 这就是一个主流的正常的发布订阅模式
//  publish-subscribe pattern

import type {
  ContentTag,
  ResultOf,
  Users,
} from "../pl-serve-type-main/type/main";

type Events =
  | "loginRequired"
  | "updateTagConfig"
  | "updateUserConfig"
  | "notificationUnreadChanged"
  | "userLogin";

type EventHandlerMap = {
  loginRequired: () => void;
  updateTagConfig: (data: ContentTag[]) => void;
  updateUserConfig: (data: Record<string, unknown>) => void;
  notificationUnreadChanged: (hasUnread: boolean) => void;
  userLogin: (res: ResultOf<Users["Authenticate"]>) => void;
};

class EventEmitter {
  private events: Partial<Record<Events, Set<EventHandlerMap[Events]>>> = {};

  emit<K extends Events>(event: K, ...args: Parameters<EventHandlerMap[K]>) {
    const listeners = this.events[event];
    if (listeners) {
      listeners.forEach((listener) => {
        (listener as any)(...args);
      });
    }
  }

  on<K extends Events>(event: K, listener: EventHandlerMap[K]) {
    if (!this.events[event]) {
      this.events[event] = new Set();
    }
    this.events[event]?.add(listener);
  }

  off<K extends Events>(event: K, listener: EventHandlerMap[K]) {
    const listeners = this.events[event];
    if (listeners) {
      listeners.delete(listener);
    }
  }
}

const Emitter = new EventEmitter();

export default Emitter;
