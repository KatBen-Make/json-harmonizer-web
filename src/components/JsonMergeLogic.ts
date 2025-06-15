
/**
 * Recursively merge multiple JSON objects.
 * - For arrays of objects: deeply merge all items into one object, regardless of identifier keys.
 * - For object keys: prefers non-empty string/array/object value if any.
 * - For arrays of non-objects: keeps first non-empty, otherwise keeps whatever.
 * - For primitive values: keeps first non-empty, otherwise keeps whatever.
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

// Given two objects, merge non-empty values from b into a
function mergeObjectsKeepNonEmpty(a: any, b: any) {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result: any = {};
  for (const key of allKeys) {
    const av = a[key];
    const bv = b[key];
    if (bv === undefined) {
      result[key] = av;
    } else if (av === undefined) {
      result[key] = bv;
    } else if (isObject(av) && isObject(bv)) {
      result[key] = mergeObjectsKeepNonEmpty(av, bv);
    } else if (!isEmpty(bv)) {
      result[key] = bv;
    } else {
      result[key] = av;
    }
  }
  return result;
}

// Deep merge all objects in arrays of objects into a single object
function mergeArrayToSingleObject(arrays: any[][]) {
  const allItems: any[] = arrays.flat().filter(isObject);
  let merged = {};
  for (const obj of allItems) {
    merged = mergeObjectsKeepNonEmpty(merged, obj);
  }
  return [merged]; // Single deeply merged object in an array
}

export function deepMergeJson(jsonObjects: any[]): any {
  if (!jsonObjects.length) return {};

  // base case: if all are not objects, return the first non-empty, else the first
  const allNonObject = jsonObjects.every(j => !isObject(j) && !Array.isArray(j));
  if (allNonObject) {
    const nonEmpty = jsonObjects.find(val => !isEmpty(val));
    return nonEmpty !== undefined ? nonEmpty : jsonObjects[0];
  }

  // If arrays at this level, handle with new merging logic
  const arrays = jsonObjects.filter(j => Array.isArray(j)) as any[][];
  if (arrays.length > 0) {
    // Check if all items in all arrays are objects
    const flattened = arrays.flat();
    const allObjects = flattened.every(item => isObject(item));
    if (allObjects) {
      // Deep merge all array items into a single object inside an array
      return mergeArrayToSingleObject(arrays);
    } else {
      // Fallback/legacy merge: return first non-empty array
      const nonEmpty = arrays.find(arr => arr.length > 0);
      return nonEmpty || [];
    }
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

