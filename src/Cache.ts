import { DataBaseType } from "./typings";

export class Cache {
    private cache: Record<string, DataBaseType> = {};

    // Every hour
    constructor(initialData: Record<string, DataBaseType>, private cacheTime: number = 1000 * 60 * 60) {
        this.cache = initialData;
    }

    set = (key: string, value: DataBaseType, cacheTime = this.cacheTime) => {
        this.cache[key] = value;
        setTimeout(() => this.cache[key]._mustDie = true, this.cacheTime);
    };

    get = (key: string): DataBaseType => {
        return this.cache[key];
    }
}
