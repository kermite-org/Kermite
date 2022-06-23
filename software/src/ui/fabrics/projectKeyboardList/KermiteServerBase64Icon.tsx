import { asyncRerender, FC, jsx } from 'alumina';
import { useFetcher } from '~/ui/utils';

type Props = {
  iconUrl: string;
};

export const KermiteServerBase64Icon: FC<Props> = ({ iconUrl }) => {
  const iconDataBase64 = useFetcher(async () => {
    const res = await fetch(iconUrl);
    const data = (await res.json()) as { avatar: string };
    asyncRerender();
    return data.avatar;
  }, '');
  const src = `data:image/png;base64,${iconDataBase64}`;
  return <img src={src} />;
};
