import * as needle from 'needle';
import * as cheerio from 'cheerio';
import * as path from 'path';

import { Cache } from './Cache';
import { Champion, ChampionRef, ParserEvent } from './typings';

export const CHAMPIONS_DATA_KEY = 'champ-data';
export const NAMES_DATA_KEY = 'names-data';

export class LeagueOfLegendsBuildParser {
    private readonly CHAMPIONS_DATA_KEY = CHAMPIONS_DATA_KEY;

    private readonly NAMES_DATA_KEY = NAMES_DATA_KEY;

    private cache: Cache;

    private readonly host = 'www.leagueofgraphs.com';

    private listeners: Record<string, () => void> = {};

    constructor(private lang: "ru" | "en" = 'ru') {
        this.cache = new Cache({ [NAMES_DATA_KEY]: [] });
        this.init();
    }

    private init = () => {
        const { listeners } = this;

        if (listeners.init) listeners.init();
        this.fetchChampionsRefs()
            .then(async (refs: ChampionRef[]) => {
                if (listeners[ParserEvent.namesLoaded]) listeners[ParserEvent.namesLoaded]();
                for (const { name } of refs) await this.fetchChamp(name);
                if (listeners[ParserEvent.champsLoaded]) listeners[ParserEvent.champsLoaded]();
            });
    };

    private createRootUrl(withoutLang = false) {
        if (withoutLang) return 'https://' + this.host + '/';
        return 'https://' + path.join(this.host, this.lang) + '/';
    }

    private createChampionCacheName = (champ: string) => `${this.CHAMPIONS_DATA_KEY}_${champ}`;

    fetchChampionsRefs = async (): Promise<ChampionRef[]> => {
        const namesFromApi = await new Promise<ChampionRef[]>((resolve) => {
            needle.get(this.createRootUrl(), (err: any, res: any) => {
                const $ = cheerio.load(res.body);

                resolve(
                    $('#championListBox .championBox .championName').map(function(this: Cheerio) {
                        return {
                            name: $(this).text().trim().toLowerCase(),
                            href: $(this).parent().attr('href')
                        };
                    }).get()
                );
            });
        });

        console.log(namesFromApi);

        this.cache.set(this.NAMES_DATA_KEY, namesFromApi);
        return namesFromApi;
    };

    fetchChamp = async (champ: string): Promise<Champion> => {
        const href = await this.getChampionsRefs().then(refs => (refs.find(e => e.name === champ) as ChampionRef).href);

        const champDataFromApi = await new Promise<Champion>((resolve) => {
            needle.get(this.createRootUrl(true) + href, (err, res) => {
                const root = cheerio.load(res.body);
                const $ = cheerio.load(root('#mainContent .row')[0]);

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

        console.log(champDataFromApi);

        this.cache.set(this.createChampionCacheName(champ), champDataFromApi, 1000 * 60 * 60 * 24);
        return champDataFromApi;
    };

    on = (event: ParserEvent, cb: () => void) => {
        this.listeners[event] = cb;
    };

    getChampionsRefs = async (): Promise<ChampionRef[]> => {
        const names = this.cache.get(this.NAMES_DATA_KEY);
        if (!names || !names.length) return await this.fetchChampionsRefs();
        if (names._mustDie) this.fetchChampionsRefs();
        return names;
    };

    getChampion = async (champ: string): Promise<Champion> => {
        const champData = this.cache.get(this.createChampionCacheName(champ));
        if (!champData) return await this.fetchChamp(champ);
        if (champData._mustDie) this.fetchChamp(champ);
        return champData;
    }
}
