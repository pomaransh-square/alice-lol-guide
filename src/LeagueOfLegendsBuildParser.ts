import * as osmosis from 'osmosis';
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

    private createRootUrl() {
        return path.join(this.host, this.lang);
    }

    private createChampionCacheName = (champ: string) => `${this.CHAMPIONS_DATA_KEY}_${champ}`;

    fetchChampNames = async (): Promise<string[]> => {
        const namesFromApi = await new Promise<{ champions: string[] }>((resolve) => {
            osmosis
                .get(this.createRootUrl())
                .set({ champions: ['#championListBox .championBox .championName'] })
                .data(resolve);
        });

        const names = namesFromApi.champions.map((e) => e.toLowerCase());
        this.cache.set(this.NAMES_DATA_KEY, names);
        return names;
    };

    fetchChamp = async (champ: string): Promise<Champion> => {
        const champDataFromApi = await new Promise<Champion>((resolve) => {
            osmosis
                .get(this.createRootUrl())
                .find('#championListBox .championBox a')
                // @ts-ignore
                .match(new RegExp(champ, 'i'))
                .follow('@href')
                .set({
                    spellsOrder: ['.iconsRow .championSpell > .championSpellLetter'],
                    summoners: ['a[href*="/spells/"] img@alt'],
                    roles: ['.rolesEntries a .roleEntry .txt'],
                    primaryRunes: ['a[href*="/runes/"] .medium-12:first-child .perksTableOverview .img-align-block > div[style=""] img@alt'],
                    secondaryRunes: ['a[href*="/runes/"] .medium-12:nth-child(2) .perksTableOverview .img-align-block > div[style=""] img@alt'],
                    startItems: ['a[href*="items"] .overviewBox .row:nth-child(1) div:nth-child(1) img@alt'],
                    mainItems: ['a[href*="items"] .overviewBox .row:nth-child(1) div:nth-child(2) img@alt'],
                    lateItems: ['a[href*="items"] .overviewBox .row:nth-child(2) div:nth-child(2) img@alt'],
                    boots: ['a[href*="items"] .overviewBox .row:nth-child(2) div:nth-child(1) img@alt'],
                })
                .data((data: Omit<Champion, 'name'>) => resolve({ ...data, name: champ }));
        });

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
