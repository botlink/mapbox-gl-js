// @flow
import Dexie from 'dexie';

export const db = new Dexie('botlink-tile-cache');
db.version(1).stores({
    tiles: 'url, blob', // Primary key and indexed props
});
