export interface Champion {
    name: string;
    spellsOrder: string[];
    summoners: string[];
    roles: string[];
    primaryRunes: string[];
    secondaryRunes: string[];
    startItems: string[];
    mainItems: string[];
    lateItems: string[];
    boots: string[];
}

export interface ChampionRef {
    name: string;
    href: string;
}

export enum ParserEvent {
    init = 'init',
    champsLoaded = 'champsLoaded',
    namesLoaded = 'namesLoaded'
}

export type DataBaseType = any;

export enum Flags {
    name = 'name',
    items = 'items',
    runes = 'runes',
    roles = 'roles',
    spells = 'spells',
    skillOrder = 'skillOrder'
}
