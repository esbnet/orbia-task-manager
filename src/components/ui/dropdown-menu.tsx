"use client"

import * as React from "react";

import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => { } });

type DropdownMenuProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DropdownMenu = ({ children, open, onOpenChange }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isControlled = typeof open === "boolean";
  const currentOpen = isControlled ? open : isOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setIsOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DropdownMenuContext.Provider value={{ isOpen: currentOpen, setIsOpen: handleOpenChange }}>
      <div className="inline-block relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

  return (
    <div
      ref={ref}
      className={cn("cursor-pointer", className)}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "center", children, ...props }, ref) => {
  const { isOpen } = React.useContext(DropdownMenuContext);
  const alignClass = align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2";

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "top-full z-50 absolute bg-white dark:bg-gray-800 shadow-md mt-2 p-1 border rounded-md min-w-[8rem] overflow-hidden",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onClick, ...props }, ref) => {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center hover:bg-accent focus:bg-accent data-[disabled]:opacity-50 px-2 py-1.5 rounded-sm outline-none text-sm transition-colors hover:text-accent-foreground focus:text-accent-foreground cursor-default data-[disabled]:pointer-events-none select-none",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setIsOpen(false);
        }
      }}
      {...props}
    />
  );
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 font-semibold text-sm", className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
};
