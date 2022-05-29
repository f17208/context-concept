import {
  MutableRefObject,
  useCallback,
  useMemo,
} from 'react';

export function useEventEmitter<EventDetailType>(
  eventCollector: MutableRefObject<HTMLDivElement | null>,
  getDetail?: (type: string) => EventDetailType
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
      const detailToSet = detail === undefined
        ? (getDetail && getDetail(type))
        : detail

      eventCollector.current.dispatchEvent(
        new CustomEvent(
          type, 
          detailToSet 
            ? { detail: detailToSet } 
            : undefined
        )
      );
    }
  }, [eventCollector, getDetail]);

  return useMemo(() => ({
    fireEvent,
    onEvent,
  }), [
    fireEvent,
    onEvent,
  ]);
}


