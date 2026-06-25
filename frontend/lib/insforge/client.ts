import { createBrowserClient } from "@insforge/sdk/ssr";
import { insforgeConfig } from "./config";

export const insforge = createBrowserClient(insforgeConfig);
