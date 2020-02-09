import { LeagueOfLegendsBuildParser } from './LeagueOfLegendsBuildParser';
import { LeagueOfLegendsResponseFormatter } from './LeagueOfLegendsResponseFormatter';
import { Champion, Flags } from './typings';
import { timeoutResponse } from "./helpers";

// const enFormatter = new LeagueOfLegendsResponseFormatter('en');

const lol = new LeagueOfLegendsBuildParser('ru');

module.exports.handle = async (event: any, context: any) => {
    const { version, session, request } = event;

    const ruNames = await lol.getChampionsRefs().then(ref => ref.map(e => e.name));
    const formatter = new LeagueOfLegendsResponseFormatter('ru', ruNames);

    const response = await timeoutResponse(async () => {
        if (!request.command)
            return formatter.hello();

        const flags = LeagueOfLegendsResponseFormatter.getFormatterFlags();

        const command = request.command.toLowerCase();

        if (/хватит|стоп|остановись|перестань/.test(command))
            return formatter.end();

        if (/помоги|помощь|что делать|варианты|что ты умеешь|умеешь/.test(command))
            return formatter.help();

        if (/секрет/.test(command))
            return formatter.secret();

        // const sortedSearch = ruNames
        //     .map((name: string) => findMoreMatchesResult(command, name))
        //     .filter(e => e.weight > -1)
        //     .sort((a, b) => a.weight - b.weight);
        //
        // const found = sortedSearch[0];

        const champName = ruNames.find(name => new RegExp(name, 'i').test(command));
        if (!champName)
            return formatter.notFound();

        const champ: Champion = await lol.getChampion(champName);

        if (/руны|сборка/.test(command)) flags[Flags.runes] = true;

        if (/предметы?|вещи|сборка/.test(command)) flags[Flags.items] = true;

        if (/прокачка|скиллы|заклинания|сборка|умения/.test(command)) {
            flags[Flags.spells] = true;
            flags[Flags.skillOrder] = true;
        }

        if (/лини(я|и)|роли/.test(command)) flags[Flags.roles] = true;

        return formatter.format(champ, flags);
    }, formatter.error);

    return {
        version,
        session,
        response
    };
};
