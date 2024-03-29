import { css, FC, jsx } from 'alumina';
import { NavigationButton } from '~/ui/components';
import { useNavigationButtonsAreaModel } from '~/ui/root/organisms/navigationBar/navigationButtonsArea.model';

export const NavigationButtonsArea: FC = () => {
  const { navigationItems } = useNavigationButtonsAreaModel();
  return (
    <div class={style}>
      {navigationItems.map((item) => (
        <NavigationButton vm={item} key={item.pagePath} />
      ))}
    </div>
  );
};

const style = css`
  width: 100%;
`;
