export const toCapital = (str: string) => str[0].toUpperCase() + str.slice(1);

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
