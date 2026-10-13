// 这就是一个主流的正常的发布订阅模式
//  publish-subscribe pattern

import type { ContentTag, ResultOf, Users } from '../pl-serve-type-main/type/main'

type Events =
  | 'loginRequired'
  | 'updateTagConfig'
  | 'updateUserConfig'
  | 'notificationUnreadChanged'
  | 'userLogin'

type EventHandlerMap = {
  loginRequired: () => void
  updateTagConfig: (data: ContentTag[]) => void
  updateUserConfig: (data: Record<string, unknown>) => void
  notificationUnreadChanged: (hasUnread: boolean) => void
  userLogin: (res: ResultOf<Users['Authenticate']>) => void
}

class EventEmitter {
  private events: Partial<Record<Events, Set<EventHandlerMap[Events]>>> = {}

  private getListeners<K extends Events>(event: K) {
    return this.events[event] as Set<EventHandlerMap[K]> | undefined
  }

  emit<K extends Events>(event: K, ...args: Parameters<EventHandlerMap[K]>): void {
    this.getListeners(event)?.forEach((listener) => {
      const handler = listener as (...handlerArgs: Parameters<EventHandlerMap[K]>) => void
      handler(...args)
    })
  }

  on<K extends Events>(event: K, listener: EventHandlerMap[K]): () => void {
    let listeners = this.getListeners(event)
    if (!listeners) {
      listeners = new Set()
      this.events[event] = listeners as Set<EventHandlerMap[Events]>
    }
    listeners.add(listener)
    return () => this.off(event, listener)
  }

  off<K extends Events>(event: K, listener: EventHandlerMap[K]): void {
    const listeners = this.getListeners(event)
    listeners?.delete(listener)
    if (listeners?.size === 0) delete this.events[event]
  }
}

const Emitter = new EventEmitter()

export default Emitter
