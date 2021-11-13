import { jsx } from 'alumina';
import { RouteHeaderBar } from '~/ui/elements/frames';

export const RouterHeaderBarExamples = {
  default: () => (
    <RouteHeaderBar
      title="edit project layout: default"
      backPagePath="/foo/bar"
      canSave={true}
      saveHandler={() => {}}
    />
  ),
};
