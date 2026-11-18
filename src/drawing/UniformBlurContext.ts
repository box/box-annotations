import { createContext } from 'react';

// On: a drawing's shadow blurs the same number of pixels on both axes. DrawingSVG stretches a 100x100 viewBox over its
// layer, so its blur is 1% of the layer's width by 1% of its height; on a layer much taller than wide (a long HTML
// page) that stretches the shadow vertically. Off by default, which keeps the stretched blur.
const UniformBlurContext = createContext(false);

export default UniformBlurContext;
