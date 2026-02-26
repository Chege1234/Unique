const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'Components', 'ui');
fs.mkdirSync(dir, { recursive: true });

const components = ['alert', 'badge', 'button', 'input', 'label', 'select', 'switch', 'tabs', 'textarea'];

for (const comp of components) {
    const content = `
import React from "react";
export const ${comp.charAt(0).toUpperCase() + comp.slice(1)} = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
`;
    fs.writeFileSync(path.join(dir, `${comp}.jsx`), content.trim());
}

// Special case for Card exports
const cardContent = `
import React from "react";
export const Card = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const CardHeader = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const CardTitle = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const CardDescription = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const CardContent = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const CardFooter = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
`;
fs.writeFileSync(path.join(dir, 'card.jsx'), cardContent.trim());

// Special case for Dialog exports
const dialogContent = `
import React from "react";
export const Dialog = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const DialogTrigger = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const DialogContent = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const DialogHeader = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const DialogFooter = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const DialogTitle = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const DialogDescription = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
`;
fs.writeFileSync(path.join(dir, 'dialog.jsx'), dialogContent.trim());

// Special case for Alert exports
const alertContent = `
import React from "react";
export const Alert = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const AlertDescription = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
`;
fs.writeFileSync(path.join(dir, 'alert.jsx'), alertContent.trim());

// Special case for Select exports
const selectContent = `
import React from "react";
export const Select = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const SelectTrigger = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const SelectContent = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const SelectItem = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const SelectValue = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
`;
fs.writeFileSync(path.join(dir, 'select.jsx'), selectContent.trim());


// Special case for Tabs exports
const tabsContent = `
import React from "react";
export const Tabs = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const TabsList = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const TabsTrigger = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const TabsContent = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
`;
fs.writeFileSync(path.join(dir, 'tabs.jsx'), tabsContent.trim());

console.log('Created comprehensive dummy ui components.');
