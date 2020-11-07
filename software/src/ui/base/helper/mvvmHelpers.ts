export interface ViewModelProps<T> {
  vm: T;
}

export function mvvmView<T>(func: (model: T) => JSX.Element) {
  return (props: { model: T }) => func(props.model);
}
