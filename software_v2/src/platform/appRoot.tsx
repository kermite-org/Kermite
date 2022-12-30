import { jsx, render } from "alumina";
import { copyObjectProps } from "~/app-shared";
import { PageRoot } from "./PageRoot";
import { appStore } from "./appStore";
import { diOnlineProjectImporter } from "~/feature-online-project-importer";

function start() {
  const { actions } = appStore;
  copyObjectProps(diOnlineProjectImporter, {
    saveProject: actions.loadProject,
    close: actions.closeModal,
  });
  render(() => <PageRoot />, document.getElementById("app"));
}

window.addEventListener("load", start);
