
export type EventHandler<T> = (customProps?: T) => void;
export type EventHandlerOptions = {
  once?: boolean;
  called?: boolean;
}

export class MyEventEmitter<EventDetailType> {
  events: Record<string, {
    handler: EventHandler<EventDetailType>;
    options?: EventHandlerOptions;
  }[]>;

  constructor() {
    this.events = {};
  }

  onEvent(
    type: string, 
    listener: EventHandler<EventDetailType>,
    options?: EventHandlerOptions,
  ) {
    if (!this.events[type]) {
      this.events[type] = [];
    }
    if (!this.events[type].find(({ handler }) => handler === listener)) {
      this.events[type].push({ handler: listener, options });
    }
    
    return (() => {
      this.removeListener(type, listener);
    }).bind(this);
  }

  removeListener(
    type: string,
    listener: EventHandler<EventDetailType>,
  ) {
    this.events[type] = (this.events[type] || [])
      .filter(({ handler }) => handler !== listener);
  }

  fireEvent(
    type: string, 
    detail?: EventDetailType, 
  ) {
    const toCall = (() => {
      this.events[type]?.forEach(({ handler, options }) => {
        const canCall = !options?.once || !options?.called;
        if (canCall) {
          handler(detail);
        }
        if (options?.once) {
          options.called = true;
        }
      });
    }).bind(this);
    
    // schedule the event asap, asynchronously
    setTimeout(toCall);
  }
}
