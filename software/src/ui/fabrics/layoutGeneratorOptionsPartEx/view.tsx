import { AluminaChild, css, FC, jsx } from 'alumina';
import { ILayoutGeneratorOptions, texts } from '~/ui/base';
import { RibbonSelector, ToggleSwitch } from '~/ui/components';
import { IWriteLayoutOptionFunc } from '~/ui/fabrics/layoutGeneratorOptionsPart/model';
import { useLayoutGeneratorOptionsPartModelEx } from '~/ui/fabrics/layoutGeneratorOptionsPartEx/model';

type Props = {
  layoutOptions: ILayoutGeneratorOptions;
  writeLayoutOption: IWriteLayoutOptionFunc;
};

const FieldRow: FC<{ title: string; children: AluminaChild }> = ({
  title,
  children,
}) => (
  <div class="row">
    <div>{title}</div>
    <div>{children}</div>
  </div>
);

export const LayoutGeneratorOptionsPartEx: FC<Props> = ({
  layoutOptions,
  writeLayoutOption,
}) => {
  const { placementModeOptions, valueChangeHandler } =
    useLayoutGeneratorOptionsPartModelEx(writeLayoutOption);

  return (
    <div class={style}>
      <div class="props-table">
        <FieldRow title={texts.layoutGeneratorConfiguration.keyPlacementAnchor}>
          <RibbonSelector
            options={placementModeOptions}
            value={layoutOptions.placementOrigin}
            setValue={valueChangeHandler('placementOrigin')}
          />
        </FieldRow>
        <FieldRow
          title={texts.layoutGeneratorConfiguration.invertColumnPlacement}
        >
          <ToggleSwitch
            checked={layoutOptions.invertX}
            onChange={valueChangeHandler('invertX')}
          />
        </FieldRow>
        <FieldRow title="invert row placement" if={false}>
          <ToggleSwitch
            checked={layoutOptions.invertY}
            onChange={valueChangeHandler('invertY')}
          />
        </FieldRow>
      </div>
    </div>
  );
};

const style = css`
  margin: 5px;
  margin-top: 10px;
  > .props-table {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 10px;

    > .row {
      display: contents;
    }
  }

  > .note {
    margin-top: 10px;
    color: #888;
  }
`;
