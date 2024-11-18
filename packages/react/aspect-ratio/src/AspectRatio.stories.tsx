import { JSX } from 'react/jsx-runtime';
import { JSX } from 'react/jsx-runtime';
import { css } from '../../../../stitches.config';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';

export default { title: 'Components/AspectRatio' };

const image = (
  <img
    src="https://images.unsplash.com/photo-1605030753481-bb38b08c384a?&auto=format&fit=crop&w=400&q=80"
    alt="A house in a forest"
    style={{ objectFit: 'cover', width: '100%', height: '1: JSX.Element00%' }}
  />
);

export const Styled = (): JSX.Element => (
  <div style={{ width: 500 }}>
    <AspectRatio className={rootClass()}>
      <h1>Default ratio (1/1)</h1>
    </AspectRatio>
  </div>
);

export const CustomRatios = (): JSX.Element => {
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 200 }}>
        <AspectRatio ratio={1 / 2}>{image}</AspectRatio>
      </div>
      <div style={{ width: 200 }}>
        <AspectRatio>{image}</AspectRatio>
      </div>
      <div style={{ width: 200 }}>
        <AspectRatio ratio={16 / 9}>{image}</AspectRatio>
      </div>
      <div style={{ width: 200 }}>
        <AspectRatio ratio={2 / 1}>{image}</AspectRatio>
      </div>
    </div>
  );
};

export const Chromatic = () => (
  <>
    <h1>Default ratio</h1>
    <div style={{ width: 300 }}>
      <AspectRatio className={rootClass()}>
        <p>Default ratio (1/1)</p>
      </AspectRatio>
    </div>

    <h1>Custom ratios</h1>
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 200 }}>
        <AspectRatio ratio={1 / 2}>{image}</AspectRatio>
      </div>
      <div style={{ width: 200 }}>
        <AspectRatio>{image}</AspectRatio>
      </div>
      <div style={{ width: 200 }}>
        <AspectRatio ratio={16 / 9}>{image}</AspectRatio>
      </div>
      <div style={{ width: 200 }}>
        <AspectRatio ratio={2 / 1}>{image}</AspectRatio>
      </div>
    </div>
  </>
);
Chromatic.parameters = { chromatic: { disable: false } };

const rootClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$red',
  color: 'white',
});
