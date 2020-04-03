/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
declare namespace Intl {
    const RelativeTimeFormat: {};
}

declare namespace NodeJS {
    interface Global {
        BoxAnnotations: any;
    }
}

declare module 'box-annotations-locale-data';
declare module 'box-elements-messages';
declare module 'box-ui-elements/es/*'; // TODO: Figure out why types don't register properly
