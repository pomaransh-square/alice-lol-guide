declare module 'alice-renderer' {
    export const reply: any;
    export const br: () => any;
    export const pause: (time: number) => any;
    export const effect: (effectName: string) => any;
    export const buttons: (names: string[]) => any;
}
