export type IChecker = (
  value: any,
) => { [key in string]: string } | string | undefined;

export type ICheckerEx = IChecker & {
  optional: IChecker;
};

function withRequiredOption(checker: IChecker): ICheckerEx {
  function checkerOptional(value: any) {
    if (value === undefined) {
      return undefined;
    }
    return checker(value);
  }
  function checkerRequired(value: any) {
    if (value === undefined) {
      return 'value required';
    }
    return checker(value);
  }

  const checkerEx = checkerRequired as ICheckerEx;
  checkerEx.optional = checkerOptional;
  return checkerEx;
}

export function createChecker<
  TCheckerSource extends (...args: any[]) => IChecker
>(checkerImpl: TCheckerSource) {
  return (...args: Parameters<TCheckerSource>) => {
    const checker = checkerImpl(...args);
    return withRequiredOption(checker);
  };
}

export function createCheckerWithArrayArguments<T>(
  checkerImpl: (args: T[]) => IChecker,
) {
  return (args: T[]) => {
    const checker = checkerImpl(args);
    return withRequiredOption(checker);
  };
}

export const vObject = createChecker(
  (filedCheckersSet: { [key in string]: IChecker }) => {
    return (targetObject: any) => {
      const errors: { [fieldName: string]: any } = {};
      for (const fieldName in filedCheckersSet) {
        const checker = filedCheckersSet[fieldName];
        const value = targetObject[fieldName];
        const error = checker(value);
        if (error) {
          errors[fieldName] = error;
        }
      }
      if (Object.keys(errors).length === 0) {
        return undefined;
      }
      return errors;
    };
  },
);

export const vArray = createChecker((itemChecker: IChecker) => {
  return (itemsArray: any[]) => {
    if (!Array.isArray(itemsArray)) {
      return `must be an array`;
    }
    const errors: { [indexKey: string]: any } = {};
    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const indexKey in itemsArray) {
      const error = itemChecker(itemsArray[indexKey]);
      if (error) {
        errors[`[${indexKey}]`] = error;
      }
    }
    if (Object.keys(errors).length === 0) {
      return undefined;
    }
    return errors;
  };
});

export const vObjectDictionary = createChecker(
  (itemChecker: IChecker, keyChecker?: IChecker) => {
    return (itemsDict: { [key in string]: any }) => {
      const errors: { [indexKey: string]: any } = {};
      for (const key in itemsDict) {
        const value = itemsDict[key];
        let error = itemChecker(value);
        if (!error && keyChecker) {
          error = keyChecker(key);
        }
        if (error) {
          errors[`[${key}]`] = error;
        }
      }
      if (Object.keys(errors).length === 0) {
        return undefined;
      }
      return errors;
    };
  },
);

export const vString = createChecker((len?: number) => {
  return (text: string) => {
    if (typeof text !== 'string') {
      return 'must be a string';
    }
    if (len && text.length >= len) {
      return `must be a string length less than ${len}`;
    }
    return undefined;
  };
});

export const vNumber = createChecker(() => {
  return (value: number) => {
    if (typeof value !== 'number') {
      return 'must be a number';
    }
    if (!isFinite(value)) {
      return 'must be a number';
    }
  };
});

export const vBoolean = createChecker(() => {
  return (value: boolean) => {
    if (!(value || !value)) {
      return 'must be a boolean';
    }
  };
});

export const vNumberRanged = createChecker((lo: number, hi: number) => {
  return (value: number) => {
    if (!isFinite(value)) {
      return 'must be a number';
    }
    if (!(lo <= value && value <= hi)) {
      return `must be a value in the range ${lo} to ${hi}`;
    }
  };
});

export const vInteger = createChecker((opts?: { lo?: number; hi?: number }) => {
  return (value: number) => {
    if (!Number.isInteger(value)) {
      return 'must be an integer';
    }
    if (opts) {
      const { lo, hi } = opts;
      if (lo !== undefined && isFinite(lo)) {
        if (value < lo) {
          return `must be greater than ${lo}`;
        }
      }
      if (hi !== undefined && isFinite(hi)) {
        if (value > hi) {
          return `must be less than ${hi}`;
        }
      }
    }
  };
});

export const vNaturalInteger = (includesZero: boolean = true) =>
  vInteger({ lo: includesZero ? 0 : 1 });

export const vSchemaOneOf = createCheckerWithArrayArguments(
  (checkers: IChecker[]) => {
    return (value: any) => {
      const errors = checkers.map((checker) => checker(value));
      if (!errors.includes(undefined)) {
        return {
          the_value: value,
          must_matches_to_one_of: errors as any,
        };
      }
      return undefined;
    };
  },
);

export const vValueEquals = createChecker((refValue: any) => {
  return (value: any) => {
    if (value !== refValue) {
      return `must be ${refValue}`;
    }
    return undefined;
  };
});

export const vValueOneOf = createCheckerWithArrayArguments(
  (refValues: any[]) => {
    return (value: any) => {
      if (!refValues.includes(value)) {
        return `must be one of [${refValues
          .map((it) => (typeof it === 'string' ? `'${it}'` : it))
          .join(', ')}]`;
      }
      return undefined;
    };
  },
);

export const vStringMatchesTo = createChecker((regexps: RegExp[]) => {
  return (text: string) => {
    if (!regexps.some((regex) => text.match(regex))) {
      return `must matches to one of [${regexps.join(', ')}]`;
    }
    return undefined;
  };
});
