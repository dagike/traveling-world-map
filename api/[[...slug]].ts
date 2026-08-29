// Vercel routes every /api/* request to this optional catch-all function.
// The real handler lives in the server workspace so it can be tested directly.
export { default } from "../server/src/serverless.js";
