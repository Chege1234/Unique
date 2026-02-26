import React from "react";
export const Button = React.forwardRef((props, ref) => <button ref={ref} {...props} />);