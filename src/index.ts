import express from 'express';

import { LeagueOfLegendsBuildParser } from './LeagueOfLegendsBuildParser';
import { LeagueOfLegendsResponseFormatter } from './LeagueOfLegendsResponseFormatter';
import { Flags } from './typings';
import { findMoreMatchesResult } from "./helpers";

const ruFormatter = new LeagueOfLegendsResponseFormatter('ru');
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

    const app = express();
    app
        .use(express.json())
        .all('/', async (req, res) => {
            if (req.method === 'GET') return res.end('<h1>Not found 404</h1>');

            const { body: { version, session, request } } = req;

            const formatter = ruFormatter;
            const lol = ruLol;

            if (!request.command) {
                return res.end(JSON.stringify({
                    version,
                    session,
                    response: formatter.hello(),
                }));
            }

            const flags = LeagueOfLegendsResponseFormatter.getFormatterFlags();

            const command = request.command.toLowerCase();

            if (/хватит|стоп|остановись/.test(command)) {
                return res.end(JSON.stringify({
                    version,
                    session,
                    response: formatter.end(),
                }));
            }

            if (/помоги|помощь|что делать|варианты/.test(command)) {
                return res.end(JSON.stringify({
                    version,
                    session,
                    response: formatter.help(),
                }));
            }

            let done = false;

            setTimeout(() => {
                if (done) return;
                done = true;

                res.end(JSON.stringify({
                    version,
                    session,
                    response: formatter.error(),
                }));
            }, 2000);

            if (done) return;

            const sortedSearch = ruNames
                .map((name: string) => findMoreMatchesResult(command, name))
                .filter(e => e.weight > -1)
                .sort((a, b) => a.weight - b.weight);

            const found = sortedSearch[0];

            const champName = found && found.name;
            if (!champName) {
                done = true;
                return res.end(JSON.stringify({
                    version,
                    session,
                    response: formatter.notFound(),
                }));
            }

            lol.getChampion(champName)
                .then((champ: any) => {
                    if (done) return;
                    done = true;

                    if (/руны|сборка/g.test(command)) flags[Flags.runes] = true;

                    if (/предметы?|вещи|сборка/g.test(command)) flags[Flags.items] = true;

                    if (/прокачка|скиллы|заклинания|сборка/.test(command)) {
                        flags[Flags.spells] = true;
                        flags[Flags.skillOrder] = true;
                    }

                    if (/лини(я|и)|роли/g.test(command)) flags[Flags.roles] = true;

                    res.end(JSON.stringify({
                        version,
                        session,
                        response: formatter.format(champ, flags),
                    }));
                });
        });

    const port = process.env.PORT || 3000;
    app.listen(port, console.log.bind(null, `Server have been start on ${port}`));
});
