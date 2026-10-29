// The Vercel function. It imports the compiled backend, not its sources, so no
// bundler has to resolve `.js` specifiers to `.ts` across workspaces (spec 002).
// No ensureDatabase here: both drivers connect on first use, so an unreachable
// store answers the RF-8 JSON instead of failing the function's cold start.
import createApp from "../apps/backend/dist/app.js";

export default createApp();
