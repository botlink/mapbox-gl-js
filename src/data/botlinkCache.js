// @flow
import Dexie from 'dexie';

export const db = new Dexie('botlink-tile-cache');
db.version(1).stores({
    tiles: 'url, *keys, blob', // Primary key and indexed props
});

export const getCachedTile = async (url) => {
    const cachedTile = await db.tiles.where('url').equalsIgnoreCase(url).first();
    return cachedTile;
};

export const getCachedTilesForKey = async (key: string) => {
    const cachedTiles = await db.tiles.where('keys').equals(key).toArray();
    return cachedTiles;
};
