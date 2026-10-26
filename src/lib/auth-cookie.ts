// Separate from auth.ts so middleware (edge runtime) can import it without pulling in the database.
export const SESSION_COOKIE = "lf_session";
