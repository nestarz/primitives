// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import { composeEventHandlers } from '@radix-ui/primitive';
import { composeRefs } from '@radix-ui/react-compose-refs';
import { createContextScope } from '@radix-ui/react-context';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { Primitive } from '@radix-ui/react-primitive';
import * as MenuPrimitive from '@radix-ui/react-menu';
import { createMenuScope } from '@radix-ui/react-menu';
import { useId } from '@radix-ui/react-id';

import type { CreateScope, Scope } from '@radix-ui/react-context';

type Direction = 'ltr' | 'rtl';

/* -------------------------------------------------------------------------------------------------
 * DropdownMenu
 * -----------------------------------------------------------------------------------------------*/

const DROPDOWN_MENU_NAME = 'DropdownMenu';

type ScopedProps<P> = P & { __scopeDropdownMenu?: Scope };
const dest = createContextScope(
    DROPDOWN_MENU_NAME,
    [createMenuScope]
);
const createDropdownMenuContext: <ContextValueType extends object | null>(rootComponentName: string, defaultContext?: ContextValueType) => readonly [React.FC<ContextValueType & {
    scope: Scope<ContextValueType>;
    children: React.ReactNode;
}>, (consumerName: string, scope: Scope<ContextValueType | undefined>) => ContextValueType] = dest[0];
const createDropdownMenuScope: CreateScope = dest[1];
const useMenuScope = createMenuScope();

type DropdownMenuContextValue = {
  triggerId: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentId: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  modal: boolean;
};

const [DropdownMenuProvider, useDropdownMenuContext] =
  createDropdownMenuContext<DropdownMenuContextValue>(DROPDOWN_MENU_NAME);

interface DropdownMenuProps {
  children?: React.ReactNode;
  dir?: Direction;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  modal?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = (props: ScopedProps<DropdownMenuProps>) => {
  const {
    __scopeDropdownMenu,
    children,
    dir,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true,
  } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <DropdownMenuProvider
      scope={__scopeDropdownMenu}
      triggerId={useId()}
      triggerRef={triggerRef}
      contentId={useId()}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen])}
      modal={modal}
    >
      <MenuPrimitive.Root {...menuScope} open={open} onOpenChange={setOpen} dir={dir} modal={modal}>
        {children}
      </MenuPrimitive.Root>
    </DropdownMenuProvider>
  );
};

DropdownMenu.displayName = DROPDOWN_MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'DropdownMenuTrigger';

type DropdownMenuTriggerElement = React.ElementRef<typeof Primitive.button>;
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>;
interface DropdownMenuTriggerProps extends PrimitiveButtonProps {}

const DropdownMenuTrigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>> = React.forwardRef<DropdownMenuTriggerElement, DropdownMenuTriggerProps>(
  (props: ScopedProps<DropdownMenuTriggerProps>, forwardedRef) => {
    const { __scopeDropdownMenu, disabled = false, ...triggerProps } = props;
    const context = useDropdownMenuContext(TRIGGER_NAME, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return (
      <MenuPrimitive.Anchor asChild {...menuScope}>
        <Primitive.button
          type="button"
          id={context.triggerId}
          aria-haspopup="menu"
          aria-expanded={context.open}
          aria-controls={context.open ? context.contentId : undefined}
          data-state={context.open ? 'open' : 'closed'}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          {...triggerProps}
          ref={composeRefs(forwardedRef, context.triggerRef)}
          onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
            // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
            // but not when the control key is pressed (avoiding MacOS right click)
            if (!disabled && event.button === 0 && event.ctrlKey === false) {
              context.onOpenToggle();
              // prevent trigger focusing when opening
              // this allows the content to be given focus without competition
              if (!context.open) event.preventDefault();
            }
          })}
          onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
            if (disabled) return;
            if (['Enter', ' '].includes(event.key)) context.onOpenToggle();
            if (event.key === 'ArrowDown') context.onOpenChange(true);
            // prevent keydown from scrolling window / first focused item to execute
            // that keydown (inadvertently closing the menu)
            if (['Enter', ' ', 'ArrowDown'].includes(event.key)) event.preventDefault();
          })}
        />
      </MenuPrimitive.Anchor>
    );
  }
);

DropdownMenuTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'DropdownMenuPortal';

type MenuPortalProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Portal>;
interface DropdownMenuPortalProps extends MenuPortalProps {}

const DropdownMenuPortal: React.FC<DropdownMenuPortalProps> = (
  props: ScopedProps<DropdownMenuPortalProps>
) => {
  const { __scopeDropdownMenu, ...portalProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return <MenuPrimitive.Portal {...menuScope} {...portalProps} />;
};

DropdownMenuPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'DropdownMenuContent';

type DropdownMenuContentElement = React.ElementRef<typeof MenuPrimitive.Content>;
type MenuContentProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Content>;
interface DropdownMenuContentProps extends Omit<MenuContentProps, 'onEntryFocus'> {}

const DropdownMenuContent: React.ForwardRefExoticComponent<DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<DropdownMenuContentElement, DropdownMenuContentProps>(
  (props: ScopedProps<DropdownMenuContentProps>, forwardedRef) => {
    const { __scopeDropdownMenu, ...contentProps } = props;
    const context = useDropdownMenuContext(CONTENT_NAME, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    const hasInteractedOutsideRef = React.useRef(false);

    return (
      <MenuPrimitive.Content
        id={context.contentId}
        aria-labelledby={context.triggerId}
        {...menuScope}
        {...contentProps}
        ref={forwardedRef}
        onCloseAutoFocus={composeEventHandlers(props.onCloseAutoFocus, (event) => {
          if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
          hasInteractedOutsideRef.current = false;
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        })}
        onInteractOutside={composeEventHandlers(props.onInteractOutside, (event) => {
          const originalEvent = event.detail.originalEvent as PointerEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true;
        })}
        style={{
          ...props.style,
          // re-namespace exposed content custom properties
          ...{
            '--radix-dropdown-menu-content-transform-origin':
              'var(--radix-popper-transform-origin)',
            '--radix-dropdown-menu-content-available-width': 'var(--radix-popper-available-width)',
            '--radix-dropdown-menu-content-available-height':
              'var(--radix-popper-available-height)',
            '--radix-dropdown-menu-trigger-width': 'var(--radix-popper-anchor-width)',
            '--radix-dropdown-menu-trigger-height': 'var(--radix-popper-anchor-height)',
          },
        }}
      />
    );
  }
);

DropdownMenuContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuGroup
 * -----------------------------------------------------------------------------------------------*/

const GROUP_NAME = 'DropdownMenuGroup';

type DropdownMenuGroupElement = React.ElementRef<typeof MenuPrimitive.Group>;
type MenuGroupProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Group>;
interface DropdownMenuGroupProps extends MenuGroupProps {}

const DropdownMenuGroup: React.ForwardRefExoticComponent<DropdownMenuGroupProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<DropdownMenuGroupElement, DropdownMenuGroupProps>(
  (props: ScopedProps<DropdownMenuGroupProps>, forwardedRef) => {
    const { __scopeDropdownMenu, ...groupProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return <MenuPrimitive.Group {...menuScope} {...groupProps} ref={forwardedRef} />;
  }
);

DropdownMenuGroup.displayName = GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuLabel
 * -----------------------------------------------------------------------------------------------*/

const LABEL_NAME = 'DropdownMenuLabel';

type DropdownMenuLabelElement = React.ElementRef<typeof MenuPrimitive.Label>;
type MenuLabelProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Label>;
interface DropdownMenuLabelProps extends MenuLabelProps {}

const DropdownMenuLabel: React.ForwardRefExoticComponent<DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<DropdownMenuLabelElement, DropdownMenuLabelProps>(
  (props: ScopedProps<DropdownMenuLabelProps>, forwardedRef) => {
    const { __scopeDropdownMenu, ...labelProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return <MenuPrimitive.Label {...menuScope} {...labelProps} ref={forwardedRef} />;
  }
);

DropdownMenuLabel.displayName = LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuItem
 * -----------------------------------------------------------------------------------------------*/

const ITEM_NAME = 'DropdownMenuItem';

type DropdownMenuItemElement = React.ElementRef<typeof MenuPrimitive.Item>;
type MenuItemProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item>;
interface DropdownMenuItemProps extends MenuItemProps {}

const DropdownMenuItem: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<DropdownMenuItemElement, DropdownMenuItemProps>(
  (props: ScopedProps<DropdownMenuItemProps>, forwardedRef) => {
    const { __scopeDropdownMenu, ...itemProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return <MenuPrimitive.Item {...menuScope} {...itemProps} ref={forwardedRef} />;
  }
);

DropdownMenuItem.displayName = ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuCheckboxItem
 * -----------------------------------------------------------------------------------------------*/

const CHECKBOX_ITEM_NAME = 'DropdownMenuCheckboxItem';

type DropdownMenuCheckboxItemElement = React.ElementRef<typeof MenuPrimitive.CheckboxItem>;
type MenuCheckboxItemProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem>;
interface DropdownMenuCheckboxItemProps extends MenuCheckboxItemProps {}

const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<
  DropdownMenuCheckboxItemElement,
  DropdownMenuCheckboxItemProps
>((props: ScopedProps<DropdownMenuCheckboxItemProps>, forwardedRef) => {
  const { __scopeDropdownMenu, ...checkboxItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return <MenuPrimitive.CheckboxItem {...menuScope} {...checkboxItemProps} ref={forwardedRef} />;
});

DropdownMenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuRadioGroup
 * -----------------------------------------------------------------------------------------------*/

const RADIO_GROUP_NAME = 'DropdownMenuRadioGroup';

type DropdownMenuRadioGroupElement = React.ElementRef<typeof MenuPrimitive.RadioGroup>;
type MenuRadioGroupProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.RadioGroup>;
interface DropdownMenuRadioGroupProps extends MenuRadioGroupProps {}

const DropdownMenuRadioGroup: React.ForwardRefExoticComponent<DropdownMenuRadioGroupProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<
  DropdownMenuRadioGroupElement,
  DropdownMenuRadioGroupProps
>((props: ScopedProps<DropdownMenuRadioGroupProps>, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioGroupProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return <MenuPrimitive.RadioGroup {...menuScope} {...radioGroupProps} ref={forwardedRef} />;
});

DropdownMenuRadioGroup.displayName = RADIO_GROUP_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuRadioItem
 * -----------------------------------------------------------------------------------------------*/

const RADIO_ITEM_NAME = 'DropdownMenuRadioItem';

type DropdownMenuRadioItemElement = React.ElementRef<typeof MenuPrimitive.RadioItem>;
type MenuRadioItemProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>;
interface DropdownMenuRadioItemProps extends MenuRadioItemProps {}

const DropdownMenuRadioItem: React.ForwardRefExoticComponent<DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<
  DropdownMenuRadioItemElement,
  DropdownMenuRadioItemProps
>((props: ScopedProps<DropdownMenuRadioItemProps>, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return <MenuPrimitive.RadioItem {...menuScope} {...radioItemProps} ref={forwardedRef} />;
});

DropdownMenuRadioItem.displayName = RADIO_ITEM_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuItemIndicator
 * -----------------------------------------------------------------------------------------------*/

const INDICATOR_NAME = 'DropdownMenuItemIndicator';

type DropdownMenuItemIndicatorElement = React.ElementRef<typeof MenuPrimitive.ItemIndicator>;
type MenuItemIndicatorProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.ItemIndicator>;
interface DropdownMenuItemIndicatorProps extends MenuItemIndicatorProps {}

const DropdownMenuItemIndicator: React.ForwardRefExoticComponent<DropdownMenuItemIndicatorProps & React.RefAttributes<HTMLSpanElement>> = React.forwardRef<
  DropdownMenuItemIndicatorElement,
  DropdownMenuItemIndicatorProps
>((props: ScopedProps<DropdownMenuItemIndicatorProps>, forwardedRef) => {
  const { __scopeDropdownMenu, ...itemIndicatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return <MenuPrimitive.ItemIndicator {...menuScope} {...itemIndicatorProps} ref={forwardedRef} />;
});

DropdownMenuItemIndicator.displayName = INDICATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSeparator
 * -----------------------------------------------------------------------------------------------*/

const SEPARATOR_NAME = 'DropdownMenuSeparator';

type DropdownMenuSeparatorElement = React.ElementRef<typeof MenuPrimitive.Separator>;
type MenuSeparatorProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>;
interface DropdownMenuSeparatorProps extends MenuSeparatorProps {}

const DropdownMenuSeparator: React.ForwardRefExoticComponent<DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<
  DropdownMenuSeparatorElement,
  DropdownMenuSeparatorProps
>((props: ScopedProps<DropdownMenuSeparatorProps>, forwardedRef) => {
  const { __scopeDropdownMenu, ...separatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return <MenuPrimitive.Separator {...menuScope} {...separatorProps} ref={forwardedRef} />;
});

DropdownMenuSeparator.displayName = SEPARATOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'DropdownMenuArrow';

type DropdownMenuArrowElement = React.ElementRef<typeof MenuPrimitive.Arrow>;
type MenuArrowProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Arrow>;
interface DropdownMenuArrowProps extends MenuArrowProps {}

const DropdownMenuArrow: React.ForwardRefExoticComponent<DropdownMenuArrowProps & React.RefAttributes<SVGSVGElement>> = React.forwardRef<DropdownMenuArrowElement, DropdownMenuArrowProps>(
  (props: ScopedProps<DropdownMenuArrowProps>, forwardedRef) => {
    const { __scopeDropdownMenu, ...arrowProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return <MenuPrimitive.Arrow {...menuScope} {...arrowProps} ref={forwardedRef} />;
  }
);

DropdownMenuArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSub
 * -----------------------------------------------------------------------------------------------*/

interface DropdownMenuSubProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}

const DropdownMenuSub: React.FC<DropdownMenuSubProps> = (
  props: ScopedProps<DropdownMenuSubProps>
) => {
  const { __scopeDropdownMenu, children, open: openProp, onOpenChange, defaultOpen } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <MenuPrimitive.Sub {...menuScope} open={open} onOpenChange={setOpen}>
      {children}
    </MenuPrimitive.Sub>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSubTrigger
 * -----------------------------------------------------------------------------------------------*/

const SUB_TRIGGER_NAME = 'DropdownMenuSubTrigger';

type DropdownMenuSubTriggerElement = React.ElementRef<typeof MenuPrimitive.SubTrigger>;
type MenuSubTriggerProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubTrigger>;
interface DropdownMenuSubTriggerProps extends MenuSubTriggerProps {}

const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<DropdownMenuSubTriggerProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<
  DropdownMenuSubTriggerElement,
  DropdownMenuSubTriggerProps
>((props: ScopedProps<DropdownMenuSubTriggerProps>, forwardedRef) => {
  const { __scopeDropdownMenu, ...subTriggerProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return <MenuPrimitive.SubTrigger {...menuScope} {...subTriggerProps} ref={forwardedRef} />;
});

DropdownMenuSubTrigger.displayName = SUB_TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * DropdownMenuSubContent
 * -----------------------------------------------------------------------------------------------*/

const SUB_CONTENT_NAME = 'DropdownMenuSubContent';

type DropdownMenuSubContentElement = React.ElementRef<typeof MenuPrimitive.Content>;
type MenuSubContentProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubContent>;
interface DropdownMenuSubContentProps extends MenuSubContentProps {}

const DropdownMenuSubContent: React.ForwardRefExoticComponent<DropdownMenuSubContentProps & React.RefAttributes<HTMLDivElement>> = React.forwardRef<
  DropdownMenuSubContentElement,
  DropdownMenuSubContentProps
>((props: ScopedProps<DropdownMenuSubContentProps>, forwardedRef) => {
  const { __scopeDropdownMenu, ...subContentProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);

  return (
    <MenuPrimitive.SubContent
      {...menuScope}
      {...subContentProps}
      ref={forwardedRef}
      style={{
        ...props.style,
        // re-namespace exposed content custom properties
        ...{
          '--radix-dropdown-menu-content-transform-origin': 'var(--radix-popper-transform-origin)',
          '--radix-dropdown-menu-content-available-width': 'var(--radix-popper-available-width)',
          '--radix-dropdown-menu-content-available-height': 'var(--radix-popper-available-height)',
          '--radix-dropdown-menu-trigger-width': 'var(--radix-popper-anchor-width)',
          '--radix-dropdown-menu-trigger-height': 'var(--radix-popper-anchor-height)',
        },
      }}
    />
  );
});

DropdownMenuSubContent.displayName = SUB_CONTENT_NAME;

/* -----------------------------------------------------------------------------------------------*/

const Root: React.FC<DropdownMenuProps> = DropdownMenu;
const Trigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>> = DropdownMenuTrigger;
const Portal: React.FC<DropdownMenuPortalProps> = DropdownMenuPortal;
const Content: React.ForwardRefExoticComponent<DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuContent;
const Group: React.ForwardRefExoticComponent<DropdownMenuGroupProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuGroup;
const Label: React.ForwardRefExoticComponent<DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuLabel;
const Item: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuItem;
const CheckboxItem: React.ForwardRefExoticComponent<DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuCheckboxItem;
const RadioGroup: React.ForwardRefExoticComponent<DropdownMenuRadioGroupProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuRadioGroup;
const RadioItem: React.ForwardRefExoticComponent<DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuRadioItem;
const ItemIndicator: React.ForwardRefExoticComponent<DropdownMenuItemIndicatorProps & React.RefAttributes<HTMLSpanElement>> = DropdownMenuItemIndicator;
const Separator: React.ForwardRefExoticComponent<DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuSeparator;
const Arrow: React.ForwardRefExoticComponent<DropdownMenuArrowProps & React.RefAttributes<SVGSVGElement>> = DropdownMenuArrow;
const Sub: React.FC<DropdownMenuSubProps> = DropdownMenuSub;
const SubTrigger: React.ForwardRefExoticComponent<DropdownMenuSubTriggerProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuSubTrigger;
const SubContent: React.ForwardRefExoticComponent<DropdownMenuSubContentProps & React.RefAttributes<HTMLDivElement>> = DropdownMenuSubContent;

export {
  createDropdownMenuScope,
  //
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  //
  Root,
  Trigger,
  Portal,
  Content,
  Group,
  Label,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
  Arrow,
  Sub,
  SubTrigger,
  SubContent,
};
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuPortalProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuLabelProps,
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuItemIndicatorProps,
  DropdownMenuSeparatorProps,
  DropdownMenuArrowProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
};
