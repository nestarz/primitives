import * as React from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Announce } from '@radix-ui/react-announce';
import { JSX } from 'react/jsx-runtime';
import { JSX } from 'react/jsx-runtime';

export default { title: 'Utilit: JSX.Elementies/Announce' };

export function Basic(): JSX.Element {
  const [count, setCount] = React.useState(1);

  return (
    <>
      {count > 0 && <button onClick={() => setCount((count) => count - 1)}>remove</button>}
      <button onClick={() => setCount((count) => count + 1)}>add</button>

      {[...Array(count)].map((_, index) => (
        <Announce key={index} type={index % 2 ? 'assertive' : 'polite'}>
          Message {index}
        </Announce>
      ))}
    </>
  );
}

export function StatusChange(): JSX.Element {
  const [friendIsOnline, setFriendIsOnline] = React.useState(false);
  const interval = React.useRef<number | null>(null);

  React.useEffect(() => {
    interval.current = window.setInterval(() => {
      setFriendIsOnline((s) => !s);
    }, getRandomInt(6000, 10000));
    return () => window.clearInterval(interval.current!);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, lineHeight: 1 }}>
      <VisuallyHidden>
        <Announce aria-relevant="all">
          Your friend is {friendIsOnline ? 'online' : 'offline'}
        </Announce>
      </VisuallyHidden>
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          background: friendIsOnline ? 'forestgreen' : 'crimson',
          borderRadius: 5,
        }}
      />{' '}
      Friend status: {friendIsOnline ? 'Online' : 'Offline'}
    </div>
  );
}

function getRandomInt(min = 1, max = 100) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
