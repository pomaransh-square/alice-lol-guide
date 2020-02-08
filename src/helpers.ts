export const toCapital = (str: string) => str[0].toUpperCase() + str.slice(1);

export const random = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min));
};

export const getRandomItem = <T>(items: T[]) => items[random(0, items.length)];

type TimeoutFunc = () => Promise<any> | any;
export const timeoutResponse = (func: TimeoutFunc, catchFunc: TimeoutFunc, timeout: number = 2000) => {
    return new Promise(async resolve => {
        setTimeout(async () => resolve(await catchFunc()), timeout);
        resolve(await func());
    });
};

export const findMoreMatchesResult = (command: string, name: string) => {
    const maxSkipped = 3;

    command = command.toLowerCase();
    const nameChars = name.toLowerCase().split('');

    let skipped = 0;
    command
        .split('')
        .forEach(char => {
            if (skipped >= maxSkipped || !nameChars.length) return;

            const idx = nameChars.indexOf(char);
            if (idx > -1 && idx < 2) {
                nameChars.splice(idx, 1);
                skipped = 0;
            } else skipped++;
        });

    const len = nameChars.length;
    let weight = nameChars.length;

    if (skipped >= maxSkipped) weight = -1;
    else if (name.length > 3) {
        if (len > 2) weight = -1;
    } else weight = len === 0 ? 0 : -1;

    return { name, weight };
};
