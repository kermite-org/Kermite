import { FC, jsx, AluminaNode, rerender } from 'alumina';

export namespace router {
  let chainingHashInEventCallback = false;

  export function rerenderEffectOnHashChange() {
    const onHashChange = () => {
      // DOMのイベントハンドラでから呼び出された処理でlocation.hashを設定したときに
      // レンダリングが2回呼ばれてしまうのを回避
      if (chainingHashInEventCallback) {
        chainingHashInEventCallback = false;
        return;
      }
      rerender();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }

  export function getPagePath() {
    return location.hash.slice(1);
  }

  export function navigateTo(path: string) {
    chainingHashInEventCallback = true;
    location.hash = path;
  }

  export function useRedirect(sourcePaths: string[], destPath: string) {
    const pagePath = router.getPagePath();
    if (sourcePaths.includes(pagePath)) {
      navigateTo(destPath);
    }
  }
}

export function linkTo(path: string) {
  return () => router.navigateTo(path);
}

export const ALink: FC<{ to: string; children: AluminaNode }> = ({
  to,
  children,
}) => {
  return <a href={`#${to}`}>{children}</a>;
};

export const Link: FC<{
  to: string;
  children: AluminaNode;
  className?: string;
}> = ({ to, children, className }) => (
  <div onClick={linkTo(to)} className={className}>
    {children}
  </div>
);
