export function bumpObjectFields(target: any, inject: any) {
  for (const key in target) {
    delete target[key];
  }
  for (const key in inject) {
    target[key] = inject[key];
  }
}
