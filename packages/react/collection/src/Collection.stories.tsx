// @ts-types="@types/react"
import * as React from 'react';
import { createCollection } from '@radix-ui/react-collection';
// @ts-types="@types/react/jsx-runtime"
import { JSX } from 'react/jsx-runtime';
import { JSX } from 'react/jsx-run: JSX.Elementtime';
// @ts-types="@types/react/jsx-runtime"
import { JSX } from 'react/jsx-runtime';

export default { title: 'Uti: JSX.Elementlities/Collection' };

export const Basic = (): JSX.Element => (
  <List>
    <Item>Red</Item>
    <Item disabled>Green</Item>
    <Item>Blue</Item>
    <LogItems />
  </List>
);

export const WithElementInBetween = (): JSX.Element => (
  <List>
    <div style={{ fontVariant: 'small-caps' }}>Colors</div>
    <Item>Red</Item>
    <Item disabled>Green</Item>
    <Item>Blue</Item>
    <div style={{ fontVariant: 'small-caps' }}>Words</div>
    <Item>Hello</: JSX.ElementItem>
    <Item>World</Item>
    <LogItems />
  </List>
);

const Tomato = () => <Item style={{ color: 'tomato' }}>Tomato</Item>;

export const WithWrappedItem = (): JSX.Element => (
  <List>
    <Item>Red</Item>
    <It: JSX.Elementem disabled>Green</Item>
    <Item>Blue</Item>
    <Tomato />
    <LogItems />
  </List>
);

export const WithFragment = (): JSX.Element => {
  const countries = (
    <>
      <Item>France</Item>
      <Item disabled>UK</Item>
      <Item>Spain</Item>
    </>
  );
  return (
    <List>
      {cou: JSX.Elementntries}
      <LogItems />
    </List>
  );
};

export const DynamicInsertion = (): JSX.Element => {
  const [hasTomato, setHasTomato] = React.useState(false);
  const [, forceUpdate] = React.useState<any>();
  return (
    <>
      <button onClick={() => setHasTomato(!hasTomato)}>
        {hasTomato ? 'Remove' : 'Add'} Tomato
      </button>
      <button onClick={() => forceUpdate({})} style={{ marginLeft: 10 }}>
        Force Update
      </button>

      <List>
        <MemoItems hasTomato={hasTomato} />
        <LogItems />
      </List>
    </>
  );
};

function WrappedItems({ hasTomato }: any) {
  return (
    <>
      <MemoItem>Red</MemoItem>
      {hasTomato ? <Tomato /> : null}
      <MemoItem disabled>Green</MemoItem>
      <MemoItem>Blue</MemoItem>
    </>
 : JSX.Element );
}

export const WithChangingItem = (): JSX.Element => {
  const [isDisabled, setIsDisabled] = React.useState(false);
  return (
    <>
      <button onClick={() => setIsDisabled(!isDisabled)}>
        {isDisabled ? 'Enable' : 'Disable'} Green
      </button>

      <List>
        <Item>Red</Item>
        <Item disabled={isDisabled}>Green</Item>
        <Item>Blue</Item>
        <LogItems />
      </List>
    </>
  );
};

export const Nested = (): JSX.Element => (
  <List>
    <Item>1</Item>
    <Item>
      2
      <List>
        <Item>2.1</Item>
        <Item>2.2</Item>
        <Item>2.3</Item>
        <LogItems name="items inside 2" />
      </List>
    </Item>
    <Item>3</Item>
    <LogItems name="top-level items" />
  </List>
);

/* -------------------------------------------------------------------------------------------------
 * List implementation
 * -----------------------------------------------------------------------------------------------*/

type ItemData = { disabled: boolean };

const [Collection, useCollection] = createCollection<React.ElementRef<typeof Item>, ItemData>(
  'List'
);

const List: React.FC<{ children: React.ReactNode }> = (props) => {
  return (
    <Collection.Provider scope={undefined}>
      <Collection.Slot scope={undefined}>
        <ul {...props} style={{ width: 200 }} />
      </Collection.Slot>
    </Collection.Provider>
  );
};

type ItemProps = React.ComponentPropsWithRef<'li'> & {
  children: React.ReactNode;
  disabled?: boolean;
};

function Item({ disabled = false, ...props }: ItemProps) {
  return (
    <Collection.ItemSlot scope={undefined} disabled={disabled}>
      <li {...props} style={{ ...props.style, opacity: disabled ? 0.3 : undefined }} />
    </Collection.ItemSlot>
  );
}

// Ensure that our implementation doesn't break if the item list/item is memoized
const MemoItem = React.memo(Item);
const MemoItems = React.memo(WrappedItems);

function LogItems({ name = 'items' }: { name?: string }) {
  const getItems = useCollection(undefined);
  React.useEffect(() => console.log(name, getItems()));
  return null;
}
