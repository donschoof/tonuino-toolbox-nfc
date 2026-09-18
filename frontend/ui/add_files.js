const logger = require('../logger');

let add_files = {

    $btn: null,

    init: () => {
        add_files.$btn = $('#btn-add-files');

        add_files.initEvents();

        window.electronAPI.on('mp3s-choosed', (files) => {

            add_files.add(files);

        });

    },

    initEvents: () => {

        add_files.$btn.click(() => {

            if(theapp.folder) {
                window.electronAPI.send('open-mp3-chooser');
            }
            else {
                alert('Du musst erst einen Ordner wählen');
            }

        });

    },

    add: (files) => {
        if(files && files.length > 0) {

            files.sort();

            theapp.showMainLoader();

            worker_api.command('add_files', {
                data: {
                    files: files,
                    folder: theapp.folder
                },
                success: (response) => {

                    logger.log(response);
                    theapp.setMp3sForFolder(response.folder.title);
                    theapp.setFolder(response.folder);
                    folder_list.replaceFolder(response.folder);
                    folder_list.activateFolder(response.folder.folder_name);
                    theapp.hideMainLoader();

                }
            });

        }
    }


};

module.exports = add_files;