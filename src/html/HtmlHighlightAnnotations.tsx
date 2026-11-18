import * as React from 'react';
import classNames from 'classnames';
import HighlightAnnotations from '../highlight/HighlightAnnotations';
import HighlightSvg from '../highlight/HighlightSvg';
import HighlightTarget from '../highlight/HighlightTarget';
import useIsListInteractive from '../common/useIsListInteractive';
import { filterHighlight, sortHighlight } from '../highlight/HighlightList';
import { AnnotationHighlight } from '../@types';

type ListProps = {
    activeId: string | null;
    annotations: AnnotationHighlight[];
    onSelect: (annotationId: string | null) => void;
};

type Props = React.ComponentProps<typeof HighlightAnnotations> & {
    activeAnnotationId: string | null;
    annotations: AnnotationHighlight[];
};

// Paints saved highlights with the SVG targets (see HtmlAnnotator.scss) instead of a canvas. The canvas
// spans the full content height, and browsers cap canvas size, so a long page never paints.
export function HtmlHighlightList({ activeId, annotations, onSelect }: ListProps): JSX.Element {
    const [hoverId, setHoverId] = React.useState<string | null>(null);
    const isListening = useIsListInteractive();
    const sortedAnnotations = annotations.filter(filterHighlight).sort(sortHighlight);

    return (
        <div className="ba-HighlightList ba-HtmlHighlightList" data-resin-component="highlightList">
            <HighlightSvg className={classNames({ 'is-listening': isListening })}>
                {sortedAnnotations.map(({ id, target }) => (
                    <HighlightTarget
                        key={id}
                        annotationId={id}
                        className={classNames({ 'is-hover': hoverId === id })}
                        isActive={activeId === id}
                        onHover={setHoverId}
                        onSelect={onSelect}
                        shapes={target.shapes}
                    />
                ))}
            </HighlightSvg>
        </div>
    );
}

// The shared component still handles the staged highlight and popups. It gets no saved annotations, so its
// canvases stay empty, and HtmlAnnotator.scss hides them so they are never sized to the content.
const HtmlHighlightAnnotations = ({ activeAnnotationId, annotations, ...rest }: Props): JSX.Element => (
    <>
        <HtmlHighlightList
            activeId={activeAnnotationId}
            annotations={annotations}
            onSelect={rest.setActiveAnnotationId}
        />
        <HighlightAnnotations {...rest} activeAnnotationId={activeAnnotationId} annotations={[]} />
    </>
);

export default HtmlHighlightAnnotations;
