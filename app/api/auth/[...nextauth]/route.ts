// Auth.js request handlers — serves sign-in, sign-out, magic-link callback,
// session and CSRF endpoints under /api/auth/*.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
