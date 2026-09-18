let autoupdate = {

    init: () => {

        window.electronAPI.on('update-available', () => {
            window.electronAPI.removeAllListeners('update-available');
            msg.info('Lade Update herunter...',{
                heading: 'Update Verfügbar'
            });
        });
        window.electronAPI.on('update-downloaded', () => {
            window.electronAPI.removeAllListeners('update-downloaded');

            dialog.open({
                title: 'Update installieren',
                message: 'Update jetzt installieren?',
                detail: 'Ein neues Update wurde heruntergeladen und steht jetzt bereit zur Installation. Für Die Installation wird Tonuino-Toolkit einmal neu gestartet.',
                buttons: ['Nein, jetzt nicht', 'Ja, Update jetzt installieren']
            }, (response) => {

                /*
                 * Ja Update installieren geklickt.
                 */
                if(response.answer === 2) {
                    window.electronAPI.send('restart-app');
                }

            });

        });

    }

};

module.exports = autoupdate;