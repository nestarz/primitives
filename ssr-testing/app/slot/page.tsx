// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';

export default function Page() {
  return (
    <Slot>
      <span>I'm in a </span>
      <Slottable>
        <em>Slot!?</em>
      </Slottable>
    </Slot>
  );
}
