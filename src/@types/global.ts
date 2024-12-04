/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace NodeJS {
    interface Global {
        window: any;
        BoxAnnotations: any;
    }
}

declare module 'box-annotations-locale-data';
declare module 'box-elements-messages';
declare module 'box-ui-elements/es/*'; // TODO: Figure out why types don't register properly
