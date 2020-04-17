import { hx } from './basis/qx';
import {
  createClosureComponent,
  createClosureComponent2,
} from './basis/qxUtils';
import { DebugOverlay } from './basis/DebugOverlay';
import { app } from '~models/appGlobal';
import { modalAlert, modalTextInput } from './common/basicModals';
import { ForegroundModalLayerRoot } from './basis/ForegroundModalLayer';

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
    increment: () => self.count++,
  };
  return self;
}

const ClosureCounter = createClosureComponent(() => {
  const vm = makeCounterViewModel(10);

  return () => {
    const { count, increment } = vm;

    app.setDebugObject({ count });
    return (
      <div>
        <div>closure counter</div>
        {count}
        <button onClick={increment}>inc</button>
      </div>
    );
  };
});

const ClosureComponent2 = createClosureComponent2((props: { text: string }) => {
  let text1 = 'a';
  const pushText = () => {
    text1 += 'b';
  };

  return () => {
    return (
      <div>
        <div>text: {props.text} </div> <div>text1: {text1} </div>{' '}
        <button onClick={pushText}>extend</button>
      </div>
    );
  };
});

let textHoge = 'hoge';

export const SiteRootD = () => {
  // console.log(`site root d`);

  const onEditButton = async () => {
    const val = await modalTextInput({
      message: 'please input your name',
      defaultText: 'profile1',
    });
    console.log(val);
  };
  return (
    <div>
      <ClosureCounter />
      <ClosureComponent2 text={textHoge} />
      <button onClick={() => (textHoge = 'piyo')}>piyo</button>
      <DebugOverlay debugObj={app.debugObject} />
      <button onClick={() => modalAlert('hogehoge')}>alert</button>
      <button onClick={onEditButton}>edit</button>
      <ForegroundModalLayerRoot />
    </div>
  );
};
