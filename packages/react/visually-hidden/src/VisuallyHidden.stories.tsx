import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
// @ts-types="@types/react/jsx-runtime"
import { JSX } from 'react/jsx-runtime';

export default { title: 'Utilities/VisuallyHidden' };

export const Basic = (): JSX.Element => (
  <button>
    <VisuallyHidden>Save the file</VisuallyHidden>
    <span aria-hidden>💾</span>
  </button>
);
