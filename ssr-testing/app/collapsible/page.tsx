// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@radix-ui/react-collapsible';

export default function Page() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Trigger</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>
  );
}
