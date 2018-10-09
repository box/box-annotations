// @flow
import EventEmitter from 'events';
import axios from 'axios';

import Annotation from '../Annotation';
import { getHeaders } from '../util';
import { PLACEHOLDER_USER, ANNOTATOR_EVENT, ERROR_TYPE } from '../constants';

class API extends EventEmitter {
    /** @property {string} */
    apiHost: string;

    /** @property {string} */
    fileId: string;

    /** @property {User} */
    user: User;

    /** @property {StringMap} */
    headers: StringMap = {};

    /** @property {Axios} */
    axios: Axios = axios.create();

    /** @property {CancelTokenSource} */
    axiosSource: CancelTokenSource = axios.CancelToken.source();

    /**
     * Generates a rfc4122v4-compliant GUID, from
     * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript.
     *
     * @return {string} UUID for annotation
     */
    static generateID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 || 0;
            /* eslint-disable no-bitwise */
            const v = c === 'x' ? r : r & 0x3 || 0x8;
            /* eslint-enable no-bitwise */
            return v.toString(16);
        });
    }

    /**
     * [constructor]
     *
     * @param {Options} data - Annotation Service data
     * @return {API} API instance
     */
    constructor(data: Options) {
        super();
        this.apiHost = data.apiHost;
        this.fileId = data.fileId;
        this.headers = getHeaders({}, data.token);
        this.user = {
            ...PLACEHOLDER_USER,
            name: data.anonymousUserName
        };
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        if (this.axiosSource) {
            this.axiosSource.cancel();
        }
    }

    /**
     * Generic API CRUD operations
     *
     * @param {Promise} methodRequest - which REST method to execute (GET, POST, PUT, DELETE)
     * @param {Function} successCallback - The success callback
     * @return {Promise} CRUD API Request Promise
     */
    makeRequest(methodRequest: any, successCallback: Function): Promise<StringAnyMap> {
        return methodRequest.then((data: Object) => successCallback(data.data)).catch(this.errorHandler);
    }

    /**
     * Error handler
     *
     * @param {$AxiosError} error - Response error
     * @return {void}
     */
    errorHandler = (error: $AxiosError): void => {
        this.emit(ANNOTATOR_EVENT.error, {
            reason: ERROR_TYPE.auth,
            error: error.toString()
        });
    };

    /**
     * Generates an Annotation object from an API response.
     *
     * @private
     * @param {AnnotationData} data - API response data
     * @return {Annotation} Created annotation
     */
    formatAnnotation(data: AnnotationData): Annotation {
        const {
            id,
            details,
            item,
            message,
            permissions,
            created_by: createdBy = PLACEHOLDER_USER,
            created_at: createdAt,
            modified_at: modifiedAt,
            thread: threadNumber
        } = data;

        return new Annotation({
            id,
            fileVersionId: item.id,
            threadID: details.threadID,
            type: details.type,
            threadNumber,
            message,
            location: details.location,
            createdBy: {
                id: createdBy.id,
                name: createdBy.name,
                avatarUrl: createdBy.profile_image
            },
            permissions,
            createdAt,
            modifiedAt
        });
    }
}

export default API;
