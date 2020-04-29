export class SiteModel {
  isWidgetMode: boolean = false;

  setWidgetMode = (isWidgetMode: boolean) => {
    this.isWidgetMode = isWidgetMode;
  };
}
