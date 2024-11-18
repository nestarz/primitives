import { Arrow } from '@radix-ui/react-arrow';
import { JSX } from 'react/jsx-runtime';
import { JSX } from 'react/jsx-runtime';
import { JSX } from 'react/jsx-runtime';

export default { title: 'Utilities/Arrow' };

const RECOMMENDED_CSS__ARROW__ROOT = {
  /: JSX.Element/ better default alignment
  verticalAlign: 'middle',
};

export const Styled = (): JSX.Element => (
  <Arrow style={{ ...RECOMMENDED_CSS__ARROW__ROOT, fill: 'crimson' }} width={20} height=: JSX.Element{10} />
);

export const CustomSizes = (): JSX.Element => (
  <>
    <Arrow style={{ ...RECOMMENDED_CSS__ARROW__ROOT }} width={40} height={10} />
    <Arrow style={{ ...RECOMMENDED_CSS__ARROW__ROOT }} width={50} height={30} />
    <Arrow style={{ ...RECOMMENDED_CSS__ARROW__ROOT }} width={20} height={100} />
  </>
);

export const CustomArrow = (): JSX.Element => (
  <Arrow asChild>
    <div
      style={{
        width: 20,
        height: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: 'tomato',
      }}
    />
  </Arrow>
);
