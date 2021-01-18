export function bumpObjectFields(target: any, inject: any) {
  for (const key in target) {
    delete target[key];
  }
  for (const key in inject) {
    target[key] = inject[key];
  }
}

export function deepEqualValuesBesidesFunction(a: any, b: any): boolean {
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === 'object') {
    for (const key in a) {
      if (!deepEqualValuesBesidesFunction(a[key], b[key])) {
        return false;
      }
    }
    return true;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualValuesBesidesFunction(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof a === 'function') {
    return true;
  } else {
    return a === b;
  }
}
