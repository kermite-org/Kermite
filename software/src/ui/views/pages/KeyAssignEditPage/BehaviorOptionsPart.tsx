import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectFieldChecked } from '~ui/base/helper/FormHelpers';
import { models } from '~ui/models';

const cssBase = css`
  margin: 0 5px;
  > div + div {
    margin-top: 2px;
  }
`;
export const BehaviorOptionsPart = () => {
  const { settings } = models.uiStatusModel;

  return (
    <div css={cssBase}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showLayersDynamic}
            onChange={reflectFieldChecked(settings, 'showLayersDynamic')}
          />
          Show Layers Dynamic
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.showLayerDefaultAssign}
            onChange={reflectFieldChecked(settings, 'showLayerDefaultAssign')}
          />
          Show Fallback Assigns
        </label>
      </div>
    </div>
  );
};
