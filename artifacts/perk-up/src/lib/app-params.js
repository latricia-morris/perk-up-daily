// app-params.js — stub replacing Base44 URL parameter handling.
// Our app does not rely on Base44 URL tokens; this file exists only
// to satisfy imports that have not yet been updated.

export const appParams = {
  appId: 'perkup',
  token: null,
  functionsVersion: null,
  appBaseUrl: null,
  fromUrl: typeof window !== 'undefined' ? window.location.href : '/',
};
