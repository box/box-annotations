import {
    getRotatedLocation,
    getLocationWithoutRotation,
    getRotatedPadding,
    getBrowserCoordinatesFromLocation
} from '../imageUtil';

const ROTATION_ONCE_DEG = -90;
const ROTATION_TWICE_DEG = -180;
const ROTATION_THRICE_DEG = -270;
const html = `<div class="mock-header-bar" height="30px" width="100px"></div>
<div class="annotated-element ba-annotated">
    <img width="100px" height="200px" data-page-number="1">
    <button class="ba-point-annotation-marker"></button>
</div
`;

describe('image/imageUtil', () => {
    let annotatedEl;
    let imageEl;

    beforeEach(() => {
        annotatedEl = document.createElement('div');
        annotatedEl.innerHTML = html;
        document.body.appendChild(annotatedEl);
        imageEl = annotatedEl.querySelector('img');
    });

    afterEach(() => {
        document.body.removeChild(annotatedEl);
    });

    describe('getRotatedLocation()', () => {
        let dimensions;
        const [x, y] = [20, 30];

        beforeEach(() => {
            dimensions = {
                height: 200,
                width: 100
            };
        });

        it('should return annotation coordinates when image is not rotated', () => {
            const [resultX, resultY] = getRotatedLocation(x, y, 0, dimensions, 1);
            expect(resultX).toEqual(x);
            expect(resultY).toEqual(y);
        });
        it('should return annotation coordinates when image is rotated left once', () => {
            const [resultX, resultY] = getRotatedLocation(x, y, ROTATION_ONCE_DEG, dimensions, 1);
            expect(resultX).toEqual(y);
            expect(resultY).toEqual(180);
        });
        it('should return annotation coordinates when image is rotated left twice', () => {
            const [resultX, resultY] = getRotatedLocation(x, y, ROTATION_TWICE_DEG, dimensions, 1);
            expect(resultX).toEqual(80);
            expect(resultY).toEqual(170);
        });
        it('should return annotation coordinates when image is rotated left thrice', () => {
            const [resultX, resultY] = getRotatedLocation(x, y, ROTATION_THRICE_DEG, dimensions, 1);
            expect(resultX).toEqual(70);
            expect(resultY).toEqual(x);
        });
    });

    describe('getLocationWithoutRotation()', () => {
        let dimensions;
        const [x, y] = [20, 30];

        beforeEach(() => {
            dimensions = {
                height: 200,
                width: 100
            };
        });

        it('should return annotation coordinates when image was not rotated', () => {
            const [resultX, resultY] = getLocationWithoutRotation(x, y, 0, dimensions, 1);
            expect(resultX).toEqual(x);
            expect(resultY).toEqual(y);
        });
        it('should return annotation coordinates when image was rotated left once', () => {
            const [resultX, resultY] = getLocationWithoutRotation(x, y, ROTATION_ONCE_DEG, dimensions, 1);
            expect(resultX).toEqual(70);
            expect(resultY).toEqual(x);
        });
        it('should return annotation coordinates when image was rotated left twice', () => {
            const [resultX, resultY] = getLocationWithoutRotation(x, y, ROTATION_TWICE_DEG, dimensions, 1);
            expect(resultX).toEqual(80);
            expect(resultY).toEqual(170);
        });
        it('should return annotation coordinates when image was rotated left thrice', () => {
            const [resultX, resultY] = getLocationWithoutRotation(x, y, ROTATION_THRICE_DEG, dimensions, 1);
            expect(resultX).toEqual(y);
            expect(resultY).toEqual(180);
        });
    });

    describe('getRotatedPadding()', () => {
        beforeEach(() => {
            imageEl = { offsetLeft: 50, offsetTop: 50 };
        });

        it('should return top padding if image is not rotated', () => {
            const rotatedPadding = getRotatedPadding(imageEl, false);
            expect(rotatedPadding).toEqual(50);
        });

        it('should return top padding if image is rotated', () => {
            const rotatedPadding = getRotatedPadding(imageEl, true);
            expect(rotatedPadding).toEqual(27.5);
        });
    });

    describe('getBrowserCoordinatesFromLocation()', () => {
        it('should return DOM coordinates from an annotation location object with no padding', () => {
            const location = {
                x: 20,
                y: 30,
                dimensions: {
                    x: 100,
                    y: 200
                },
                page: 1
            };
            const coordinates = getBrowserCoordinatesFromLocation(location, annotatedEl);

            expect(coordinates[0]).toEqual(20);
            expect(coordinates[1]).toEqual(30);
        });
    });
});
