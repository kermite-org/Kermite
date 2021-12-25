import { css, FC, jsx } from 'alumina';
import { fallbackProjectLayoutEntry, IProjectLayoutEntry } from '~/shared';
import { colors, uiConfiguration } from '~/ui/base';
import { IPageSpec_ProjectLayoutView } from '~/ui/commonModels';
import { RouteHeaderBar } from '~/ui/elements/frames';
import {
  LayoutEditorCore,
  LayoutEditorGeneralComponent,
  LayoutEditorGeneralComponent_OutputPropsSupplier,
} from '~/ui/featureEditors';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiActions,
} from '~/ui/store';
import { useMemoEx } from '~/ui/utils';

type Props = {
  spec: IPageSpec_ProjectLayoutView;
};

const helpers = {
  getSourceLayoutEntryOrCreate(
    projectKey: string,
    layoutName: string,
  ): IProjectLayoutEntry {
    const projectInfo =
      projectPackagesReader.findProjectInfoByProjectKey(projectKey);
    const layoutEntry = projectInfo?.layouts.find(
      (it) => it.layoutName === layoutName,
    );
    return layoutEntry || fallbackProjectLayoutEntry;
  },
};

export const ProjectLayoutEditPage: FC<Props> = ({
  spec: { projectKey, layoutName, canEdit },
}) => {
  const sourceLayoutEntry = useMemoEx(helpers.getSourceLayoutEntryOrCreate, [
    projectKey,
    layoutName,
  ]);
  const { isModified, emitSavingDesign } =
    LayoutEditorGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    const newLayoutEntry: IProjectLayoutEntry = {
      ...sourceLayoutEntry,
      data: emitSavingDesign(),
    };
    projectPackagesWriter.saveLocalProjectResourceItem(
      'layout',
      newLayoutEntry,
    );
    if (!uiConfiguration.closeProjectResourceEditPageOnSave) {
      LayoutEditorCore.rebase();
    } else {
      uiActions.closeSubPage();
    }
  };
  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project layout: ${sourceLayoutEntry.layoutName}`}
        backHandler={uiActions.closeSubPage}
        canSave={isModified}
        saveHandler={canEdit ? saveHandler : undefined}
      />
      <LayoutEditorGeneralComponent layout={sourceLayoutEntry.data} />
    </div>
  );
};

const style = css`
  background: ${colors.clBackground};
  color: ${colors.clMainText};
  height: 100%;
  display: flex;
  flex-direction: column;
`;
