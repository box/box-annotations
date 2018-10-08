import API from './API';

const FIELDS = 'item,thread,details,message,created_by,created_at,modified_at,permissions';

class FileVersionAPI extends API {
    /**
     * Construct the URL to read annotations with a marker or limit added
     *
     * @private
     * @return {string} Promise that resolves with fetched annotations
     */
    getBaseUrl() {
        return `${this.apiHost}/2.0/files/${this.fileId}/annotations`;
    }

    /**
     * Fetches and organizes the annotations for the specified file version id
     *
     * @param {string} version - File version ID
     * @return {Promise} Promise that resolves with thread map
     */
    fetchVersionAnnotations(version) {
        this.annotations = [];
        this.apiAnnotations = [];
        const params = {
            version,
            fields: FIELDS
        };

        return this.fetchFromMarker({ params }).then(this.createThreadMap);
    }

    /**
     * Reads annotations from file version ID starting at a marker. The default
     * limit is 100 annotations per API call.
     *
     * @private
     * @param {string} marker - Marker to use if there are more than limit annotations
     * @param {int} limit - The amout of annotations the API will return per call
     * @return {void}
     */
    fetchFromMarker = ({ params, marker = null, limit = null }) => {
        this.limit = limit;
        const apiUrl = this.getBaseUrl(marker);

        const queryParams = {
            ...params,
            limit,
            marker
        };

        const methodRequest = this.axios.get(apiUrl, {
            cancelToken: this.axiosSource.token,
            headers: this.headers,
            parsedUrl: this.getParsedUrl(apiUrl),
            params: queryParams
        });

        return this.makeRequest(methodRequest, (data) => this.successHandler(data, params), this.errorHandler);
    };

    successHandler = (data, params) => {
        const entries = this.data ? this.data.entries : [];
        this.data = {
            ...data,
            entries: entries.concat(data.entries)
        };

        const { next_marker } = data;
        if (next_marker) {
            this.fetchFromMarker({ params, next_marker, limit: this.limit });
            return;
        }

        if (data.type === 'error' || !Array.isArray(data.entries)) {
            const error = new Error(`Could not read annotations from file version with ID ${this.id}`);
            this.emit('annotationerror', {
                reason: 'read',
                error: error.toString()
            });
        }
    };

    errorHandler = (error) => {
        this.emit('annotationerror', {
            reason: 'authorization',
            error: error.toString()
        });
    };

    /**
     * Generates a map of thread ID to annotations in thread.
     *
     * @private
     * @param {Annotations[]} annotations - Annotations to generate map from
     * @return {Annotations[]} Map of thread ID to annotations in that thread
     */
    createThreadMap = (annotations) => {
        const threadMap = {};

        // Construct map of thread ID to annotations
        annotations.entries.forEach((apiAnnotations) => {
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
