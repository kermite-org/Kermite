import { h, Hook, render } from '~/qx';

const PageRoot = () => {
  console.log(`render`);
  console.log('aa');

  Hook.useSideEffect(() => {
    console.log('bb');
    const el = document.getElementById('domHello');
    console.log({ el });
  }, []);

  console.log('cc');

  return (
    <div style={{ border: 'solid 1px #888' }}>
      <div id="domHello">hello</div>
    </div>
  );
};

window.addEventListener('load', () => {
  render(() => <PageRoot />, document.getElementById('app'));
});
