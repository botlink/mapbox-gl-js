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

export const deleteCachedArea = async (key: string) => {
    const cachedTiles = await getCachedTilesForKey(key);
    for (let i = 0; i < cachedTiles.length; i++) {
        const cachedTile = cachedTiles[i];
        const keys = cachedTile.keys.filter(id => id !== key);
        const tileUsedByMoreThanOneKey = keys > 0;

        if (tileUsedByMoreThanOneKey) {
            await db.tiles.where('url').equalsIgnoreCase(cachedTile.url).modify({
                keys
            });
        } else {
            await db.tiles.where('url').equalsIgnoreCase(cachedTile.url).delete();
        }
    }

    return cachedTiles;
};

export const clearTileCache = async () => {
    return db.tiles.clear();
};
