import React from "react";
export const Label = React.forwardRef((props, ref) => <label ref={ref} {...props} />);