import * as needle from 'needle';
import * as cheerio from 'cheerio';
import * as path from 'path';

import { Cache } from './Cache';
import { Champion, DataBaseType } from './typings';

export const CHAMPIONS_DATA_KEY = 'champ-data';
export const NAMES_DATA_KEY = 'names-data';

export class LeagueOfLegendsBuildParser {
    private readonly CHAMPIONS_DATA_KEY = CHAMPIONS_DATA_KEY;

    private readonly NAMES_DATA_KEY = NAMES_DATA_KEY;

    private cache: Cache;

    private readonly host = 'www.leagueofgraphs.com';

    private listeners: Record<string, () => void> = {};

    constructor(initialData: DataBaseType = {}, private lang: 'ru' | 'en' = 'ru') {
        this.cache = new Cache({ [NAMES_DATA_KEY]: [], ...initialData });
        this.init();
    }

    private init = () => {
        const { listeners } = this;

        if (listeners.init) listeners.init();
        this.fetchChampNames()
            .then(async (names: string[]) => {
                if (listeners.namesLoaded) listeners.namesLoaded();
                for (const name of names) await this.fetchChamp(name);
                if (listeners.champsLoaded) listeners.champsLoaded();
            });
    };

    private createRootUrl(withoutLang = false) {
        if (withoutLang) return 'https://' + this.host + '/';
        return 'https://' + path.join(this.host, this.lang) + '/';
    }

    private createChampionCacheName = (champ: string) => `${this.CHAMPIONS_DATA_KEY}_${champ}`;

    fetchChampNames = async (): Promise<string[]> => {
        const namesFromApi = await new Promise<string[]>((resolve) => {
            needle.get(this.createRootUrl(), (err: any, res: any) => {
                const $ = cheerio.load(res.body);

                resolve(
                    $('#championListBox .championBox .championName').map(function(this: Cheerio) {
                        return $(this).text().trim();
                    }).get()
                );
            });
        });

        const names = namesFromApi.map((e) => e.toLowerCase());
        this.cache.set(this.NAMES_DATA_KEY, names);
        return names;
    };

    fetchChamp = async (champ: string): Promise<Champion> => {
        const champDataFromApi = await new Promise<Champion>((resolve) => {
            needle.get(this.createRootUrl(), (err, res) => {
                const $ = cheerio.load(res.body);

                const href: string = $('#championListBox .championBox a')
                    .filter(function(this: Cheerio) {
                        return $(this).text().trim().toLowerCase().includes(champ);
                    }).map(function(this: Cheerio) {
                        return $(this).attr('href') as string;
                    }).get(0);

                needle.get(this.createRootUrl(true) + href, (err, res) => {
                    const $ = cheerio.load(res.body);

                    resolve({
                        name: champ,
                        spellsOrder: $('.iconsRow .championSpell > .championSpellLetter').map(function (this: Cheerio) {
                            return $(this).contents().text().trim();
                        }).get() as string[],
                        summoners: $('a[href*="/spells/"] img').map(function (this: Cheerio) {
                            return $(this).attr('alt');
                        }).get() as string[],
                        roles: $('.rolesEntries a .roleEntry .txt').map(function (this: Cheerio) {
                            return $(this).contents().text().trim();
                        }).get() as string[],
                        primaryRunes: $('a[href*="/runes/"] .medium-12:first-child .perksTableOverview .img-align-block > div[style=""] img').map(function (this: Cheerio) {
                            return $(this).attr('alt');
                        }).get() as string[],
                        secondaryRunes: $('a[href*="/runes/"] .medium-12:nth-child(2) .perksTableOverview .img-align-block > div[style=""] img').map(function (this: Cheerio) {
                            return $(this).attr('alt')
                        }).get() as string[],
                        startItems: $('a[href*="items"] .overviewBox .row:nth-child(1) div:nth-child(1) img').map(function (this: Cheerio) {
                            return $(this).attr('alt');
                        }).get() as string[],
                        mainItems: $('a[href*="items"] .overviewBox .row:nth-child(1) div:nth-child(2) img').map(function (this: Cheerio) {
                            return $(this).attr('alt');
                        }).get() as string[],
                        lateItems: $('a[href*="items"] .overviewBox .row:nth-child(2) div:nth-child(2) img').map(function (this: Cheerio) {
                            return $(this).attr('alt');
                        }).get() as string[],
                        boots: $('a[href*="items"] .overviewBox .row:nth-child(2) div:nth-child(1) img').map(function (this: Cheerio) {
                            return $(this).attr('alt');
                        }).get() as string[],
                    });
                });
            });
        });

        console.log(champDataFromApi);

        this.cache.set(this.createChampionCacheName(champ), champDataFromApi, 1000 * 60 * 60 * 24);
        return champDataFromApi;
    };

    on = (event: string, cb: () => void) => {
        this.listeners[event] = cb;
    };

    getChampionsNames = async (): Promise<string[]> => {
        const names = this.cache.get(this.NAMES_DATA_KEY);
        if (!names || names._mustDie) return await this.fetchChampNames();
        return names;
    };

    getChampion = async (champ: string): Promise<Champion> => {
        const champData = this.cache.get(this.createChampionCacheName(champ));
        if (!champData || champData._mustDie) return await this.fetchChamp(champ);
        return champData;
    }
}
