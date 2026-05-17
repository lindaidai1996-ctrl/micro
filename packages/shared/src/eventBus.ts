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

const eventBus = new EventBus()

export { eventBus, EventBus }
