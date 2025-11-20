export const iterable = <T>(entity: Iterable<T> | T): T[] => {
  if (typeof entity === "string") {
    return [entity];
  }

  const itr = Array.from(entity as any);

  if (itr.length === 0) {
    return [entity].flat() as T[];
  } else {
    return itr as T[];
  }
};
