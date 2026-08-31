import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlShape } from 'react-intl';
import RegionCreationContainer from '../RegionCreationContainer';
import { createStore, CreatorStatus, Mode } from '../../store';
import { TARGET_TYPE } from '../../constants';

jest.mock('../../common/withProviders');
jest.mock('../RegionCreation', () => ({
    __esModule: true,
    default: (props: {
        isCreating: boolean;
        location: number;
        rotation?: number;
        staged: unknown;
        targetType: string;
    }) => (
        <article
            aria-label="region creation"
            data-is-creating={String(props.isCreating)}
            data-location={String(props.location)}
            data-rotation={String(props.rotation)}
            data-staged={props.staged === null ? 'none' : 'staged'}
            data-target-type={props.targetType}
        />
    ),
}));

describe('RegionCreationContainer', () => {
    const referenceEl = document.createElement('div');
    const defaults = {
        intl: {} as IntlShape,
        location: 1,
        store: createStore(),
        referenceEl,
    };
    const renderContainer = (props = {}): void => {
        render(<RegionCreationContainer targetType={TARGET_TYPE.PAGE} {...defaults} {...props} />);
    };

    test('renders the underlying creation UI for a page target', () => {
        renderContainer();

        const el = screen.getByRole('article', { name: 'region creation' });
        expect(el).toHaveAttribute('data-target-type', 'page');
        expect(el).toHaveAttribute('data-location', '1');
        expect(el).toHaveAttribute('data-is-creating', 'false');
        expect(el).toHaveAttribute('data-staged', 'none');
    });

    test('renders the underlying creation UI for a video frame target', () => {
        renderContainer({ targetType: 'frame' as const, location: -1, referenceEl: { currentTime: 10 } as HTMLVideoElement });

        const el = screen.getByRole('article', { name: 'region creation' });
        expect(el).toHaveAttribute('data-target-type', 'frame');
        expect(el).toHaveAttribute('data-location', '-1');
    });

    test.each`
        mode              | status                   | isCreating
        ${Mode.NONE}      | ${CreatorStatus.staged}  | ${false}
        ${Mode.HIGHLIGHT} | ${CreatorStatus.staged}  | ${false}
        ${Mode.REGION}    | ${CreatorStatus.staged}  | ${true}
        ${Mode.REGION}    | ${CreatorStatus.pending} | ${false}
    `(
        'reflects isCreating=$isCreating when mode is $mode and status is $status',
        ({ mode, isCreating, status }) => {
            const store = createStore({ common: { mode }, creator: { status } });
            renderContainer({ store });

            expect(screen.getByRole('article', { name: 'region creation' })).toHaveAttribute(
                'data-is-creating',
                String(isCreating),
            );
        },
    );

    test.each`
        rotation     | expected
        ${null}      | ${'null'}
        ${undefined} | ${'undefined'}
        ${0}         | ${'0'}
        ${90}        | ${'90'}
        ${-90}       | ${'-90'}
        ${-180}      | ${'-180'}
        ${-270}      | ${'-270'}
        ${360}       | ${'360'}
        ${-360}      | ${'-360'}
    `('passes rotation=$rotation from state to the creation UI', ({ rotation, expected }) => {
        const store = createStore({ options: { rotation } });
        renderContainer({ store });

        expect(screen.getByRole('article', { name: 'region creation' })).toHaveAttribute('data-rotation', expected);
    });
});
