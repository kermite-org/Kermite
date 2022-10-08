import { jsx, render } from "alumina";
import { appStore } from "./appStore";
import { diOnlineProjectImporter } from "./features";
import { copyObjectProps } from "./funcs";
import { PageRoot } from "./PageRoot";

function start() {
  const { actions } = appStore;
  copyObjectProps(diOnlineProjectImporter, {
    saveProject: actions.loadProject,
    close: actions.closeModal,
  });
  render(() => <PageRoot />, document.getElementById("app"));
}

window.addEventListener("load", start);
