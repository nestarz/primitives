function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
): (event: E) => void {
  return function handleEvent(event: E): void {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !((event as unknown) as Event).defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

export { composeEventHandlers };
