export interface ViewModelProps<T> {
  vm: T;
}

export function mvvmView<T>(func: (model: T) => JSX.Element) {
  return (props: { model: T }) => func(props.model);
}

const viewModelInstanceDict: { [key in string]: any } = {};

export function getViewModelCached<T>(Klass: { new (args: T): any }, args: T) {
  const dict = viewModelInstanceDict;
  const key = Klass.name;

  let instance = dict[key];
  if (!instance) {
    instance = dict[key] = new Klass(args);
  }
  return instance;
}
