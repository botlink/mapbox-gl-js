// @flow

import {pick, extend} from '../util/util.js';

import {getJSON, ResourceType} from '../util/ajax.js';
import browser from '../util/browser.js';

import type {RequestManager} from '../util/mapbox.js';
import type {Callback} from '../types/callback.js';
import type {TileJSON} from '../types/tilejson.js';
import type {Cancelable} from '../types/cancelable.js';
import {db, getCachedTile} from '../data/botlinkCache';

export default function (key: string, options: any, requestManager: RequestManager, language: ?string, worldview: ?string, callback: Callback<TileJSON>): Cancelable {
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    const loaded = async function (err: ?Error, tileJSON: ?Object) {
        if (err) {
            return callback(err);
        } else if (tileJSON) {
            if (options.url) {
                const jsonUrl = requestManager.normalizeSourceURL(options.url, null, language, worldview);
                const cachedTile = await getCachedTile(jsonUrl);

                let keys = cachedTile ? cachedTile.keys : [];
                if (cachedTile) {
                    await db.tiles.where('url').equalsIgnoreCase(url).delete();
                }

                keys.push(key);
                keys = keys.filter(onlyUnique);

                try {
                    await db.tiles.add({
                        url: jsonUrl,
                        keys,
                        blob: tileJSON,
                    });
                } catch (error) {
                    console.log('botlink cache failed to cache tile');
                    console.error(error.message);
                }
            }

            const result: any = pick(
                // explicit source options take precedence over TileJSON
                extend(tileJSON, options),
                ['tiles', 'minzoom', 'maxzoom', 'attribution', 'mapbox_logo', 'bounds', 'scheme', 'tileSize', 'encoding']
            );

            if (tileJSON.vector_layers) {
                result.vectorLayers = tileJSON.vector_layers;
                result.vectorLayerIds = result.vectorLayers.map((layer) => { return layer.id; });
            }

            /**
             * A tileset supports language localization if the TileJSON contains
             * a `language_options` object in the response.
             */
            if (tileJSON.language_options) {
                result.languageOptions = tileJSON.language_options;
            }

            if (tileJSON.language && tileJSON.language[tileJSON.id]) {
                result.language = tileJSON.language[tileJSON.id];
            }

            /**
             * A tileset supports different worldviews if the TileJSON contains
             * a `worldview_options` object in the repsonse as well as a `worldview_default` key.
             */
            if (tileJSON.worldview_options) {
                result.worldviewOptions = tileJSON.worldview_options;
            }

            if (tileJSON.worldview) {
                result.worldview = tileJSON.worldview[tileJSON.id];
            } else if (tileJSON.worldview_default) {
                result.worldview = tileJSON.worldview_default;
            }

            result.tiles = requestManager.canonicalizeTileset(result, options.url);
            callback(null, result);
        }
    };

    if (options.url) {
        const jsonUrl = requestManager.normalizeSourceURL(options.url, null, language, worldview);
        getJSON(requestManager.transformRequest(jsonUrl, ResourceType.Source), loaded);
    } else {
        return browser.frame(() => loaded(null, options));
    }
}
