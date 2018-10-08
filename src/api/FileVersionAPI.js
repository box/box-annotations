// @flow
import API from './API';
import { ANNOTATOR_EVENT, ERROR_TYPE } from '../constants';

const FIELDS = 'item,thread,details,message,created_by,created_at,modified_at,permissions';

type Params = {
    marker?: string,
    limit?: string
};

type Data = {
    type: string,
    next_marker: string,
    limit: number,
    entries: Array<any>
};

class FileVersionAPI extends API {
    /**
     * @property {string}
     */
    fileVersionId: string;

    /**
     * @property {Array<Annotation>}
     */
    annotations: Array<Annotation>;

    /**
     * @property {string}
     */
    params: Params;

    /**
     * @property {Object}
     */
    data: Object;

    /**
     * Construct the URL to read annotations with a marker or limit added
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
            params
        });

        return this.makeRequest(methodRequest, (data) => this.successHandler(data, params));
    };

    /**
     * Success handler
     *
     * @param {Object} data - The response data
     * @param {Params} queryParams - Key-value map of querystring params
     * @return {void}
     */
    successHandler = (data: Data, queryParams: Params): void => {
        const entries = this.data ? this.data.entries : [];
        this.data = {
            ...data,
            entries: entries.concat(data.entries)
        };

        const { next_marker } = data;
        if (next_marker) {
            const params = {
                ...queryParams,
                marker: next_marker
            };

            this.fetchFromMarker(params);
        }

        if (data.type === 'error' || !Array.isArray(data.entries)) {
            const error = new Error(`Could not read annotations from file version with ID ${this.fileVersionId}`);
            this.emit(ANNOTATOR_EVENT.error, {
                reason: ERROR_TYPE.read,
                error: error.toString()
            });
        }
    };

    /**
     * Generates a map of thread ID to annotations in thread.
     *
     * @private
     * @param {AnnotationData[]} annotations - Annotations to generate map from
     * @return {AnnotationMap} Map of thread ID to annotations in that thread
     */
    createAnnotationMap = (): AnnotationMap => {
        const threadMap = {};
        const { entries } = this.data;

        // Construct map of thread ID to annotations
        entries.forEach((apiAnnotations) => {
            const annotation = this.formatAnnotation(apiAnnotations);
            const { threadID } = annotation;
            const threadAnnotations = threadMap[threadID] || [];
            threadAnnotations.push(annotation);
            threadMap[threadID] = threadAnnotations;
        });

        return threadMap;
    };
}

export default FileVersionAPI;
