import { clearSelectionAction, createSelectionAction, getRange, getSelectionItem } from '../actions';

describe('highlight/actions', () => {
    describe('getRange()', () => {
        test.each`
            selection                                       | result
            ${null}                                         | ${null}
            ${{ isCollapsed: true, type: 'Range' }}         | ${null}
            ${{ type: 'Caret' }}                            | ${null}
            ${{ getRangeAt: () => 'range', type: 'Range' }} | ${'range'}
        `('should return range as $result', ({ selection, result }) => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => selection);

            expect(getRange()).toBe(result);
        });
    });

    describe('getSelectionItem()', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <div class="range0" />
            <div class="page" data-page-number="1">
                <div class="range1" />
            </div>
            <div class="page" data-page-number="2">
                <div class="range2" />
            </div>
        `;

        const generateSelection = (startClass: string, endClass: string): Selection => {
            return ({
                getRangeAt: () => {
                    const range = document.createRange();
                    range.setStart(rootElement.querySelector(startClass) as Node, 0);
                    range.setEnd(rootElement.querySelector(endClass) as Node, 0);
                    range.getBoundingClientRect = jest.fn().mockReturnValueOnce({});
                    range.getClientRects = jest.fn().mockReturnValueOnce([]);
                    return range;
                },
                type: 'Range',
            } as unknown) as Selection;
        };

        test('should return null if range is null', () => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => null);
            expect(getSelectionItem()).toBe(null);
        });

        test.each`
            startClass   | endClass     | result
            ${'.range0'} | ${'.range0'} | ${null}
            ${'.range1'} | ${'.range0'} | ${null}
            ${'.range1'} | ${'.range2'} | ${null}
            ${'.range1'} | ${'.range1'} | ${expect.objectContaining({ location: 1 })}
        `('should return $result', ({ startClass, endClass, result }) => {
            jest.spyOn(window, 'getSelection').mockReturnValueOnce(generateSelection(startClass, endClass));

            expect(getSelectionItem()).toEqual(result);
        });
    });

    describe('actions', () => {
        const dispatch = jest.fn();

        test('should call dispatch', () => {
            createSelectionAction()(dispatch);
            clearSelectionAction()(dispatch);

            expect(dispatch).toHaveBeenCalledTimes(2);
        });
    });
});
