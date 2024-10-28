import Dexie, { type EntityTable } from 'dexie';

export interface Tile {
    url: string;
    keys: string[];
    blob: any;
}

export const db = new Dexie('botlink-tile-cache') as Dexie & {
    tiles: EntityTable<Tile, 'url'>
};

db.version(1).stores({
    tiles: '&url, *keys, blob'
});

export const getCachedTile = async (url: string) => {
    const cachedTile = await db.tiles.where('url').equalsIgnoreCase(url).first();
    return cachedTile;
};

export const getCachedTilesForKey = async (key: string) => {
    const cachedTiles = await db.tiles.where('keys').equals(key).toArray();
    return cachedTiles;
};

export const deleteCachedArea = async (key: string) => {
    const cachedTiles = await getCachedTilesForKey(key);
    for (const cachedTile of cachedTiles) {
        const otherKeysForTile = cachedTile.keys.filter(k => k !== key);

        if (otherKeysForTile.length > 0) {
            await db.tiles.where('url').equalsIgnoreCase(cachedTile.url).modify({
                keys: otherKeysForTile
            });
        } else {
            await db.tiles.where('url').equalsIgnoreCase(cachedTile.url).delete();
        }
    }
};

export const clearTileCache = async () => {
    return db.tiles.clear();
};
