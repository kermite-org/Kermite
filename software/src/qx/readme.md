# qx

A small ui framework.

## Design

- It aims to achieve higher productivity on small frontend applications.
- Consider more on development easiness than execution performance.
- The code resembles to React, but it's highly inspired by Mithril in philosophy.
- Minimalistic

## Features

- Functional component
- Closure component
- Whole redraw after event handlers
- Css props support
- Typescript support

## Internal
- Based upon petit-dom, a compact vdom library

## Usage Examples


### Setup
```jsx
import { h, render } from './qx';

const Hello = (props: { text: string }) => {
  return <div>hello {props.text}</div>;
};

render(() => <Hello text="world" />, document.getElementById('app'));
```


### Component Types

Threre are three form of components.

#### Function Component
Function components have the same form as that of React.
```jsx
const Greet = (props: { name: string }) => {
  return <div>Hello, {props.name}</div>;
};
```


##### Closure Component
Component function can have local state when it is written as closure form. It's smarter than Hooks codes, isn't it?
```jsx
const Counter = () => {
  let count = 0;
  const increment = () => count++;
  return () => (
    <div>
      <span>{count}</span>
      <button onClick={increment}>increment</button>
    </div>
  );
};
```


#### Closure Component with Lifecycle handlers
Closure component can also return an object. `render` function must be in it. `didMount`, `didUpdate`, `willUnmount` are optional lifecycle handlers.

```jsx
const LifeCycleExample = () => {
  console.log('created');
  return {
    didMount: () => console.log(`did mount`),
    didUpdate: () => console.log(`did update`),
    willUnmount: () => console.log(`will unmount`),
    render: () => {
      console.log('render');
      return <div>hello hello</div>;
    }
  };
};
```

### Note

#### props for closure component
Regarding to closure component, there are 2 props reception. In the code below, props1 is the initial props when the component is created
and props2 are updated props may be altered in subsequent render calls.

```jsx
const PropsTest = (props1: any) => {
  //props1 is the initial passed props for the component
  return (props2: any) => {
    //props2 is the updated props passed for each rendering.
    <div>
      Test
    </div>
  };
};
```

#### Auto Redraw
The whole view is updated after each call of DOM event handlers . You don't have to consider immutable state updation or redundant boilerplate of flux-based state management framework. Just make a global variable as as store and you can directly alter them.
```jsx
const store = {
  text: '⭐'
};

const Chainer = () => {
  const extendText = () => (store.text += '🐬');
  const resetText = () => (store.text = '⭐');
  return (
    <div>
      <div>{store.text}</div>
      <div>
        <button onClick={extendText}>extend</button>
        <button onClick={resetText}>reset</button>
      </div>
    </div>
  );
};
```

### Manual Redraw
If states are updated by a trigger other than DOM events, you have to manually emit the re-rendering request. Timer callbacks or resolved asynchronous promises are typical source needs of this treatment.
```jsx
import { h, render, rerender } from './qx';

let count = 0;

const CounterView = () => {
  return <div>{count}</div>;
};

setInterval(() => {
  count++;
  rerender(); //force re-render manually
}, 1000);

render(() => <CounterView />, document.getElementById('app'));
```

### Simple MVVM example
Presentation logic separation is a important subject for frontend development. Here is a simple MVVM pattern applied to the previous auto-redraw example. This examples is kept simple for illustrative purpose. You may make your own MVVM structure (with DI or domain model, ...etc if you need) according to the code scale or your needs.
```jsx
import { h, render } from './qx';

//Model
const model = {
  text: '⭐'
};

//ViewModel
class ChainerViewModel {
  get text() {
    return model.text;
  }
  extendText = () => {
    model.text += '🐬';
  };

  resetText = () => {
    model.text = '⭐';
  };
}

//View
const ChainerView = () => {
  const vm = new ChainerViewModel();
  return () => (
    <div>
      <div>{vm.text}</div>
      <div>
        <button onClick={vm.extendText}>extend</button>
        <button onClick={vm.resetText}>reset</button>
      </div>
    </div>
  );
};

render(() => <ChainerView />, document.getElementById('app'));
```
