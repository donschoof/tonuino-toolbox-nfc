/*
 * Webpack entry point for the modal dialog window (dialog.html). Replaces
 * the inline `require('jquery')` / `require('jquery-ui-dist/jquery-ui')` /
 * `require('./dialog')` script tags - see frontend/entry.js for why.
 */
window.$ = window.jQuery = require('jquery');
require('jquery-ui-dist/jquery-ui');
require('./dialog');
