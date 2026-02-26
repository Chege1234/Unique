import React from "react";
export const Alert = React.forwardRef((props, ref) => <div ref={ref} {...props} />);
export const AlertDescription = React.forwardRef((props, ref) => <div ref={ref} {...props} />);