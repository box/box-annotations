// @flow
import API from './API';

const HTTP_POST = 'POST';
const HTTP_DELETE = 'DELETE';
class AnnotationAPI extends API {
    /**
     * Construct the URL to create/edit/delete annotations
     *
     * @param {string} [id] - Optional annotation id
     * @return {string} Base API url
     */
    getBaseUrl(id?: string): string {
        return id ? `${this.apiHost}/2.0/annotations/${id}` : `${this.apiHost}/2.0/annotations`;
    }

    /**
     * HTTP POSTs a URL with annotation data
     *
     * @param {AnnotationData} annotation - Annotation returned from API
     * @return {Promise} HTTP Response
     */
    create(annotation: AnnotationData): Promise<StringAnyMap> {
        const url = this.getBaseUrl();
        const methodRequest = this.axios({
            url,
            data: annotation,
            method: HTTP_POST,
            cancelToken: this.axiosSource.token,
            headers: this.headers,
            parsedUrl: this.getParsedUrl(url)
        });

        return this.makeRequest(methodRequest, this.createSuccessHandler, this.errorHandler);
    }

    /**
     * @param {string} id  - Annotation ID to be deleted
     * @return {Promise} HTTP Response
     */
    delete(id: string): Promise<StringAnyMap> {
        const url = this.getBaseUrl(id);
        const methodRequest = this.axios({
            url,
            method: HTTP_DELETE,
            cancelToken: this.axiosSource.token,
            headers: this.headers,
            parsedUrl: this.getParsedUrl(url)
        });

        return this.makeRequest(methodRequest, (data) => this.deleteSuccessHandler(data, id), this.errorHandler);
    }

    /**
     * @param {Object} data  - HTTP response data
     * @return {AnnotationMap} Formatted HTTP response data
     */
    createSuccessHandler = (data: Object): AnnotationMap => {
        if (data.type === 'error' || !data.id) {
            const error = new Error('Could not create annotation');
            this.emit('annotationerror', {
                reason: 'create',
                error: error.toString()
            });
        }

        return data;
    };

    /**
     * @param {Object} data - HTTP response data
     * @param {string} id - Annotation ID
     * @return {Object} Formatted HTTP response data
     */
    deleteSuccessHandler = (data: Object, id: string) => {
        if (data.type === 'error' || !data.id) {
            const error = new Error(`Could not delete annotation with ID ${id}`);
            this.emit('annotationerror', {
                reason: 'delete',
                error: error.toString()
            });
        }

        return data;
    };

    /**
     * @param {$AxiosError} error  - HTTP response data
     * @return {void}
     */
    errorHandler = (error: $AxiosError) => {
        this.emit('annotationerror', {
            reason: 'authorization',
            error: error.toString()
        });
    };
}

export default AnnotationAPI;
