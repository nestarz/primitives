// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import * as Progress from '@radix-ui/react-progress';

export default function Page() {
  return (
    <Progress.Root value={20}>
      <Progress.Indicator>Progress</Progress.Indicator>
    </Progress.Root>
  );
}
