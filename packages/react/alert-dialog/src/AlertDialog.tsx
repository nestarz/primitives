// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import { createContextScope } from '@radix-ui/react-context';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { createDialogScope } from '@radix-ui/react-dialog';
import { composeEventHandlers } from '@radix-ui/primitive';
import { Slottable } from '@radix-ui/react-slot';

import type { CreateScope, Scope } from '@radix-ui/react-context';

/* -------------------------------------------------------------------------------------------------
 * AlertDialog
 * -----------------------------------------------------------------------------------------------*/

const ROOT_NAME = 'AlertDialog';

type ScopedProps<P> = P & { __scopeAlertDialog?: Scope };
const dest = createContextScope(ROOT_NAME, [
    createDialogScope,
]);
const createAlertDialogContext: <ContextValueType extends object | null>(rootComponentName: string, defaultContext?: ContextValueType) => readonly [React.FC<ContextValueType & {
    scope: Scope<ContextValueType>;
    children: React.ReactNode;
}>, (consumerName: string, scope: Scope<ContextValueType | undefined>) => ContextValueType] = dest[0];
const createAlertDialogScope: CreateScope = dest[1];
const useDialogScope = createDialogScope();

type DialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
interface AlertDialogProps extends Omit<DialogProps, 'modal'> {}

const AlertDialog: React.FC<AlertDialogProps> = (props: ScopedProps<AlertDialogProps>) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return <DialogPrimitive.Root {...dialogScope} {...alertDialogProps} modal={true} />;
};

AlertDialog.displayName = ROOT_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTrigger
 * -----------------------------------------------------------------------------------------------*/
const TRIGGER_NAME = 'AlertDialogTrigger';

type AlertDialogTriggerElement = React.ElementRef<typeof DialogPrimitive.Trigger>;
type DialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
interface AlertDialogTriggerProps extends DialogTriggerProps {}

const AlertDialogTrigger: React.ForwardRefExoticComponent<
  AlertDialogTriggerProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<AlertDialogTriggerElement, AlertDialogTriggerProps>(
  (props: ScopedProps<AlertDialogTriggerProps>, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return <DialogPrimitive.Trigger {...dialogScope} {...triggerProps} ref={forwardedRef} />;
  }
);

AlertDialogTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'AlertDialogPortal';

type DialogPortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
interface AlertDialogPortalProps extends DialogPortalProps {}

const AlertDialogPortal: React.FC<AlertDialogPortalProps> = (
  props: ScopedProps<AlertDialogPortalProps>
) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return <DialogPrimitive.Portal {...dialogScope} {...portalProps} />;
};

AlertDialogPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogOverlay
 * -----------------------------------------------------------------------------------------------*/

const OVERLAY_NAME = 'AlertDialogOverlay';

type AlertDialogOverlayElement = React.ElementRef<typeof DialogPrimitive.Overlay>;
type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
interface AlertDialogOverlayProps extends DialogOverlayProps {}

const AlertDialogOverlay: React.ForwardRefExoticComponent<
  AlertDialogOverlayProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<AlertDialogOverlayElement, AlertDialogOverlayProps>(
  (props: ScopedProps<AlertDialogOverlayProps>, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return <DialogPrimitive.Overlay {...dialogScope} {...overlayProps} ref={forwardedRef} />;
  }
);

AlertDialogOverlay.displayName = OVERLAY_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'AlertDialogContent';

type AlertDialogContentContextValue = {
  cancelRef: React.MutableRefObject<AlertDialogCancelElement | null>;
};

const [AlertDialogContentProvider, useAlertDialogContentContext] =
  createAlertDialogContext<AlertDialogContentContextValue>(CONTENT_NAME);

type AlertDialogContentElement = React.ElementRef<typeof DialogPrimitive.Content>;
type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
interface AlertDialogContentProps
  extends Omit<DialogContentProps, 'onPointerDownOutside' | 'onInteractOutside'> {}

const AlertDialogContent: React.ForwardRefExoticComponent<
  AlertDialogContentProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<AlertDialogContentElement, AlertDialogContentProps>(
  (props: ScopedProps<AlertDialogContentProps>, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = React.useRef<AlertDialogContentElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = React.useRef<AlertDialogCancelElement | null>(null);

    return (
      <DialogPrimitive.WarningProvider
        contentName={CONTENT_NAME}
        titleName={TITLE_NAME}
        docsSlug="alert-dialog"
      >
        <AlertDialogContentProvider scope={__scopeAlertDialog} cancelRef={cancelRef}>
          <DialogPrimitive.Content
            role="alertdialog"
            {...dialogScope}
            {...contentProps}
            ref={composedRefs}
            onOpenAutoFocus={composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              event.preventDefault();
              cancelRef.current?.focus({ preventScroll: true });
            })}
            onPointerDownOutside={(event) => event.preventDefault()}
            onInteractOutside={(event) => event.preventDefault()}
          >
            {/**
             * We have to use `Slottable` here as we cannot wrap the `AlertDialogContentProvider`
             * around everything, otherwise the `DescriptionWarning` would be rendered straight away.
             * This is because we want the accessibility checks to run only once the content is actually
             * open and that behaviour is already encapsulated in `DialogContent`.
             */}
            <Slottable>{children}</Slottable>
            {(globalThis as any).process?.env?.NODE_ENV === 'development' && (
              <DescriptionWarning contentRef={contentRef as React.RefObject<HTMLDivElement>} />
            )}
          </DialogPrimitive.Content>
        </AlertDialogContentProvider>
      </DialogPrimitive.WarningProvider>
    );
  }
);

AlertDialogContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogTitle
 * -----------------------------------------------------------------------------------------------*/

const TITLE_NAME = 'AlertDialogTitle';

type AlertDialogTitleElement = React.ElementRef<typeof DialogPrimitive.Title>;
type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
interface AlertDialogTitleProps extends DialogTitleProps {}

const AlertDialogTitle: React.ForwardRefExoticComponent<
  AlertDialogTitleProps & React.RefAttributes<HTMLHeadingElement>
> = React.forwardRef<AlertDialogTitleElement, AlertDialogTitleProps>(
  (props: ScopedProps<AlertDialogTitleProps>, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return <DialogPrimitive.Title {...dialogScope} {...titleProps} ref={forwardedRef} />;
  }
);

AlertDialogTitle.displayName = TITLE_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogDescription
 * -----------------------------------------------------------------------------------------------*/

const DESCRIPTION_NAME = 'AlertDialogDescription';

type AlertDialogDescriptionElement = React.ElementRef<typeof DialogPrimitive.Description>;
type DialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;
interface AlertDialogDescriptionProps extends DialogDescriptionProps {}

const AlertDialogDescription: React.ForwardRefExoticComponent<
  AlertDialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>
> = React.forwardRef<AlertDialogDescriptionElement, AlertDialogDescriptionProps>(
  (props: ScopedProps<AlertDialogDescriptionProps>, forwardedRef) => {
    const { __scopeAlertDialog, ...descriptionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return (
      <DialogPrimitive.Description {...dialogScope} {...descriptionProps} ref={forwardedRef} />
    );
  }
);

AlertDialogDescription.displayName = DESCRIPTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogAction
 * -----------------------------------------------------------------------------------------------*/

const ACTION_NAME = 'AlertDialogAction';

type AlertDialogActionElement = React.ElementRef<typeof DialogPrimitive.Close>;
type DialogCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;
interface AlertDialogActionProps extends DialogCloseProps {}

const AlertDialogAction: React.ForwardRefExoticComponent<
  AlertDialogActionProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<AlertDialogActionElement, AlertDialogActionProps>(
  (props: ScopedProps<AlertDialogActionProps>, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return <DialogPrimitive.Close {...dialogScope} {...actionProps} ref={forwardedRef} />;
  }
);

AlertDialogAction.displayName = ACTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * AlertDialogCancel
 * -----------------------------------------------------------------------------------------------*/

const CANCEL_NAME = 'AlertDialogCancel';

type AlertDialogCancelElement = React.ElementRef<typeof DialogPrimitive.Close>;
interface AlertDialogCancelProps extends DialogCloseProps {}

const AlertDialogCancel: React.ForwardRefExoticComponent<
  AlertDialogCancelProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<AlertDialogCancelElement, AlertDialogCancelProps>(
  (props: ScopedProps<AlertDialogCancelProps>, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return <DialogPrimitive.Close {...dialogScope} {...cancelProps} ref={ref} />;
  }
);

AlertDialogCancel.displayName = CANCEL_NAME;

/* ---------------------------------------------------------------------------------------------- */

type DescriptionWarningProps = {
  contentRef: React.RefObject<AlertDialogContentElement>;
};

const DescriptionWarning: React.FC<DescriptionWarningProps> = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;

  React.useEffect(() => {
    const hasDescription = document.getElementById(
      contentRef.current?.getAttribute('aria-describedby')!
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);

  return null;
};

const Root: React.FC<AlertDialogProps> = AlertDialog;
const Trigger: React.ForwardRefExoticComponent<
  AlertDialogTriggerProps & React.RefAttributes<HTMLButtonElement>
> = AlertDialogTrigger;
const Portal: React.FC<AlertDialogPortalProps> = AlertDialogPortal;
const Overlay: React.ForwardRefExoticComponent<
  AlertDialogOverlayProps & React.RefAttributes<HTMLDivElement>
> = AlertDialogOverlay;
const Content: React.ForwardRefExoticComponent<
  AlertDialogContentProps & React.RefAttributes<HTMLDivElement>
> = AlertDialogContent;
const Action: React.ForwardRefExoticComponent<
  AlertDialogActionProps & React.RefAttributes<HTMLButtonElement>
> = AlertDialogAction;
const Cancel: React.ForwardRefExoticComponent<
  AlertDialogCancelProps & React.RefAttributes<HTMLButtonElement>
> = AlertDialogCancel;
const Title: React.ForwardRefExoticComponent<
  AlertDialogTitleProps & React.RefAttributes<HTMLHeadingElement>
> = AlertDialogTitle;
const Description: React.ForwardRefExoticComponent<
  AlertDialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>
> = AlertDialogDescription;

export {
  createAlertDialogScope,
  //
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogDescription,
  //
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Action,
  Cancel,
  Title,
  Description,
};
export type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogPortalProps,
  AlertDialogOverlayProps,
  AlertDialogContentProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
};
