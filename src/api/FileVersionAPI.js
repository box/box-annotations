// @flow
import API from './API';
import { ERROR_TYPE, PLACEHOLDER_USER, TYPES } from '../constants';

const FIELDS = 'item,thread,details,message,created_by,created_at,modified_at,permissions';

type Params = {
    limit?: string,
    marker?: string,
};

type Data = {
    entries: Array<any>,
    limit: number,
    next_marker: string,
    type: string,
};

class FileVersionAPI extends API {
    /** @property {string} */
    fileVersionId: string;

    /** @property {Array<Annotation>} */
    annotations: Array<Annotation>;

    /** @property {Params} */
    params: Params;

    /** @property {Object} */
    data: Object;

    /**
     * Construct the URL to read annotations
     *
     * @return {string} Promise that resolves with fetched annotations
     */
    getBaseUrl(): string {
        return `${this.apiHost}/2.0/files/${this.fileId}/annotations`;
    }

    /**
     * Fetches and organizes the annotations for the specified file version id
     *
     * @param {string} version - File version ID
     * @return {Promise} Promise that resolves with thread map
     */
    fetchVersionAnnotations(version: string): Promise<AnnotationMap> {
        this.fileVersionId = version;

        // $FlowFixMe
        return this.fetchFromMarker({ version, fields: FIELDS }).then(this.createAnnotationMap);
    }

    /**
     * Reads annotations from file version ID starting at a marker. The default
     * limit is 100 annotations per API call.
     *
     * @param {Params} [params] - Key-value map of querystring params
     * @return {Promise<Data>} - Promise that resolves with annotation data
     */
    fetchFromMarker = (params: Params): Promise<Data> => {
        const apiUrl = this.getBaseUrl();

        const methodRequest = this.axios.get(apiUrl, {
            cancelToken: this.axiosSource.token,
            headers: this.headers,
            params,
        });

        return this.makeRequest(methodRequest, data => this.successHandler(data, params));
    };

    /**
     * Success handler
     *
     * @param {Object} data - The response data
     * @param {Params} queryParams - Key-value map of querystring params
     * @return {void}
     */
    successHandler = (data: Data, queryParams: Params): Promise<any> => {
        if (data.type === 'error' || !Array.isArray(data.entries)) {
            const error = new Error(`Could not read annotations from file version with ID ${this.fileVersionId}`);
            error.name = ERROR_TYPE.read;
            return Promise.reject(error);
        }

        const entries = this.data ? this.data.entries : [];
        this.data = {
            ...data,
            entries: [...entries, ...data.entries],
        };

        const { next_marker } = data;
        if (next_marker) {
            const params = {
                ...queryParams,
                marker: next_marker,
            };

            return this.fetchFromMarker(params);
        }

        return Promise.resolve(this.data);
    };

    /**
     * Generates a map of thread ID to annotations in thread.
     *
     * @param {AnnotationData[]} annotations - Annotations to generate map from
     * @return {AnnotationMap} Map of thread ID to annotations in that thread
     */
    createAnnotationMap = (): AnnotationMap => {
        const annotations = {};
        const { entries } = this.data;

        // Construct map of thread ID to annotations
        entries.forEach(entry => {
            const {
                id,
                details,
                permissions,
                created_by = PLACEHOLDER_USER,
                created_at: createdAt,
                modified_at: modifiedAt,
                thread: threadNumber,
            } = entry;
            const { threadID, location, type } = details;

            // Ignore annotations without a valid details
            // NOTE: Annotations created via the API can contain invalid parameters
            if (!location || !threadID || !type) {
                return;
            }

            // Corrects any annotation page number to 1 instead of -1
            const fixedLocation = location;
            if (!fixedLocation.page || fixedLocation.page < 0) {
                fixedLocation.page = 1;
            }

            if (!annotations[threadID]) {
                annotations[threadID] = {};
            }

            const annotation: Annotation = {
                id,
                threadID,
                type,
                location: fixedLocation,
                threadNumber,
                createdAt,
                createdBy: this.formatUserInfo(created_by),
                modifiedAt,
                canAnnotate: this.permissions.can_annotate,
                canDelete: permissions.can_delete,
                comments: this.appendComments(entry, annotations[threadID].comments),
            };

            // NOTE: Highlight comment annotations can be structured as a plain highlight
            // followed by a collection of comments. This will correctly set the annotation
            // type for such annotations as 'highlight-comment'
            if (annotation.type === TYPES.highlight && annotation.comments.length > 0) {
                annotation.type = TYPES.highlight_comment;
            }

            annotations[threadID] = annotation;
        });

        return annotations;
    };
}

export default FileVersionAPI;
