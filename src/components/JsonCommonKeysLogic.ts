
/**
 * Find all keys that are present in every JSON object, including nested keys and array elements
 */

function isObject(val: any): boolean {
  return val && typeof val === "object" && !Array.isArray(val);
}

function getAllKeys(obj: any, prefix: string = ""): Set<string> {
  const keys = new Set<string>();
  
  if (isObject(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.add(fullKey);
      
      // Recursively get nested keys
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach(k => keys.add(k));
    }
  } else if (Array.isArray(obj)) {
    // For arrays, get keys from all array elements
    obj.forEach((item, index) => {
      if (isObject(item)) {
        const nestedKeys = getAllKeys(item, `${prefix}[${index}]`);
        nestedKeys.forEach(k => keys.add(k));
      }
    });
    
    // Also get common structure keys (keys present in all array objects)
    if (obj.length > 0 && obj.every(isObject)) {
      const arrayObjectKeys = obj.map(item => getAllKeys(item));
      if (arrayObjectKeys.length > 0) {
        // Find intersection of all array object keys
        const commonArrayKeys = arrayObjectKeys.reduce((common, current) => {
          return new Set([...common].filter(key => current.has(key)));
        });
        
        commonArrayKeys.forEach(key => {
          const arrayKey = prefix ? `${prefix}[].${key}` : `[].${key}`;
          keys.add(arrayKey);
        });
      }
    }
  }
  
  return keys;
}

export function findCommonKeys(jsonObjects: any[]): string[] {
  if (jsonObjects.length === 0) return [];
  if (jsonObjects.length === 1) return Array.from(getAllKeys(jsonObjects[0])).sort();
  
  // Get all keys from each JSON object
  const allKeysSets = jsonObjects.map(obj => getAllKeys(obj));
  
  // Find intersection of all key sets
  const commonKeys = allKeysSets.reduce((common, current) => {
    return new Set([...common].filter(key => current.has(key)));
  });
  
  return Array.from(commonKeys).sort();
}
