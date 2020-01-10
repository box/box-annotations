// @flow
import EventEmitter from 'events';
import axios from 'axios';

import { getHeaders } from '../util';
import { PLACEHOLDER_USER, ANNOTATOR_EVENT } from '../constants';

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

    /** @property {BoxItemPermissions} */
    permissions: BoxItemPermissions = {
        can_annotate: false,
        can_view_annotations_all: false,
        can_view_annotations_self: false,
    };

    /** @property {CancelTokenSource} */
    axiosSource: CancelTokenSource = axios.CancelToken.source();

    /**
     * Generates a rfc4122v4-compliant GUID, from
     * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript.
     *
     * @return {string} UUID for annotation
     */
    static generateID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            /* eslint-disable */
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            /* eslint-enable */
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
        this.permissions = data.permissions;
        this.apiHost = data.apiHost;
        this.fileId = data.fileId;
        this.headers = getHeaders({}, data.token);
        this.user = {
            ...PLACEHOLDER_USER,
            name: data.anonymousUserName,
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
            reason: error.name,
            error: error.toString(),
        });
    };

    formatUserInfo(user: BoxUser): User {
        const { profile_image, login, ...rest } = user;
        return {
            ...rest,
            email: login,
            avatarUrl: profile_image,
        };
    }

    formatComment(entry: AnnotationData): CommentProps {
        const {
            id,
            message,
            permissions,
            created_by = PLACEHOLDER_USER,
            created_at: createdAt,
            modified_at: modifiedAt,
        } = entry;
        return {
            id,
            message,
            permissions,
            createdBy: this.formatUserInfo(created_by),
            createdAt,
            modifiedAt,
            isPending: false,
        };
    }

    appendComments(entry: AnnotationData, comments: Comments = []): Comments {
        const { message } = entry;
        if (message && message.trim() !== '') {
            comments.push(this.formatComment(entry));
        }

        return comments;
    }
}

export default API;
