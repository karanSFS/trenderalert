export const APP_NAME = "TrenderAlert";
export const APP_TAGLINE = "See It First";
export const APP_OPENING_LINE = "See Tomorrow. Today.";

/** Sign-in uses the backend; every admin module still runs on local mock data. */
export const DEMO_MODE = true;

export const ADMIN_HOME_PATH = "/admin/dashboard";
export const ADMIN_LOGIN_PATH = "/admin/login";

export const STORAGE_KEYS = {
  layout: "ta.layout",
} as const;

/** Keys from earlier versions, removed on load. */
export const LEGACY_STORAGE_KEYS = ["ta.demoSession"] as const;
