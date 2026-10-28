"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { StyledComponentsRegistry } from "./StyledComponentsRegistry";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <StyledComponentsRegistry>
        <StoreProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </StoreProvider>
      </StyledComponentsRegistry>
    </AntdRegistry>
  );
}
