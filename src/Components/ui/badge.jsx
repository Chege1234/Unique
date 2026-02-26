import React from "react";
export const Badge = React.forwardRef((props, ref) => <div ref={ref} {...props} />);