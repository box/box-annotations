import { invertYCoordinate, rotatePoint, translatePoint } from '../transformUtil';

describe('src/region/transformUtil', () => {
    const parseValue = (value: number): number => parseFloat(value.toFixed(3));

    describe('invertYCoordinate()', () => {
        test.each`
            point             | height | expectedPoint
            ${{ x: 0, y: 0 }} | ${10}  | ${{ x: 0, y: 10 }}
            ${{ x: 1, y: 5 }} | ${10}  | ${{ x: 1, y: 5 }}
            ${{ x: 2, y: 7 }} | ${10}  | ${{ x: 2, y: 3 }}
            ${{ x: 2, y: 7 }} | ${0}   | ${{ x: 2, y: 7 }}
        `(
            'should return inverted y-coordinate given point=$point and height=$height',
            ({ point, height, expectedPoint }) => {
                expect(invertYCoordinate(point, height)).toEqual(expectedPoint);
            },
        );
    });

    describe('rotatePoint()', () => {
        test.each`
            point             | angle  | expectedPoint
            ${{ x: 1, y: 9 }} | ${0}   | ${{ x: 1, y: 9 }}
            ${{ x: 1, y: 9 }} | ${90}  | ${{ x: -9, y: 1 }}
            ${{ x: 1, y: 9 }} | ${180} | ${{ x: -1, y: -9 }}
            ${{ x: 1, y: 9 }} | ${270} | ${{ x: 9, y: -1 }}
            ${{ x: 1, y: 9 }} | ${-90} | ${{ x: 9, y: -1 }}
        `('should return rotated point given point=$point and angle=$angle', ({ point, angle, expectedPoint }) => {
            const { x, y } = rotatePoint(point, angle);
            const { x: expX, y: expY } = expectedPoint;

            expect(parseValue(x)).toEqual(parseValue(expX));
            expect(parseValue(y)).toEqual(parseValue(expY));
        });
    });

    describe('translatePoint()', () => {
        test.each`
            point             | translation          | expectedPoint
            ${{ x: 1, y: 1 }} | ${{ dx: 3 }}         | ${{ x: 4, y: 1 }}
            ${{ x: 1, y: 1 }} | ${{ dy: 3 }}         | ${{ x: 1, y: 4 }}
            ${{ x: 1, y: 1 }} | ${{ dx: 3, dy: 5 }}  | ${{ x: 4, y: 6 }}
            ${{ x: 1, y: 1 }} | ${{ dx: -3, dy: 5 }} | ${{ x: -2, y: 6 }}
        `(
            'should return translated point given point=$point and translation=$translation',
            ({ point, translation, expectedPoint }) => {
                expect(translatePoint(point, translation)).toEqual(expectedPoint);
            },
        );
    });
});
