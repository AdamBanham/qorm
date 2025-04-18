

export function isEqualSets<T>(a:Set<T>, b:Set<T>) : boolean {
    if (a === b) {
        return true;
    }
    if (a.size !== b.size) {
        return false;
    } 
    for (const value of a) {
        if (!b.has(value)) {
            return false;
        }
    }
    return true;
  }