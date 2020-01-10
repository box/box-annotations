// @flow
import API from './API';
import { ERROR_TYPE } from '../constants';

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
            headers: this.headers,
        });

        return this.makeRequest(methodRequest, data => this.deleteSuccessHandler(data, id));
    }

    /**
     * @param {Object} data  - HTTP response data
     * @return {Annotation} Formatted HTTP response data
     */
    createSuccessHandler = (data: Object): CommentProps => {
        if (data.type === 'error') {
            const error = new Error('Could not create annotation');
            error.name = ERROR_TYPE.create;
            this.errorHandler(error);
            return data;
        }

        const { details, thread: threadNumber } = data;
        const { threadID, location, type } = details;

        // Corrects any annotation page number to 1 instead of -1
        const fixedLocation = location;
        if (!fixedLocation.page || fixedLocation.page < 0) {
            fixedLocation.page = 1;
        }

        return {
            ...this.formatComment(data),
            type,
            threadID,
            threadNumber,
            location,
            canAnnotate: true,
            permissions: {
                can_delete: true,
                can_edit: true,
            },
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
            error.name = ERROR_TYPE.delete;
            this.errorHandler(error);
        }

        return data;
    };
}

export default AnnotationAPI;
