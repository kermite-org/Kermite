export function debounce<T extends any[]>(
  targetProc: (...args: T) => void,
  ms: number,
) {
  let timerId: any;
  return (...args: T) => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = 0;
    }
    timerId = setTimeout(() => targetProc(...args), ms);
  };
}
