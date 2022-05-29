import {
  MutableRefObject,
  useCallback,
  useMemo,
} from 'react';

export function useEventEmitter<EventDetailType>(
  eventCollector: MutableRefObject<HTMLDivElement | null>,
) {
  const onEvent = useCallback((
    type: string, 
    listener: EventListenerOrEventListenerObject, 
    options?: boolean | AddEventListenerOptions | undefined,
  ) => {
    if (eventCollector.current) {
      eventCollector.current.addEventListener(type, listener, options);
    }

    return function unsubscribe() {
      if (eventCollector.current) {
        eventCollector.current.removeEventListener(type, listener, options);
      }
    }
  }, [eventCollector]);

  const fireEvent = useCallback((
    type: string, 
    detail?: EventDetailType | null, 
  ) => {
    if (eventCollector.current) {
      eventCollector.current.dispatchEvent(
        new CustomEvent(
          type, 
          detail
            ? { detail } 
            : undefined
        )
      );
    }
  }, [eventCollector]);

  return useMemo(() => ({
    fireEvent,
    onEvent,
  }), [
    fireEvent,
    onEvent,
  ]);
}


