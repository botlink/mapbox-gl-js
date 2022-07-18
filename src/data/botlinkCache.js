// @flow
import Dexie from 'dexie';

export const db = new Dexie('botlink-tile-cache');
db.version(1).stores({
    tiles: 'url, *flightPlanIds, blob', // Primary key and indexed props
});

export const getCachedTile = async (url) => {
    const cachedTile = await db.tiles.where('url').equalsIgnoreCase(url).first();
    return cachedTile;
};

export const getCachedTilesForFlightPlan = async (flightPlanId: string) => {
    const cachedTiles = await db.tiles.where('flightPlanIds').equals(flightPlanId).toArray();
    return cachedTiles;
};
