// @flow
import API from './API';
import { ANNOTATOR_EVENT, ERROR_TYPE } from '../constants';

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
            headers: this.headers
        });

        return this.makeRequest(methodRequest, this.createSuccessHandler);
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
            headers: this.headers
        });

        return this.makeRequest(methodRequest, (data) => this.deleteSuccessHandler(data, id));
    }

    /**
     * @param {Object} data  - HTTP response data
     * @return {AnnotationMap} Formatted HTTP response data
     */
    createSuccessHandler = (data: Object): AnnotationMap => {
        if (data.type === 'error' || !data.id) {
            const error = new Error('Could not create annotation');
            this.emit(ANNOTATOR_EVENT.error, {
                reason: ERROR_TYPE.create,
                error: error.toString()
            });
        }

        // Default permissions to true for created annotations
        return {
            ...data,
            permissions: {
                can_delete: true,
                can_edit: true
            }
        };
    };

    /**
     * @param {Object} data - HTTP response data
     * @param {string} id - Annotation ID
     * @return {Object} Formatted HTTP response data
     */
    deleteSuccessHandler = (data: Object, id: string) => {
        if (data.type === 'error' || !data.id) {
            const error = new Error(`Could not delete annotation with ID ${id}`);
            this.emit(ANNOTATOR_EVENT.error, {
                reason: ERROR_TYPE.delete,
                error: error.toString()
            });
        }

        return data;
    };
}

export default AnnotationAPI;
