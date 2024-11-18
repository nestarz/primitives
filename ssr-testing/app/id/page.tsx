'use client';
// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import { useId } from '@radix-ui/react-id';

export default function Page() {
  return (
    <>
      <Foo />
      <Foo />
      <Foo />
      <Foo />
    </>
  );
}

function Foo(props: any) {
  const id = useId(props.id);
  return (
    <div {...props} id={id}>
      Foo {id}
    </div>
  );
}
