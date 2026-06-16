import React, { useState, useEffect, useMemo } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

/**
 * MobileSelect - Uses native Select on desktop, Drawer-based select on mobile
 * Props: value, onValueChange, children (SelectItem elements), className, triggerClassName
 */
const MobileSelect = React.forwardRef(({ 
  value, 
  onValueChange, 
  children, 
  className,
  triggerClassName,
  ...props 
}, ref) => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get selected label from children
  const selectedLabel = useMemo(() => {
    let label = '';
    React.Children.forEach(children, (child) => {
      if (child?.props?.value === value) {
        label = child.props.children;
      }
    });
    return label;
  }, [children, value]);

  if (isMobile) {
    return (
      <>
        <Button
          ref={ref}
          type="button"
          onClick={() => setOpen(true)}
          variant="outline"
          className={cn('justify-between w-full', triggerClassName)}
        >
          <span className="line-clamp-1">{selectedLabel || 'Select...'}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Select option</DrawerTitle>
            </DrawerHeader>
            <div className="px-6 pb-8 space-y-2 max-h-96 overflow-y-auto">
              {React.Children.map(children, (child) => (
                <button
                  key={child?.props?.value}
                  onClick={() => {
                    onValueChange(child?.props?.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg transition-colors',
                    value === child?.props?.value
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                >
                  {child?.props?.children}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: use native Select
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} {...props}>
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          triggerClassName
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            className
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});

MobileSelect.displayName = 'MobileSelect';

export { MobileSelect };