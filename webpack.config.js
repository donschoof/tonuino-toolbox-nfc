const path = require('path');

/*
 * Bundles the two DOM-facing renderers (main window / index.html and the
 * modal dialog / dialog.html) for contextIsolation. Both used to pull in
 * jquery, jquery-ui-dist and their own app code via inline require() calls
 * that ran directly in the page thanks to Node integration; contextIsolation
 * removes require() from the page, so everything they need now has to be
 * bundled into a plain <script src="dist/...js"> instead.
 *
 * The worker window (worker.html) is NOT bundled - its Node-heavy logic
 * (fs, node-disk-info, node-id3, music-metadata, ...) keeps running
 * unchanged via preload-worker.js, which has full Node access regardless
 * of contextIsolation. See preload-worker.js for details.
 */
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'web',
  devtool: false,
  entry: {
    index: path.resolve(__dirname, 'frontend', 'entry.js'),
    dialog: path.resolve(__dirname, 'dialog_entry.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  node: false
};
