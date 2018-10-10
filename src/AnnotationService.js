import 'whatwg-fetch';
import EventEmitter from 'events';
import Annotation from './Annotation';
import { getHeaders } from './util';

class AnnotationService extends EventEmitter {
    //--------------------------------------------------------------------------
    // Static
    //--------------------------------------------------------------------------

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

    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing an Annotation Service.
     * @typedef {Object} AnnotationServiceData
     * @property {string} apiHost API root
     * @property {string} fileId File ID
     * @property {string} token Access token
     * @property {boolean} canAnnotate Can user annotate
     */

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [constructor]
     *
     * @param {AnnotationServiceData} data - Annotation Service data
     * @return {AnnotationService} AnnotationService instance
     */
    constructor(data) {
        super();
        this.api = data.apiHost;
        this.fileId = data.fileId;
        this.headers = getHeaders({}, data.token);
        this.canAnnotate = data.canAnnotate;
        this.user = {
            id: '0',
            name: this.anonymousUserName
        };

        // Explicitly bind listeners
        this.createThreadMap = this.createThreadMap.bind(this);
    }

    /**
     * Create an annotation.
     *
     * @param {Annotation} annotation - Annotation to save
     * @return {Promise} Promise that resolves with created annotation
     */
    create = (annotation) => {
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
    };

    /**
     * Reads annotations from file version ID.
     *
     * @param {string} fileVersionId - File version ID to fetch annotations for
     * @return {Promise} Promise that resolves with fetched annotations
     */
    read(fileVersionId) {
        this.annotations = [];
        let resolve;
        let reject;
        const promise = new Promise((success, failure) => {
            resolve = success;
            reject = failure;
        });

        this.readFromMarker(resolve, reject, fileVersionId);
        return promise;
    }

    /**
     * Delete an annotation.
     *
     * @param {string} id - Id of annotation to delete
     * @return {Promise} Promise to delete annotation
     */
    delete = (id) => {
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
    };

    /**
     * Gets a map of thread ID to annotations in that thread.
     *
     * @param {string} fileVersionId - File version ID to fetch annotations for
     * @return {Promise} Promise that resolves with thread map
     */
    getThreadMap(fileVersionId) {
        return this.read(fileVersionId).then(this.createThreadMap);
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Generates a map of thread ID to annotations in thread.
     *
     * @private
     * @param {Annotations[]} annotations - Annotations to generate map from
     * @return {Annotations[]} Map of thread ID to annotations in that thread
     */
    createThreadMap(annotations) {
        const threadMap = {};
        this.annotations = annotations;

        // Construct map of thread ID to annotations
        this.annotations.forEach((annotation) => {
            const { threadID } = annotation;
            const threadAnnotations = threadMap[threadID] || [];
            threadAnnotations.push(annotation);
            threadMap[threadID] = threadAnnotations;
        });

        return threadMap;
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

    /**
     * Construct the URL to read annotations with a marker or limit added
     *
     * @private
     * @param {string} fileVersionId - File version ID to fetch annotations for
     * @param {string} marker - Marker to use if there are more than limit annotations
     * @param {int} limit - The amout of annotations the API will return per call
     * @return {Promise} Promise that resolves with fetched annotations
     */
    getReadUrl(fileVersionId, marker = null, limit = null) {
        let apiUrl = `${this.api}/2.0/files/${
            this.fileId
        }/annotations?version=${fileVersionId}&fields=item,thread,details,message,created_by,created_at,modified_at,permissions`;
        if (marker) {
            apiUrl += `&marker=${marker}`;
        }

        if (limit) {
            apiUrl += `&limit=${limit}`;
        }

        return apiUrl;
    }

    /**
     * Reads annotations from file version ID starting at a marker. The default
     * limit is 100 annotations per API call.
     *
     * @private
     * @param {Function} resolve - Promise resolution handler
     * @param {Function} reject - Promise rejection handler
     * @param {string} fileVersionId - File version ID to fetch annotations for
     * @param {string} marker - Marker to use if there are more than limit annotations
     * @param {int} limit - The amout of annotations the API will return per call
     * @return {void}
     */
    readFromMarker(resolve, reject, fileVersionId, marker = null, limit = null) {
        fetch(this.getReadUrl(fileVersionId, marker, limit), {
            headers: this.headers
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.type === 'error' || !Array.isArray(data.entries)) {
                    const error = new Error(`Could not read annotations from file version with ID ${fileVersionId}`);
                    reject(error);
                    this.emit('annotationerror', {
                        reason: 'read',
                        error: error.toString()
                    });
                } else {
                    data.entries.forEach((annotationData) => {
                        const annotation = this.createAnnotation(annotationData);
                        this.annotations.push(annotation);
                    });

                    if (data.next_marker) {
                        this.readFromMarker(resolve, reject, fileVersionId, data.next_marker, limit);
                    } else {
                        resolve(this.annotations);
                    }
                }
            })
            .catch((error) => {
                reject(new Error('Could not read annotations from file due to invalid or expired token'));
                this.emit('annotationerror', {
                    reason: 'authorization',
                    error: error.toString()
                });
            });
    }
}
export default AnnotationService;