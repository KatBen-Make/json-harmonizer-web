/**
 * Recursively merge multiple JSON objects.
 * For object keys: - prefers non-empty string/array/object value if any
 * For arrays: merges arrays, deduplicating objects with preference for non-empty values, merging items with same identifier (like itemID)
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

// Main: Merge array of objects by ID if present, otherwise deduplicate
function mergeArrayOfObjects(arrays: any[][]) {
  const allItems: any[] = arrays.flat().filter(Boolean);

  // Heuristically detect a suitable identifier key (only support one for now, default to itemID)
  // You can expand this for more keys in the future
  const identifierKeys = [
    "itemID",
    "id",
    "uuid",
    "name", // fallback if structure is poorly specified
  ];
  // Find an identifier key used by most items
  let identifierKey: string | null = null;
  for (const key of identifierKeys) {
    if (allItems.some(obj => isObject(obj) && key in obj)) {
      identifierKey = key;
      break;
    }
  }

  if (identifierKey) {
    // Group all objects by identifier
    const grouped: Record<string, any[]> = {};
    const others: any[] = [];
    for (const obj of allItems) {
      if (isObject(obj) && obj[identifierKey]) {
        const idVal = obj[identifierKey];
        if (!grouped[idVal]) grouped[idVal] = [];
        grouped[idVal].push(obj);
      } else {
        others.push(obj); // No ID, can't be grouped
      }
    }

    const mergedById = Object.values(grouped).map(groupArr =>
      groupArr.length === 1 ? groupArr[0] : deepMergeJson(groupArr)
    );
    // If any items had no ID, just add them as-is (optionally deduplicate or merge if structures match)
    return [...mergedById, ...others];
  }

  // Otherwise: fallback, old logic—deduplicate by keys
  const merged: any[] = [];
  const keyGroups: Record<string, any> = {};

  for (const obj of allItems) {
    if (isObject(obj)) {
      // Only consider keys with non-empty values for identity, default to object keys
      const importantKeys = Object.keys(obj).sort();
      const identityKey = JSON.stringify(importantKeys);
      if (!(identityKey in keyGroups)) {
        keyGroups[identityKey] = obj;
      } else {
        keyGroups[identityKey] = mergeObjectsKeepNonEmpty(keyGroups[identityKey], obj);
      }
    } else {
      merged.push(obj);
    }
  }
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
