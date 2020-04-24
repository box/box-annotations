import Annotations from 'box-ui-elements/es/api/Annotations';
import { DEFAULT_HOSTNAME_API } from 'box-ui-elements/es/constants';
import { AnnotationsAPI, APIOptions } from './types';

export default class APIFactory {
    options: APIOptions;

    constructor(apiOptions: APIOptions) {
        this.options = {
            apiHost: DEFAULT_HOSTNAME_API,
            clientName: 'box-annotations',
            ...apiOptions,
        };
    }

    getAnnotationsAPI(): AnnotationsAPI {
        return new Annotations(this.options);
    }
}
