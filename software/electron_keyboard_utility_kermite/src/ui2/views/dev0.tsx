import { h, rerender, render } from './basis/qx';
import { DebugOverlay } from './basis/DebugOverlay';
import { appUi } from '~ui2/models/appGlobal';
import { modalAlert, modalTextEdit } from './common/basicModals';
import { ForegroundModalLayerRoot } from './basis/ForegroundModalLayer';
import { css } from 'goober';

// class CounterViewModel {
//   get count() {
//     return appModel.count;
//   }
//   increnemt = () => {
//     appModel.count += 10;
//   };
// }

// function CounterView() {
//   const vm = useViewModel(CounterViewModel);

//   const cssCount = css`
//     color: blue;
//     font-weight: bold;
//   `;
//   return (
//     <div>
//       <div css={cssCount}>count: {vm.count}</div>
//       <div>
//         <button onClick={vm.increnemt}>inc</button>
//       </div>
//     </div>
//   );
// }

// function Example1(props: { name: string; children: any }) {
//   return (
//     <div>
//       hello {props.name} <div>{props.children}</div>
//       <div>aabbb</div>
//       <CounterView />
//       <svg>
//         <rect x={0} y={0} width={10} height={10} fill="#8F8" />
//         <rect x={10} y={10} width={10} height={10} fill="#F88" />
//       </svg>
//     </div>
//   );
// }

function makeCounterViewModel(initialCount: number) {
  const self = {
    count: initialCount,
    increment: () => self.count++
  };
  return self;
}

const ClosureCounter = () => {
  const vm = makeCounterViewModel(10);

  return () => {
    const { count, increment } = vm;

    appUi.setDebugObject({ count });
    return (
      <div>
        <div>closure counter</div>
        {count}
        <button onClick={increment}>inc</button>
      </div>
    );
  };
};

const ClosureComponent2 = (props: { text: string }) => {
  let text1 = props.text;
  const pushText = () => {
    text1 += 'b';
  };
  // console.log('cc2 created', props.text);
  return (props2: { text: string }) => {
    // console.log(`cc2 render`, { props, props2 });
    const { text } = props2;
    return (
      <div>
        <div>text: {text} </div> <div>text1: {text1} </div>{' '}
        <button onClick={pushText}>extend</button>
      </div>
    );
  };
};

let rc = 0;

const DivOrNullTest = (props: any) => {
  const show = props.rc % 2 === 0;
  return show ? (
    <div id="divOrNullTestDiv">
      <div>HELL</div>
      <div id="D">D</div>
    </div>
  ) : null;
};

let textHoge = 'hoge';

export const DebugOverlayD = (_: any) => {
  return (props: any) => {
    const show = !!props.debugObj;
    console.log({ d: props.debugObj, show });
    return show ? (
      <div>
        <div>HELL</div>
        <div>D</div>
      </div>
    ) : null;
  };
};

const HelloCard = (props: { name: string }) => {
  return <div>Hello, {props.name}</div>;
};

export const SiteRootD = () => {
  // console.log(`site root d`);

  const cssBoxOuter = css`
    > * {
      border: solid 1px #48f;
    }
  `;

  const onEditButton = async () => {
    const val = await modalTextEdit({
      message: 'please input your name',
      defaultText: 'profile1',
      caption: 'hello'
    });
    // eslint-disable-next-line no-console
    console.log(val);
  };

  rc++;

  return (
    <div>
      <div css={cssBoxOuter} id="bouter">
        <ClosureCounter />
        <ClosureComponent2 text={textHoge} />
        <div>
          <div>{textHoge}</div>
          <button onClick={() => (textHoge = 'piyo')}>piyo</button>
          <button onClick={() => modalAlert('hogehogea')}>alert</button>
          <button onClick={onEditButton}>edit</button>
        </div>
        <HelloCard name="yamada" />
        {/* <DivOrNullTest rc={rc} id="divorNullTest" /> */}
      </div>
      <DebugOverlay debugObj={rc % 2 === 0 ? { a: 'b' } : undefined} />
      <ForegroundModalLayerRoot />
    </div>
  );
};

appUi.rerender = rerender;
render(() => <SiteRootD />, document.getElementById('app')!);
