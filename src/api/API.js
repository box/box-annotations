import EventEmitter from 'events';
import axios from 'axios';

import Annotation from '../Annotation';
import { getHeaders } from '../util';

class API extends EventEmitter {
    /**
     * Generates a rfc4122v4-compliant GUID, from
     * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript.
     *
     * @return {string} UUID for annotation
     */
    static generateID() {
        /* eslint-disable */
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        /* eslint-enable */
    }

    /**
     * [constructor]
     *
     * @param {Object} data - Annotation Service data
     * @return {API} API instance
     */
    constructor(data) {
        super();
        this.apiHost = data.apiHost;
        this.fileId = data.fileId;
        this.headers = getHeaders({}, data.token);
        this.canAnnotate = data.canAnnotate;
        this.user = {
            id: '0',
            name: this.anonymousUserName
        };

        this.axios = axios.create();
        this.axiosSource = axios.CancelToken.source();
    }

    makeRequest(methodRequest, successCallback, errorCallback) {
        return new Promise((resolve, reject) => {
            methodRequest
                .then((data) => {
                    successCallback(data.data);
                    resolve(data.data);
                })
                .catch((error) => {
                    errorCallback(error);
                    reject(errorCallback);
                });
        });
    }

    getParsedUrl(url) {
        const a = document.createElement('a');
        a.href = url;
        return {
            api: url.replace(`${a.origin}/2.0`, ''),
            host: a.host,
            hostname: a.hostname,
            pathname: a.pathname,
            origin: a.origin,
            protocol: a.protocol,
            hash: a.hash,
            port: a.port
        };
    }

    /**
     * Generates an Annotation object from an API response.
     *
     * @private
     * @param {Object} data - API response data
     * @return {Annotation} Created annotation
     */
    createAnnotation(data) {
        const {
            id,
            details,
            item,
            message,
            permissions,
            created_by: createdBy,
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
