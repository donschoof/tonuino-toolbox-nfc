let window_actions = {

    $btn_group: null,
    $btns: null,

    init: () => {

        window_actions.$btn_group = $('.window-actions');
        window_actions.$btns = $('.window-actions > li.action-button');

        window_actions.$btns.click((ev) => {
            let $btn = $(ev.currentTarget);
            /*
             * sende commando an den worker über den main prozess
             */
            window.electronAPI.send('mainwindow-action', $btn.data('action'));
        });

    }

};

module.exports = window_actions;