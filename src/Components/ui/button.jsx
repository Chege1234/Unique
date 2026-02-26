import React from "react";
export const Button = React.forwardRef((props, ref) => <div ref={ref} {...props} />);