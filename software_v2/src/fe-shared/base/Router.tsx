import { FC, jsx, AluminaNode } from 'alumina';

export namespace router {
  // let chainingHashInEventCallback = false;

  // export function rerenderEffectOnHashChange() {
  //   const onHashChange = () => {
  //     // DOMのイベントハンドラでから呼び出された処理でlocation.hashを設定したときに
  //     // レンダリングが2回呼ばれてしまうのを回避
  //     if (chainingHashInEventCallback) {
  //       chainingHashInEventCallback = false;
  //       return;
  //     }
  //     rerender();
  //   };
  //   window.addEventListener('hashchange', onHashChange);
  //   return () => window.removeEventListener('hashchange', onHashChange);
  // }

  const pagePathStorageKey = 'kermite_pagePath';

  function loadPagePath(): string {
    return localStorage.getItem(pagePathStorageKey) || '/';
  }

  function savePagePath(pagePath: string) {
    localStorage.setItem(pagePathStorageKey, pagePath);
  }

  const local = {
    pagePath: loadPagePath(),
  };

  export function getPagePath() {
    // return location.hash.slice(1);
    return local.pagePath;
  }

  export function navigateTo(path: string) {
    // chainingHashInEventCallback = true;
    // location.hash = path;
    local.pagePath = path;
    savePagePath(path);
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
}> = ({ to, children }) => <div onClick={linkTo(to)}>{children}</div>;
