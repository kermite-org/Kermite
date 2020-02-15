import { css, jsx } from '@emotion/core';
import { ILayer } from '~contract/data';
import { VirtualKey } from '~model/HighLevelDefs';
import { VirtualKeyTexts } from '~ui/view/ConfiguratorSite/Constants';
import { checkIfLognNameKeyAssign } from '~ui/state/editor';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';

const cssAssignSlotCard = (
  isActive: boolean,
  isLongName: boolean,
  isVariableWidth: boolean
) => css`
  width: 30px;
  height: 30px;
  font-size: 14px;
  background: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;

  ${isActive &&
    css`
      background: ${UiTheme.clSelectHighlight};
    `}

  ${isVariableWidth &&
    css`
      width: auto;
      padding: 0 12px;
    `}

  ${isLongName &&
    css`
      font-size: 12px;
    `}
`;

export const AssignSlotCard = (props: {
  virtualKey: VirtualKey;
  isActive: boolean;
  onClick(): void;
}) => {
  const { isActive, onClick, virtualKey } = props;
  const text = VirtualKeyTexts[virtualKey] || '';
  const isExtended = checkIfLognNameKeyAssign(text);
  return (
    <div css={cssAssignSlotCard(isActive, isExtended, false)} onClick={onClick}>
      {text}
    </div>
  );
};

export const LayerTriggerAssignSlotCard = (props: {
  layer: ILayer;
  isActive: boolean;
  onClick(): void;
}) => {
  const { isActive, onClick, layer } = props;
  const text = layer.layerName;
  const isExtended = checkIfLognNameKeyAssign(text);
  return (
    <div css={cssAssignSlotCard(isActive, isExtended, true)} onClick={onClick}>
      {text}
    </div>
  );
};

export const AssignModeButtonRaw = (props: {
  text: string;
  isActive: boolean;
  onClick(): void;
}) => {
  const { isActive, onClick, text } = props;
  const isExtended = checkIfLognNameKeyAssign(text);
  return (
    <div css={cssAssignSlotCard(isActive, isExtended, true)} onClick={onClick}>
      {text}
    </div>
  );
};
