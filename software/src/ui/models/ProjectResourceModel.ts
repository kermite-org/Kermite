import { IProjectResourceInfo } from '~defs/ProfileData';
import { EventPort } from '~funcs/EventPort';
import { appUi, backendAgent } from '~ui/core';

export class ProjectResourceModel {
  projectResourceInfos: IProjectResourceInfo[] = [];

  loadedEvents = new EventPort<{}>();

  initialize() {
    (async () => {
      this.projectResourceInfos = await backendAgent.getAllProjectResourceInfos();
      this.loadedEvents.emit({});
      appUi.rerender();
    })();
  }
}
