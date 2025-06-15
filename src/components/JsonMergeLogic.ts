
/**
 * Recursively merge multiple JSON objects.
 * For object keys: - prefers non-empty string/array/object value if any
 * For arrays: merges arrays, deduplicating objects with preference for non-empty values
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

// Deduplicate array of objects with preference for non-empty values
function mergeArrayOfObjects(arrays: any[][]) {
  // Flatten arrays
  const allItems: any[] = arrays.flat().filter(Boolean);

  // Group by JSON stringified keys/structure for simple deduplication, but combine by overlap keys
  // This avoids duplicating objects with the same keys except for values

  // We'll use the object keys present (except those which are only empty)
  // But as user example shows, {"some":""} and {"some":"text"} are considered the same for deduplication
  // and only the one with the non-empty value should stay

  const merged: any[] = [];
  // We track for each group (based on stringified keys) the merged object with best values
  const keyGroups: Record<string, any> = {};

  for (const obj of allItems) {
    if (isObject(obj)) {
      // Only consider keys with non-empty values for identity, default to object keys
      // If all values are empty, use keys
      const importantKeys = Object.keys(obj).sort();
      // identityKey for deduplication (based on keys present, not their values)
      const identityKey = JSON.stringify(importantKeys);
      if (!(identityKey in keyGroups)) {
        keyGroups[identityKey] = obj;
      } else {
        keyGroups[identityKey] = mergeObjectsKeepNonEmpty(keyGroups[identityKey], obj);
      }
    } else {
      // non-object array member (primitive)
      merged.push(obj);
    }
  }
  // Add merged objects back
  merged.push(...Object.values(keyGroups));
  return merged;
}

export function deepMergeJson(jsonObjects: any[]): any {
  if (!jsonObjects.length) return {};

  // base case: if all are not objects, return the first non-empty, else the first
  const allNonObject = jsonObjects.every(j => !isObject(j) && !Array.isArray(j));
  if (allNonObject) {
    const nonEmpty = jsonObjects.find(val => !isEmpty(val));
    return nonEmpty !== undefined ? nonEmpty : jsonObjects[0];
  }

  // Check if any array at this level
  const arrays = jsonObjects.filter(j => Array.isArray(j)) as any[][];
  if (arrays.length > 0) {
    // If arrays of objects, merge arrays with key-based deduplication and preference for non-empty
    return mergeArrayOfObjects(arrays);
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
