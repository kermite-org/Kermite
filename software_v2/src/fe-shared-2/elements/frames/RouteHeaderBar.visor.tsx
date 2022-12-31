import { jsx } from 'alumina';
import { RouteHeaderBar } from './RouteHeaderBar';

export default {
  default: () => (
    <RouteHeaderBar
      title="edit project layout: default"
      backPagePath="/foo/bar"
      canSave={true}
      saveHandler={() => {}}
    />
  ),
};
