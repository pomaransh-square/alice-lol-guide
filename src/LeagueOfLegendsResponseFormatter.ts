// @ts-ignore
import { reply, effect, br, buttons, pause } from 'alice-renderer'; // eslint-disable-line
import { Champion, Flags } from './typings';
import { toCapital } from './helpers';

export class LeagueOfLegendsResponseFormatter {
    static get buttons() {
        return ['Помощь', 'Руны Акали', 'Скиллы Азир', 'Роли Пайк'];
    }

    static getFormatterFlags = (): Record<Flags, boolean> =>
        // @ts-ignore
        Object.values(Flags).reduce((acc, cur) => (acc[cur] = false, acc), {});

    static formatSomeNames = (names: string[]) => names.map((e) => e.toLowerCase()).join(', ');

    constructor(private lang: 'ru' | 'en' = 'ru') {}

    hello = () => reply`
        Привет. Назовите чемпиона.
        ${buttons(LeagueOfLegendsResponseFormatter.buttons)}
    `;

    help = () => reply`
        Назовите любого чемпиона из лиги легенд, я подскажу что у него за сб+орка. ${br()}
        Также, вы могли бы уточнить что вас интересует, и я не буду вас томить лишней информацией. ${br()}
        К примеру, вы можете сказать "Пайк руны", и я перечислю ${effect('megaphone')} ТОЛЬКО ${effect('-')} руны
        ${buttons(LeagueOfLegendsResponseFormatter.buttons)}
    `;

    end = () => reply.end`Удачной игры, призыватель!`;

    notFound = () => reply`
        Не нашла чемпиона, попробуйте вновь
        ${buttons(LeagueOfLegendsResponseFormatter.buttons)}
    `;

    error = () => reply`
        Что-то пошло не так, попробуйте снова
        ${buttons(LeagueOfLegendsResponseFormatter.buttons)}
    `;

    format = (champ: Champion, flags: Record<Flags, boolean>) => {
        if (Object.values(flags).every((e) => !e)) { (Object.keys(flags) as Flags[]).forEach((flag) => flags[flag] = true); }

        return reply`
            ${flags[Flags.name] && reply`
                Чемпион: ${toCapital(champ.name)} ${br()}
            `}
            ${flags[Flags.roles] && reply`Роли: ${LeagueOfLegendsResponseFormatter.formatSomeNames(champ.roles)} ${br()}`}
            ${flags[Flags.runes] && reply`
                Основные руны: ${champ.primaryRunes.join(', ')} ${br()} ${br()}
                Второстепенные руны: ${LeagueOfLegendsResponseFormatter.formatSomeNames(champ.secondaryRunes.slice(0, 2))} ${br()} ${br()}
                Дополнительные руны: ${LeagueOfLegendsResponseFormatter.formatSomeNames(champ.secondaryRunes.slice(2))} ${br()} ${br()}
            `}
            ${flags[Flags.spells] && reply`Заклинания: ${champ.summoners.join(', ')} ${br()} ${br()}`}
            ${flags[Flags.items] && reply`
                Начальные предметы: ${LeagueOfLegendsResponseFormatter.formatSomeNames(champ.startItems)} ${br()} ${br()}
                Основные предметы: ${LeagueOfLegendsResponseFormatter.formatSomeNames(champ.mainItems)} ${br()} ${br()}
                Предметы в лэйт+е: ${LeagueOfLegendsResponseFormatter.formatSomeNames(champ.lateItems)} ${br()} ${br()}
                Ботинки: ${champ.boots.join(', ')} ${br()} ${br()}
            `}
            ${flags[Flags.skillOrder] && reply`
                Порядок прокачки: 
                    ${champ.spellsOrder[0]}, ${pause(200)}
                    ${champ.spellsOrder[1]}, ${pause(200)}
                    ${champ.spellsOrder[2]}, ${pause(200)}
                    ${br()}
                    ${br()}
            `}
            ${buttons(LeagueOfLegendsResponseFormatter.buttons)}
        `;
    }
}
