import React from 'react';

import { jsx } from '@emotion/core';

export namespace ForegroundModalLayerDomain {
  type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
    ? A
    : never;

  interface RenderFunc<D> {
    (props: { close: (result?: D) => void }): React.ReactElement;
  }

  interface ForegroundModel {
    modalRenderFunc: RenderFunc<any> | undefined;
    modalPromiseResolver: ((value: any) => void) | undefined;
    rerender: () => void;
  }

  const model: ForegroundModel = {
    modalRenderFunc: undefined,
    modalPromiseResolver: undefined,
    rerender: () => {}
  };

  const modalUpdator = {
    openModal<D>(renderFunc: RenderFunc<D>): Promise<D> {
      model.modalRenderFunc = renderFunc;
      model.rerender();
      return new Promise(resolve => {
        model.modalPromiseResolver = resolve;
      });
    },
    closeModal(result: any) {
      model.modalRenderFunc = undefined;
      model.rerender();
      if (model.modalPromiseResolver) {
        model.modalPromiseResolver(result);
        model.modalPromiseResolver = undefined;
      }
    }
  };

  async function showModal<D>(renderFunc: RenderFunc<D>): Promise<D> {
    return modalUpdator.openModal(renderFunc);
  }

  type ModalSource<S, D> = (
    params: S
  ) => (props: { close: (result?: D) => void }) => React.ReactElement;

  export function createModal<
    T extends ModalSource<any, any>,
    S = ArgumentTypes<T>[0],
    D = ArgumentTypes<ArgumentTypes<ReturnType<T>>[0]['close']>[0]
  >(source: T): (params: S) => Promise<D> {
    return (params: S) => showModal(source(params));
  }

  function ForegroundViewRoot() {
    const RenderModal = model.modalRenderFunc;
    const close = React.useCallback((result: any) => {
      modalUpdator.closeModal(result);
    }, []);
    return (
      <React.Fragment>
        {RenderModal && <RenderModal close={close} />}
      </React.Fragment>
    );
  }

  function useForceUpdate(): () => void {
    const [_, setState] = React.useState({});
    return React.useCallback(() => setState({}), []);
  }

  export function RenderRoot() {
    model.rerender = useForceUpdate();
    return <ForegroundViewRoot />;
  }
}

export const ForegroundModalLayerRoot = ForegroundModalLayerDomain.RenderRoot;
export const createModal = ForegroundModalLayerDomain.createModal;
