// @ts-ignore
import { reply, effect, br, buttons, pause, text } from 'alice-renderer'; // eslint-disable-line
import { Champion, Flags } from './typings';
import { toCapital, getRandomItem } from './helpers';

export const secretHelp: string[] = (() => {
    const array = new Array(50).fill('');
    array[8] = 'В этом навыке есть пасхалка, которую вам предстоит найти самостоятельно';

    return array;
})();

export class LeagueOfLegendsResponseFormatter {
    private get randomChamp() {
        return toCapital(getRandomItem(this.names));
    }

    get buttons() {
        return [
            'Помощь',
            `Роли ${this.randomChamp}`,
            `Руны ${this.randomChamp}`,
            `Скиллы ${this.randomChamp}`,
            `Предметы ${this.randomChamp}`,
            `${this.randomChamp}`,
        ];
    }

    static getFormatterFlags = (): Record<Flags, boolean> =>
        // @ts-ignore
        Object.values(Flags).reduce((acc, cur) => (acc[cur] = false, acc), {});

    static formatSomeNames = (names: string[]) => names.map((e) => e.toLowerCase()).join(', ');

    constructor(private lang: 'ru' | 'en' = 'ru', private names: string[]) {}

    hello = () => reply`
        Привет. Назовите чемпиона, и я подскажу что на него собирать. ${br()} ${br()}
        Если вас интересует что-то конкретное, то можете, к примеру, сказать "${this.randomChamp} руны". ${br()} ${br()}
        Если вам что-то непонятно, всегда можете сказать "Помоги, пожалуйста"
        ${buttons(this.buttons)}
    `;

    help = () => reply`
        Назовите любого чемпиона из лиги легенд, я подскажу что у него за сб+орка. ${br()} ${br()}
        Также, вы могли бы уточнить что вас интересует, и я не буду вас томить лишней информацией. ${br()} ${br()}
        К примеру, вы можете сказать "Пайк руны", и я перечислю ${effect('megaphone')} ТОЛЬКО ${effect('-')} руны. ${br()} ${br()}
        Если я вам помогла, и более от меня ничего не нужно, просто скажите "${['Остановись', 'Хватит', 'Перестань']}, пожалуйста" ${br()} ${br()}
        ${secretHelp}
        ${buttons(this.buttons)}
    `;

    secret = () => reply`
        Вау, вы нашли пасхалку! ${br()} ${br()}
        Расскажу небольшую историю, как появился этот навык. ${br()} ${br()}
        Этот навык сделали на хакатоне в Симферополе инициативной группой разработчиков "Помараншевый квадрат". ${br()} ${br()}
        ${text('Ссылка на событие в timepad: \n\n https://simferopol-frontend.timepad.ru/event/1218471/', '')} ${br()} ${br()}
        Мои разработчики часто играют в лигу легенд, от чего этот навык как нельзя ксатит появился в каталоге. ${br()} ${br()}
        Этот навык сделан с любовью, так что я настаиваю, чтобы вы оставляли отзывы ${br()}
        ${text('К кому сходить для предложений/отзывов: \n\n https://vk.com/hyrdbyrd, \n\n https://t.me/hyrdbyrd, \n\n https://github.com/hyrdbyrd', '')}
    `;

    end = () => reply.end`
        ${[
            'Удачной игры, призыватель!',
            'Удачных битв!',
            'Пока. Хороших тебе тимм+эйтов',
            'Досвидания. Я если что всегда тут'
        ]}
    `;

    notFound = () => reply`
        ${[
            'Не нашла чемпиона, попробуйте вновь', 
            'Вы уверены что такой чемпион существует? Я вот его не нашла', 
            'Кажется, такого чемпиона нет',
            'Вы не назвали чемпиона'
        ]}
        ${buttons(this.buttons)}
    `;

    error = () => reply`
        ${[
            'Что-то пошло не так, попробуйте снова', 
            'Я не успела все так быстро найти, но на второй раз, точно выйдет',
            'Ой-ой, что-то не вышло, может, попробуете включить и выключить?',
            'Не получилось дать ответ быстро, но у вас безграничное количество попыток!',
            'Извините, я не смогла быстро найти ответ, попробуйте вновь'
        ]}
        ${buttons(this.buttons)}
    `;

    format = (champ: Champion, flags: Record<Flags, boolean>) => {
        if (Object.values(flags).every(e => !e))
            (Object.keys(flags) as Flags[]).forEach((flag) => flags[flag] = true);

        return reply`
            Чемпион: ${toCapital(champ.name)} ${br()} ${br()}
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
            ${buttons(this.buttons)}
        `;
    }
}
