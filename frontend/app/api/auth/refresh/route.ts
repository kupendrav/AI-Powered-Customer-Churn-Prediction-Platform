import { createRefreshAuthRouter } from "@insforge/sdk/ssr";
import { insforgeConfig } from "@/lib/insforge/config";

export const { POST } = createRefreshAuthRouter(insforgeConfig);
