export const iterable = <T>(entity: Iterable<T> | T): T[] => {
  if (typeof entity === "string") {
    return [entity];
  }

  let itr: T[] = [];
  try {
    itr = Array.from(entity as any);
  } catch (error) {
    itr = [entity].flat() as T[];
  }

  if (itr.length === 0) {
    return [entity].flat() as T[];
  } else {
    return itr as T[];
  }
};
