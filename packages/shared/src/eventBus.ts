type EventCallback = (...args: any[]) => void

class EventBus {
  private events = new Map<string, Set<EventCallback>>()
  private pending = new Map<string, any[][]>()

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)
    // 回放未消费的消息
    const queued = this.pending.get(event)
    if (queued) {
      queued.forEach((args) => callback(...args))
      this.pending.delete(event)
    }
  }

  off(event: string, callback: EventCallback) {
    this.events.get(event)?.delete(callback)
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event)
    if (listeners && listeners.size > 0) {
      listeners.forEach((cb) => cb(...args))
    } else {
      // 无监听者时暂存消息
      if (!this.pending.has(event)) {
        this.pending.set(event, [])
      }
      this.pending.get(event)!.push(args)
    }
  }

  clear(event?: string) {
    if (event) {
      this.events.delete(event)
      this.pending.delete(event)
    } else {
      this.events.clear()
      this.pending.clear()
    }
  }
}

const GLOBAL_KEY = '__MICRO_EVENT_BUS__'

function getEventBus(): EventBus {
  // 绕过 qiankun proxy sandbox，直接访问真实 window
  const rawWindow = (Function('return window')() as any)
  if (!rawWindow[GLOBAL_KEY]) {
    rawWindow[GLOBAL_KEY] = new EventBus()
  }
  return rawWindow[GLOBAL_KEY]
}

const eventBus: EventBus = getEventBus()

export { eventBus, EventBus }
