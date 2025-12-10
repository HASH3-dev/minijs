export const isIterable = <T extends unknown>(
  entity: Iterable<T> | T
): entity is Iterable<T> => {
  return typeof (entity as any)?.[Symbol.iterator] === "function";
};
