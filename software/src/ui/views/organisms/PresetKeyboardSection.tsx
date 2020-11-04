import { css } from 'goober';
import { h } from '~lib/qx';
import { models } from '~ui/models';
import { PresetKeyboardView } from '../keyboardSvg/panels/PresetKeyboardView';

const cssBase = css`
  border: solid 1px blue;
  height: 300px;
  display: flex;
  > .keyboardPart {
    flex-grow: 1;
    border: solid 1px blue;
  }

  > .layersPart {
    flex-shrink: 0;
    width: 100px;
    border: solid 1px blue;
  }
`;
export const PresetKeyboardSection = () => {
  const { profileData } = models.editorModel;
  // console.log(profileData);
  return (
    <div css={cssBase}>
      <div class="keyboardPart">
        <PresetKeyboardView profileData={profileData} />
      </div>
      <div class="layersPart" />
    </div>
  );
};
