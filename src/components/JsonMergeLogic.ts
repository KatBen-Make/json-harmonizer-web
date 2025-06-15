
/**
 * Recursively merge multiple JSON objects.
 * For object keys: - prefers non-empty string/array/object value if any
 * For arrays: takes the first non-empty array found
 * For primitive values: keeps first non-empty, otherwise keeps whatever
 */

function isObject(val: any) {
  return val && typeof val === "object" && !Array.isArray(val);
}

function isEmpty(value: any) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false; // numbers, booleans, etc.
}

export function deepMergeJson(jsonObjects: any[]): any {
  if (!jsonObjects.length) return {};

  // base case: if all are not objects, return the first non-empty, else the first
  const allNonObject = jsonObjects.every(j => !isObject(j) && !Array.isArray(j));
  if (allNonObject) {
    const nonEmpty = jsonObjects.find(val => !isEmpty(val));
    return nonEmpty !== undefined ? nonEmpty : jsonObjects[0];
  }

  // Merge arrays: pick first non-empty array, or the first array
  const anyArray = jsonObjects.find(j => Array.isArray(j));
  if (anyArray) {
    const nonEmpty = jsonObjects.find(j => Array.isArray(j) && !isEmpty(j));
    return nonEmpty ?? anyArray;
  }

  // Merge objects
  const result: Record<string, any> = {};
  const allKeys = Array.from(
    new Set(jsonObjects.flatMap(obj => (isObject(obj) ? Object.keys(obj) : [])))
  );

  for (const key of allKeys) {
    const valuesForKey = jsonObjects
      .map(obj => (isObject(obj) ? obj[key] : undefined))
      .filter(val => val !== undefined);

    result[key] = deepMergeJson(valuesForKey);
  }
  return result;
}
