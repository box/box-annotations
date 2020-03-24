/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
declare namespace NodeJS {
    interface Global {
        BoxAnnotations: any;
    }
}

declare namespace Intl {
    const RelativeTimeFormat: {};
}

declare module 'box-annotations-locale-data';
declare module 'box-elements-messages';
