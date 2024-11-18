// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import * as Avatar from '@radix-ui/react-avatar';

export default function Page() {
  return (
    <Avatar.Root>
      <Avatar.Fallback>A</Avatar.Fallback>
    </Avatar.Root>
  );
}
