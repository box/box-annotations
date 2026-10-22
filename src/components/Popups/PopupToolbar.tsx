import React from 'react';
import { BlueprintProvider, Toolbar, TooltipProvider, useNoopTreatment } from '@box/blueprint-web';

// The host listens for these on the document (page flips, video seeking and play, file navigation),
// so the ones the toolbar uses for roving focus and button activation stay inside it
const TOOLBAR_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '];

export type Props = {
    'aria-label'?: string;
    children: React.ReactNode;
    // Fullscreen only shows the fullscreen element's subtree, so tooltips must portal inside the preview
    tooltipContainer?: HTMLElement | null;
};

const PopupToolbar = ({ children, tooltipContainer, ...rest }: Props, ref: React.Ref<HTMLDivElement>): JSX.Element => {
    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (TOOLBAR_KEYS.includes(event.key)) {
            event.stopPropagation();
        }
    };

    // Annotations has no Split client, so Blueprint's treatment-driven configuration resolves to its defaults
    return (
        <BlueprintProvider useTreatment={useNoopTreatment}>
            <TooltipProvider container={tooltipContainer ?? undefined}>
                <Toolbar.Root ref={ref} colorScheme="dark" onKeyDown={handleKeyDown} {...rest}>
                    {children}
                </Toolbar.Root>
            </TooltipProvider>
        </BlueprintProvider>
    );
};

export default React.forwardRef(PopupToolbar);
