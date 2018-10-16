class Annotation {
    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing an annotation.
     *
     * @typedef {Object} AnnotationData
     * @property {string} id Annotation ID
     * @property {string} fileVersionId File version ID for this annotation
     * @property {string} threadID Thread ID
     * @property {string} thread Threadnumber
     * @property {string} type Annotation type, e.g. 'point' or 'highlight'
     * @property {string} message Annotation text
     * @property {Object} location Location object
     * @property {Object} createdBy User creating/that created this annotation
     * @property {Object} permissions Permissions user has
     * @property {Number} createdAt Created timestamp
     * @property {Number} modifiedAt Modified timestamp
     */

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [constructor]
     *
     * @param {AnnotationData} data - Data for constructing annotation
     * @return {Annotation} Instance of annotation
     */
    constructor(data) {
        this.id = data.id;
        this.fileVersionId = data.fileVersionId;
        this.threadID = data.threadID;
        this.threadNumber = data.threadNumber;
        this.type = data.type;
        this.message = data.message;
        this.location = data.location;
        this.createdBy = data.createdBy;
        this.permissions = data.permissions;
        this.createdAt = data.createdAt;
        this.modifiedAt = data.modifiedAt;
        this.isPending = false;
    }
}

export default Annotation;
