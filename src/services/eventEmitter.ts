// 这就是一个主流的正常的发布订阅模式
//  publish-subscribe pattern

type Events =
  | "loginRequired"
  | "updateTagConfig"
  | "updateUserConfig"
  | "userLogin";

type EventHandlerMap = {
  loginRequired: () => void;
  loading: (msg: string, duration: number) => void;
  updateTagConfig: (data: any) => void;
  updateUserConfig: (data: any) => void;
  userLogin: (res: any) => void;
};

class EventEmitter {
  private events: Partial<Record<Events, Set<(...args: any[]) => void>>> = {};

  emit<K extends Events>(event: K, ...args: Parameters<EventHandlerMap[K]>) {
    const listeners = this.events[event];
    if (listeners) {
      listeners.forEach((listener) => {
        listener(...args);
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
