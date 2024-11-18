import { AccessibleIcon } from '@radix-ui/react-accessible-icon';
import { JSX } from 'react/jsx-runtime';

export default { title: 'Utilities/AccessibleIcon' };

export const Styled = (): JSX.Element => (
  <button type="button">
    <AccessibleIcon label="Close">
      <CrossIcon />
    </AccessibleIcon>
  </button>
);

export const Chromatic: {
    (): JSX.Element;
    parameters: {
        chromatic: {
            disable: boolean;
        };
    };
} = () => (
  <p>
    Some text with an inline accessible icon{' '}
    <AccessibleIcon label="Close">
      <CrossIcon />
    </AccessibleIcon>
  </p>
);
Chromatic.parameters = { chromatic: { disable: false } };

const CrossIcon = () => (
  <svg viewBox="0 0 32 32" width={24} height={24} fill="none" stroke="currentColor">
    <path d="M2 30 L30 2 M30 30 L2 2" />
  </svg>
);
