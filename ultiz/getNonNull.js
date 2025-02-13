export function getNonNullObjects(data, limit) {
  const nonNullObjects = data.filter((item) => item !== null);
  return nonNullObjects.slice(0, limit);
}
