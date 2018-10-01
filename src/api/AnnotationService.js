import 'whatwg-fetch';
import EventEmitter from 'events';
import Annotation from '../Annotation';

class AnnotationService extends EventEmitter {
    /**
     * Create an annotation.
     *
     * @param {Annotation} annotation - Annotation to save
     * @return {Promise} Promise that resolves with created annotation
     */
    create(annotation) {
        return new Promise((resolve, reject) => {
            fetch(`${this.api}/2.0/annotations`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    item: {
                        type: 'file_version',
                        id: annotation.fileVersionId
                    },
                    details: {
                        type: annotation.type,
                        drawingPaths: annotation.drawingPaths,
                        location: annotation.location,
                        threadID: annotation.threadID
                    },
                    message: annotation.message,
                    thread: annotation.threadNumber
                })
                // NOTE: Ensure that threadNumbers are sent to the API as
                // thread, else the API created annotation will have an
                // incremented threadNumber. This is due to the naming system
                // in the annotations API
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.type !== 'error' && data.id) {
                        const tempData = data;
                        tempData.permissions = {
                            can_edit: true,
                            can_delete: true
                        };
                        const createdAnnotation = this.createAnnotation(tempData);

                        // Set user if not set already
                        if (this.user.id === '0') {
                            this.user = createdAnnotation.createdBy;
                        }

                        resolve(createdAnnotation);
                    } else {
                        const error = new Error('Could not create annotation');
                        reject(error);
                        this.emit('annotationerror', {
                            reason: 'create',
                            error: error.toString()
                        });
                    }
                })
                /* istanbul ignore next */
                .catch((error) => {
                    reject(new Error('Could not create annotation due to invalid or expired token'));
                    this.emit('annotationerror', {
                        reason: 'authorization',
                        error: error.toString()
                    });
                });
        });
    }

    /**
     * Delete an annotation.
     *
     * @param {string} id - Id of annotation to delete
     * @return {Promise} Promise to delete annotation
     */
    delete(id) {
        return new Promise((resolve, reject) => {
            fetch(`${this.api}/2.0/annotations/${id}`, {
                method: 'DELETE',
                headers: this.headers
            })
                .then((response) => {
                    if (response.status === 204) {
                        resolve();
                    } else {
                        const error = new Error(`Could not delete annotation with ID ${id}`);
                        reject(error);
                        this.emit('annotationerror', {
                            reason: 'delete',
                            error: error.toString()
                        });
                    }
                })
                /* istanbul ignore next */
                .catch((error) => {
                    reject(new Error('Could not delete annotation due to invalid or expired token'));
                    this.emit('annotationerror', {
                        reason: 'authorization',
                        error: error.toString()
                    });
                });
        });
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

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
export default AnnotationService;
