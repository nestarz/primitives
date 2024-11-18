// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
// @ts-types="npm:types-react-dom@^19.0.0-rc"
import ReactDOM from 'react-dom';
import { Primitive } from '@radix-ui/react-primitive';
import { useLayoutEffect } from '@radix-ui/react-use-layout-effect';

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'Portal';

type PortalElement = React.ElementRef<typeof Primitive.div>;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>;
interface PortalProps extends PrimitiveDivProps {
  /**
   * An optional container where the portaled content should be appended.
   */
  container?: Element | DocumentFragment | null;
}

const Portal: React.ForwardRefExoticComponent<PortalProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<PortalElement, PortalProps>((props, forwardedRef) => {
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = React.useState(false);
  useLayoutEffect(() => setMounted(true), []);
  const container = containerProp || (mounted && globalThis?.document?.body);
  return container
    ? ReactDOM.createPortal(<Primitive.div {...portalProps} ref={forwardedRef} />, container)
    : null;
});

Portal.displayName = PORTAL_NAME;

/* -----------------------------------------------------------------------------------------------*/

const Root: React.ForwardRefExoticComponent<PortalProps & React.RefAttributes<HTMLDivElement>> = Portal;

export {
  Portal,
  //
  Root,
};
export type { PortalProps };
