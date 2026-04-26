"use client";

import * as React from "react";
import NextLink, { type LinkProps } from "next/link";

// Client component wrapper — used by ThemeRegistry to set MuiLink + MuiButtonBase defaults.
// This keeps NextLink out of server component prop trees (functions can't cross the RSC boundary).
const LinkBehaviour = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkBehaviour(props, ref) {
    return <NextLink ref={ref} {...props} />;
  }
);

LinkBehaviour.displayName = "LinkBehaviour";

export default LinkBehaviour;
