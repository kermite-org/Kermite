export const Display = (props: { visible: boolean; children: JSX.Element }) => {
  return (props.visible && props.children) || null;
};
