import Annotations from 'box-ui-elements/es/api/Annotations';
import FileCollaborators from 'box-ui-elements/es/api/FileCollaborators';
import ThreadedComments from 'box-ui-elements/es/api/ThreadedComments';
import { DEFAULT_HOSTNAME_API } from 'box-ui-elements/es/constants';
import { AnnotationsAPI, CollaboratorsAPI, APIOptions, ThreadedCommentsAPI } from './types';

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

    getCollaboratorsAPI(): CollaboratorsAPI {
        return new FileCollaborators(this.options);
    }

    getThreadedCommentsAPI(): ThreadedCommentsAPI {
        return new ThreadedComments(this.options);
    }
}
