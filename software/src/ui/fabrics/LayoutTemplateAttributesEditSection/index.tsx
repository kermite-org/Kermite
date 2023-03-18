import { AluminaChild, css, domStyled, FC, jsx } from 'alumina';
import { ILayoutTemplateAttributes, texts } from '~/ui/base';
import { NumberInput } from '~/ui/components/molecules/NumberInput';

type IWriteLayoutTemplateAttributesFunc = <
  K extends keyof ILayoutTemplateAttributes,
>(
  key: K,
  value: ILayoutTemplateAttributes[K],
) => void;

type Props = {
  templateAttrs: ILayoutTemplateAttributes;
  writeTemplateAttrs: IWriteLayoutTemplateAttributesFunc;
};

const FieldRow: FC<{ title: string; children: AluminaChild }> = ({
  title,
  children,
}) =>
  domStyled(
    <div class="row">
      <div>{title}</div>
      <div>{children}</div>
    </div>,
    css`
      display: flex;
      gap: 5px;
    `,
  );

export const LayoutTemplateAttributesEditSection: FC<Props> = ({
  templateAttrs,
  writeTemplateAttrs,
}) => {
  return domStyled(
    <div>
      <FieldRow title={texts.layoutTemplateConfiguration.numMatrixColumns}>
        <NumberInput
          value={templateAttrs.numMatrixColumns}
          setValue={(val) => writeTemplateAttrs('numMatrixColumns', val)}
          width={100}
          min={0}
          max={100}
        />
      </FieldRow>
      <FieldRow title={texts.layoutTemplateConfiguration.numMatrixRows}>
        <NumberInput
          value={templateAttrs.numMatrixRows}
          setValue={(val) => writeTemplateAttrs('numMatrixRows', val)}
          width={100}
          min={0}
          max={100}
        />
      </FieldRow>
      <FieldRow title={texts.layoutTemplateConfiguration.numIndividualKeys}>
        <NumberInput
          value={templateAttrs.numIndividualKeys}
          setValue={(val) => writeTemplateAttrs('numIndividualKeys', val)}
          width={100}
          min={0}
          max={100}
        />
      </FieldRow>
    </div>,
    css`
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 10px;

      > .row {
        display: contents;
      }
    `,
  );
};
