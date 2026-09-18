/*
 * Webpack entry point for the main window (index.html). Replaces the
 * inline `require('jquery')` / `require('jquery-ui-dist/jquery-ui')` /
 * `require('./frontend/start')` script tags that used to run directly in
 * the page via Node integration - contextIsolation removes require() from
 * the page, so this now gets bundled into dist/index.bundle.js instead.
 */
window.$ = window.jQuery = require('jquery');
require('jquery-ui-dist/jquery-ui');
require('./start');
