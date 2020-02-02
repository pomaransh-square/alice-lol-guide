export const toCapital = (str: string) => str[0].toUpperCase() + str.slice(1);

export const findMoreMatchesResult = (command: string, name: string) => {
    command = command.toLowerCase();
    const nameChars = name.toLowerCase().split('');

    let skipped = 0;
    command
        .split('')
        .forEach(char => {
            if (skipped >= 4 || !nameChars.length) return;

            const idx = nameChars.indexOf(char);
            if (idx > -1 && idx < 2) {
                nameChars.splice(idx, 1);
                skipped = 0;
            } else skipped++;
        });

    if (skipped >= 4 && nameChars.length > 2) return -1;
    return nameChars.length;
};
