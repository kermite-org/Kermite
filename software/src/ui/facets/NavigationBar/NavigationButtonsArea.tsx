import { css, FC, jsx } from 'qx';
import { NavigationButton } from '~/ui/components';
import { useNavigationButtonsAreaModel } from '~/ui/facets/NavigationBar/NavigationButtonsArea.model';

export const NavigationButtonsArea: FC = () => {
  const { navigationItems } = useNavigationButtonsAreaModel();
  return (
    <div css={style}>
      {navigationItems.map((item) => (
        <NavigationButton vm={item} key={item.pagePath} />
      ))}
    </div>
  );
};

const style = css`
  width: 100%;
`;
