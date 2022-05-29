import {
  MutableRefObject,
  useCallback,
  useMemo,
} from 'react';

export function useEventEmitter<EventDetailType>(
  eventCollector: MutableRefObject<HTMLDivElement | null>,
  masterGetDetail?: (type: string) => EventDetailType
) {
  const on = useCallback((
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
        ? (masterGetDetail && masterGetDetail(type))
        : detail

      eventCollector.current.dispatchEvent(
        new CustomEvent(
          type, 
          (
            detailToSet 
              ? { detail: detailToSet } 
              : undefined
          )
        )
      );
    }
  }, [eventCollector, masterGetDetail]);

  return useMemo(() => ({
    fireEvent,
    on,
  }), [
    fireEvent,
    on,
  ]);
}


