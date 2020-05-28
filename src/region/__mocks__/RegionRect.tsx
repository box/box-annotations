import React from 'react';

export default React.forwardRef((props, ref: React.Ref<HTMLDivElement>) => <div ref={ref} />);
