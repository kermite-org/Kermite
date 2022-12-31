import { asyncRerender, jsx } from 'alumina';

export namespace ForegroundModalLayerDomain {
  type JsxElement = any;

  type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
    ? A
    : never;

  interface RenderFunc<D> {
    (props: { close: (result?: D) => void }): JsxElement;
  }

  class ForegroundModalModel {
    modalRenderFunc: RenderFunc<any> | undefined;
    modalPromiseResolver: ((value: any) => void) | undefined;

    openModal<D>(renderFunc: RenderFunc<D>): Promise<D> {
      this.modalRenderFunc = renderFunc;
      return new Promise((resolve) => {
        this.modalPromiseResolver = resolve;
      });
    }

    closeModal(result: any) {
      this.modalRenderFunc = undefined;
      if (this.modalPromiseResolver) {
        this.modalPromiseResolver(result);
        this.modalPromiseResolver = undefined;
      }
      asyncRerender();
    }
  }
  const modalModel = new ForegroundModalModel();

  type ModalSource<S, D> = (
    params: S,
  ) => (props: { close: (result?: D) => void }) => JsxElement;

  export function createModal<
    T extends ModalSource<any, any>,
    S = ArgumentTypes<T>[0],
    D = ArgumentTypes<ArgumentTypes<ReturnType<T>>[0]['close']>[0],
  >(source: T): (params: S) => Promise<D> {
    return (params: S) => modalModel.openModal(source(params));
  }

  export function RenderRoot() {
    const RenderModal = modalModel.modalRenderFunc;
    const close = (result: any) => {
      modalModel.closeModal(result);
    };
    return <div>{RenderModal && <RenderModal close={close} />}</div>;
  }

  export function forceCloseModal() {
    modalModel.closeModal(undefined);
  }
}

export const ForegroundModalLayerRoot = ForegroundModalLayerDomain.RenderRoot;
export const createModal = ForegroundModalLayerDomain.createModal;
export const forceCloseModal = ForegroundModalLayerDomain.forceCloseModal;
