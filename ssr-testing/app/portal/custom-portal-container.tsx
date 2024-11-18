'use client';

// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import { Portal } from '@radix-ui/react-portal';

export const CustomPortalContainer = () => {
  const [container, setContainer] = React.useState<Element | null>(null);
  return (
    <div>
      <em ref={setContainer} />
      <Portal container={container}>
        <span>This content is rendered in a custom container</span>
      </Portal>
    </div>
  );
};
