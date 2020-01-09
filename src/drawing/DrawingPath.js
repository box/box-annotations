// @flow
import { createLocation, round } from '../util';

class DrawingPath {
    /** @property {Array} - The array of coordinates that form the path */
    path = [];

    /** @property {Array} - The path coordinates translated into browser space */
    browserPath = [];

    /** @property {number} - The maximum X position of all coordinates */
    maxX = -Infinity;

    /** @property {number} - The maximum Y position of all coordinates */
    maxY = -Infinity;

    /** @property {number} - The minimum X position of all coordinates */
    minX = Infinity;

    /** @property {number} - The minimum Y position of all coordinates */
    minY = Infinity;

    /**
     * [constructor]
     *
     * @param {DrawingPath} drawingPathData - The drawingPath object data to be instantiated into an object
     * @return {DrawingPath} A DrawingPath instance
     */
    constructor(drawingPathData: ?DrawingPath) {
        this.initPath(drawingPathData);
    }

    /**
     * Updates the path min/max coordinates if necessary
     * @param {number} x - X path coordinate
     * @param {number} y - Y path coordinate
     * @return {void}
     */
    updatePathBounds(x: number, y: number) {
        this.minX = Math.min(this.minX, x);
        this.maxX = Math.max(this.maxX, x);
        this.minY = Math.min(this.minY, y);
        this.maxY = Math.max(this.maxY, y);
    }

    /**
     * Initialize a path from passed in data
     * @param {DrawingPath} drawingPathData - The drawingPath object data to be instantiated into an object
     * @return {void}
     */
    initPath(drawingPathData: ?DrawingPath) {
        if (!drawingPathData) {
            return;
        }

        // $FlowFixMe
        this.path = drawingPathData.path.map((num: Coordinates) => {
            const x = +num.x;
            const y = +num.y;

            this.updatePathBounds(x, y);
            return createLocation(x, y);
        });
    }

    /**
     * Add position to coordinates and update the bounding box
     *
     * @param {Coordinates} documentLocation - Original document location coordinate to be part of the drawing path
     * @param {Coordinates} [browserLocation] - Optional browser position to be saved to browserPath
     * @return {void}
     */
    addCoordinate(documentLocation: Coordinates, browserLocation: Coordinates) {
        if (!documentLocation || !documentLocation.x || !documentLocation.y) {
            return;
        }

        // OPTIMIZE (@minhnguyen): We convert anumber to a string using toFixed and then back anumber.
        //           As a result, it might be better to truncate only on annotation save.
        const x = round(documentLocation.x, 2);
        const y = round(documentLocation.y, 2);

        if (x < this.minX) {
            this.minX = x;
        }

        if (y < this.minY) {
            this.minY = y;
        }

        if (y > this.maxY) {
            this.maxY = y;
        }

        if (x > this.maxX) {
            this.maxX = x;
        }

        this.path.push(createLocation(x, y));
        if (browserLocation && browserLocation.x && browserLocation.y) {
            this.browserPath.push(browserLocation);
        }
    }

    /**
     * Determine if any coordinates are contained in the DrawingPath
     *
     * @return {boolean} Whether or not any coordinates have been recorded
     */
    isEmpty() {
        return this.path.length === 0;
    }

    /**
     * Draw the recorded browser coordinates onto a CanvasContext. Requires a browser path to have been generated.
     *
     * @param {CanvasContext} drawingContext - Context to draw the recorded path on
     * @return {void}
     */
    drawPath(drawingContext: Object) {
        const ctx = drawingContext;
        if (!ctx || !this.browserPath) {
            return;
        }

        this.browserPath.forEach((coordinate, index) => {
            let xLast;
            let yLast;

            if (index > 0) {
                xLast = this.browserPath[index - 1].x;
                yLast = this.browserPath[index - 1].y;
            } else {
                xLast = coordinate.x;
                yLast = coordinate.y;
                ctx.moveTo(xLast, yLast);
            }

            const xMid = (coordinate.x + xLast) / 2;
            const yMid = (coordinate.y + yLast) / 2;
            ctx.quadraticCurveTo(xLast, yLast, xMid, yMid);
        });
    }

    /**
     * Generate a browser location path that can be drawn on a canvas document from the stored path information
     *
     * @param {Function} coordinateToBrowserCoordinate - A function that takes a document location and returns
     *                                                   the corresponding browser location
     * @return {void}
     */
    generateBrowserPath(coordinateToBrowserCoordinate: Function) {
        if (!this.path) {
            return;
        }

        // create a browser coordinate path from the document location path
        // $FlowFixMe
        this.browserPath = this.path.map(coordinateToBrowserCoordinate);
    }

    /**
     * Extract the path information from two paths by merging their paths and getting the bounding rectangle
     *
     * @param {DrawingPath} pathA - Another drawingPath to extract information from
     * @param {Object} accumulator - A drawingPath accumulator to retain boundary and path information
     * @return {Object} A bounding rectangle and the stroke paths it contains
     */
    static extractDrawingInfo(pathA: DrawingPath, accumulator: DrawingLocationInfo) {
        let { paths } = accumulator;
        const apath = { path: pathA.path };
        if (!paths) {
            paths = [apath];
        } else {
            paths.push(apath);
        }

        return {
            minX: accumulator.minX ? Math.min(accumulator.minX, pathA.minX) : pathA.minX,
            maxX: accumulator.maxX ? Math.max(accumulator.maxX, pathA.maxX) : pathA.maxX,
            minY: accumulator.minY ? Math.min(accumulator.minY, pathA.minY) : pathA.minY,
            maxY: accumulator.maxY ? Math.max(accumulator.maxY, pathA.maxY) : pathA.maxY,
            paths,
        };
    }
}

export default DrawingPath;
