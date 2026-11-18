import React from 'react';
import classNames from 'classnames';
import * as uuid from 'uuid';
import SVGFilterContext from './SVGFilterContext';
import UniformBlurContext from './UniformBlurContext';

export type Props = {
    children: React.ReactNode;
    className?: string;
};

export type DrawingSVGRef = SVGSVGElement;

export function DrawingSVG({ className, children, ...rest }: Props, ref: React.Ref<DrawingSVGRef>): JSX.Element {
    const { current: filterID } = React.useRef(`ba-DrawingSVG-shadow_${uuid.v4()}`);
    const isUniformBlur = React.useContext(UniformBlurContext);
    const [svgEl, setSvgEl] = React.useState<DrawingSVGRef | null>(null);
    const [aspectRatio, setAspectRatio] = React.useState(1);

    // Only with uniform blur: keeps the element to measure it, and still hands it to the forwarded ref
    const handleRef = React.useCallback(
        (el: DrawingSVGRef | null): void => {
            setSvgEl(el);
            if (typeof ref === 'function') {
                ref(el);
            } else if (ref) {
                (ref as React.MutableRefObject<DrawingSVGRef | null>).current = el;
            }
        },
        [ref],
    );

    // The y deviation in viewBox units that blurs as many pixels as the x deviation: width / height. Measured again
    // only when the layer changes size, not on scroll.
    React.useLayoutEffect(() => {
        if (!svgEl) {
            return undefined;
        }

        const measure = (): void => {
            const { height, width } = svgEl.getBoundingClientRect();
            setAspectRatio(width && height ? width / height : 1);
        };
        const observer = new ResizeObserver(measure);

        measure();
        observer.observe(svgEl);

        return () => observer.disconnect();
    }, [svgEl]);

    return (
        <svg
            ref={isUniformBlur ? handleRef : ref}
            className={classNames('ba-DrawingSVG', className)}
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            {...rest}
        >
            <defs>
                <filter filterUnits="userSpaceOnUse" id={filterID}>
                    <feGaussianBlur in="SourceGraphic" stdDeviation={isUniformBlur ? `1 ${aspectRatio}` : '1'} />
                </filter>
            </defs>
            <SVGFilterContext.Provider value={filterID}>{children}</SVGFilterContext.Provider>
        </svg>
    );
}

export default React.forwardRef(DrawingSVG);
