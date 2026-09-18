const logger = require('./logger');

let dialog = {

    callback: null,

    init: () => {

        window.electronAPI.on('answer-from-dialog', (arg) => {

            logger.log(dialog.callback);
            if(dialog.callback) {
                dialog.callback(arg);
                dialog.callback = null;
            }
        });

    },

    open: (options, callback) => {

        dialog.callback = null;

        if(callback !== undefined) {
            dialog.callback = callback;
        }

        window.electronAPI.send('open-dialog', options);

    }

};

module.exports = dialog;