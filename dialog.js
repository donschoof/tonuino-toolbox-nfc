$(document).ready(() => {

    let answer = 0;

    let $buttons = $('footer .toolbar-actions button');

    $buttons.click((ev) => {
        let $btn = $(ev.currentTarget);
        answer = $btn.data('answer');

        window.electronAPI.send('answer-from-dialog', {
            answer: answer
        });

    });

    window.electronAPI.on('open-dialog', (args) => {

        $buttons.hide();

        console.log(args);

        if(args.title) {
            $('#title, title').text(args.title);
        }

        if(args.message) {
            $('#message').text(args.message);
        }

        if(args.detail) {
            $('#detail').text(args.detail);
        }

        if(args.buttons) {
            let i = 0;
            args.buttons.forEach((btn) => {

                $('#button_' + i).show().text(btn);
                i++;

            });
        }
    });
});