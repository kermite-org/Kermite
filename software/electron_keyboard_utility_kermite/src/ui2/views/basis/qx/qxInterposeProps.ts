import { qxGlobal } from './qxGlobal';

function styleObjectToString(obj: { [key: string]: any }) {
  return Object.keys(obj)
    .map((key) => {
      const value = obj[key];
      return `${key}:${value};`;
    })
    .join(' ');
}

export function qxInterposeProps(
  props: any,
  vtype: string | object | Function
) {
  if (typeof vtype !== 'string') {
    return;
  }
  if (props) {
    for (const key in props) {
      if (key.startsWith('on')) {
        const originalProc = props[key];
        delete props[key];
        const key1 = key.toLowerCase();

        props[key1] = originalProc
          ? (...a: any) => {
              originalProc?.(...a);
              qxGlobal.reqRerender = true;
            }
          : undefined;
      }
    }
    if (props.css || props.className || props.class) {
      const classes = [props.css, props.className, props.class]
        .filter((a) => !!a)
        .join(' ');
      delete props.css;
      delete props.className;
      props.class = classes;
    }
    if (props.style && typeof props.style === 'object') {
      props.style = styleObjectToString(props.style);
    }
  }
}
