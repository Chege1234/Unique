import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { cn } from "@/utils";

const SelectContext = createContext();

export const Select = ({ children, value, onValueChange, ...props }) => {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);
    const containerRef = useRef(null);

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    // Click-outside lives on the container (trigger + content) so item clicks aren't eaten
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    const handleValueChange = (newValue) => {
        setSelectedValue(newValue);
        if (onValueChange) onValueChange(newValue);
        setOpen(false);
    };

    return (
        <SelectContext.Provider value={{ open, setOpen, selectedValue, handleValueChange }}>
            <div ref={containerRef} {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const { open, setOpen } = useContext(SelectContext);

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                className
            )}
            {...props}
        >
            {children}
            <svg
                className={cn(
                    "h-4 w-4 opacity-50 transition-transform ml-2",
                    open && "rotate-180"
                )}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );
});

export const SelectValue = ({ placeholder }) => {
    const { selectedValue } = useContext(SelectContext);
    const [displayValue, setDisplayValue] = useState(placeholder || "Select...");

    useEffect(() => {
        if (selectedValue) {
            const timer = setTimeout(() => {
                const selectedElement = document.querySelector(`[data-value="${selectedValue}"]`);
                if (selectedElement) setDisplayValue(selectedElement.textContent);
            }, 0);
            return () => clearTimeout(timer);
        } else {
            setDisplayValue(placeholder || "Select...");
        }
    }, [selectedValue, placeholder]);

    return <span>{displayValue}</span>;
};

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
    const { open } = useContext(SelectContext);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-lg",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

export const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
    const { handleValueChange, selectedValue } = useContext(SelectContext);

    return (
        <div
            ref={ref}
            data-value={value}
            onClick={() => handleValueChange(value)}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                selectedValue === value && "bg-accent text-accent-foreground",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
