const logger = require('../logger');

let about_link = {

    $btn: null,

    init: () => {

        about_link.$btn = $('#about-link');

        about_link.$btn.click(() => {
            logger.log('open link');
            window.electronAPI.openExternal('https://geldfrei.net');
        });

    }
};

module.exports = about_link;