// node --env-file=.env scripts/auth-status.mjs
import { checkAuthStatus } from '../src/shopee/auth.js';

console.log(checkAuthStatus());
