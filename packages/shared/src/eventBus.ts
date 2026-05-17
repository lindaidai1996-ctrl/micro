type EventCallback = (...args: any[]) => void

class EventBus {
  private events = new Map<string, Set<EventCallback>>()

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)
  }

  off(event: string, callback: EventCallback) {
    this.events.get(event)?.delete(callback)
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach((cb) => cb(...args))
  }

  clear(event?: string) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
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
