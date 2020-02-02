import { DataBaseType } from './typings';

export class Cache {
    private readonly cache: Record<string, DataBaseType> = {};

    private readonly cacheTime: number;

    // Every hour
    constructor(
        initialData: Record<string, DataBaseType>,
        cacheTime: number = 1000 * 60 * 60,
    ) {
        this.cache = initialData;
        this.cacheTime = cacheTime;
    }

    set = (key: string, value: DataBaseType, cacheTime = this.cacheTime) => {
        this.cache[key] = value;
        setTimeout(() => this.cache[key]._mustDie = true, cacheTime);
    };

    get = (key: string): DataBaseType => this.cache[key]
}
