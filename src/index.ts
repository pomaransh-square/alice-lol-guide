import express from 'express';

import { LeagueOfLegendsBuildParser } from './LeagueOfLegendsBuildParser';
import { LeagueOfLegendsResponseFormatter } from './LeagueOfLegendsResponseFormatter';
import {Champion, Flags} from './typings';
import { timeoutResponse } from "./helpers";

// const enFormatter = new LeagueOfLegendsResponseFormatter('en');

Promise.all<LeagueOfLegendsBuildParser>([
    new Promise((resolve) => {
        const ruLol = new LeagueOfLegendsBuildParser(undefined, 'ru');
        ruLol.on('namesLoaded', () => {
            resolve(ruLol);
        });
    }),
    // new Promise((resolve) => {
    //     const enLol = new LeagueOfLegendsBuildParser(undefined, 'en');
    //     enLol.on('namesLoaded', () => {
    //         resolve(enLol);
    //     });
    // }),
]).then(async ([ruLol]) => {
    const ruNames = await ruLol.getChampionsNames();
    const ruFormatter = new LeagueOfLegendsResponseFormatter('ru', ruNames);

    const app = express();
    app
        .use(express.json())
        .get('/ping', async (req, res) => {
            res.end('pong');
        })
        .all('/', async (req, res) => {
            if (req.method === 'GET') return res.end('<h1>Not found 404</h1>');

            const { body: { version, session, request } } = req;

            const formatter = ruFormatter;
            const lol = ruLol;

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

            res.end(JSON.stringify({
                version,
                session,
                response
            }))
        });

    const port = process.env.PORT || 3000;
    app.listen(port, console.log.bind(null, `Server have been start on ${port}`));
});
