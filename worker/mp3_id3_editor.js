// The Promise-based API keeps the same rejecting-on-error behaviour the
// old code relied on (plain NodeID3.update()/.create() are synchronous
// as of node-id3 0.2.x and return an Error value instead of throwing).
const NodeID3 = require('node-id3').Promise;
const path = require('path');
const fs = require('fs');
const logger = require('../logger');

// music-metadata is ESM-only, loaded lazily via dynamic import().
let _musicMetadataPromise = null;
const getMusicMetadata = () => {
    if (!_musicMetadataPromise) {
        _musicMetadataPromise = import('music-metadata');
    }
    return _musicMetadataPromise;
};

// Adapts music-metadata's result shape back to the old "musicmetadata" shape.
const metadata = async (filePath) => {
    const mm = await getMusicMetadata();
    const parsed = await mm.parseFile(filePath);
    const common = parsed.common || {};

    return {
        title: common.title,
        artist: common.artist !== undefined ? [common.artist] : undefined,
        track: common.track,
        album: common.album,
        picture: common.picture
    };
};

const mp3_id3_editor = {

    updateTag: async (file_path, tag, value) => {

        /*
         * vorhandene Tag Daten holen
         */
        let tag_data = await mp3_id3_editor.readMeta(file_path);

        /*
         * Neuen Tag Wert setzen
         */
        tag_data[tag] = value;

        /*
         * In Datei schreiben
         */
        let values = {};
        values[tag] = value;

        logger.log('update tag');
        logger.log(tag, value);

        try {
            await NodeID3.update(values, file_path);
            return tag_data;
        }
        catch (e) {
            logger.error('update tag error');
            logger.error(e);
        }

        return false;

    },

    readMeta: async (file_path) => {

        let meta = null;
        let tags = {
            title: path.basename(file_path),
            track: '',
            album: '',
            artist: '',
            trackNumber: ''
        };

        try {
            meta = await metadata(file_path);

            if(meta.title !== undefined) {
                tags.title = meta.title;
            }
            if(meta.artist !== undefined && meta.artist.length > 0) {
                tags.artist = meta.artist.join(',');
            }
            if(meta.track !== undefined && meta.track.no !== undefined && parseInt(meta.track.no) > 0) {
                tags.trackNumber = meta.track.no;
            }
            if(meta.album !== undefined) {
                tags.album = meta.album;
            }

        }
        catch (e) {
            logger.error('get meta error');
            logger.error(e);
        }

        /*
         * Wenn keine Meta Tags vorhanden schreibe
         */
        if(!meta) {

            try {
                await NodeID3.create(tags);
                await NodeID3.write(tags, file_path);
            }
            catch (e) {
                logger.error('tag create error');
                logger.error(e);
            }
        }

        return tags;

    }

};

module.exports = mp3_id3_editor;