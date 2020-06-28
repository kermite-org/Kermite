import * as dyo from 'dyo';

let renderProc = () => {};

function rerender() {
  renderProc();
}

export function hx(...args: any[]) {
  const attrs = args[1];
  if (attrs) {
    for (const key in attrs) {
      if (key.startsWith('on')) {
        const proc = attrs[key];
        attrs[key] = (...a: any) => {
          proc(...a);
          rerender();
        };
      }
    }
    if (attrs.css) {
      attrs.class = attrs.css;
      delete attrs.css;
    }
  }
  return (dyo.h as any)(...args);
}

function render(vdom: any, dom: any) {
  renderProc = () => dyo.render(vdom, dom);
  renderProc();
}

export const qx = {
  rerender,
  render
};
