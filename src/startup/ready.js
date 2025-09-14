// src/startup/ready.js
export function markReady() {
  window.__NYXOPS_READY__ = true;
  window.dispatchEvent(new Event("nyx:ready"));
}