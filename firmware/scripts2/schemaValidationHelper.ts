type Checker = (value: any) => { [key in string]: string } | string | undefined;

type CheckerEx = Checker & {
  optional: Checker;
};

function withRequiredOption(checker: Checker): CheckerEx {
  function checkerOptional(value: any) {
    if (value === undefined) {
      return undefined;
    }
    return checker(value);
  }
  function checkerRequired(value: any) {
    if (value === undefined) {
      return "value required";
    }
    return checker(value);
  }

  const checkerEx = checkerRequired as CheckerEx;
  checkerEx.optional = checkerOptional;
  return checkerEx;
}

export function createChecker<
  TCheckerSource extends (...args: any[]) => Checker
>(checkerImpl: TCheckerSource) {
  return (...args: Parameters<TCheckerSource>) => {
    const checker = checkerImpl(...args);
    return withRequiredOption(checker);
  };
}

export const vObject = createChecker(
  (filedCheckersSet: { [key in string]: Checker }) => {
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
  }
);

export const vArray = createChecker((itemChecker: Checker) => {
  return (itemsArray: any[]) => {
    const errors: { [indexKey: string]: any } = {};
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

export const vString = createChecker((len?: number) => {
  return (text: string) => {
    if (typeof text !== "string") {
      return "must be a string";
    }
    if (len && text.length >= len) {
      return `must be a string length less than ${len}`;
    }
    return undefined;
  };
});

export const vNumber = createChecker(() => {
  return (value: number) => {
    if (!isFinite(value)) {
      return "must be a number";
    }
  };
});

export const vStringProjectId = createChecker(() => {
  return (text: string) => {
    if (!text.match(/^[a-zA-Z0-9]{8}$/)) {
      return "invalid project id";
    }
    return undefined;
  };
});
