import "styled-components";
import type { StyledTheme } from "./styledTheme";

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends StyledTheme {}
}
