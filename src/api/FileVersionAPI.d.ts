/* eslint-disable @typescript-eslint/no-explicit-any */

export default class {
    constructor(options: any) {
        this.options = options;
    }

    fetchAnnotations(versionId: string): Promise<any>;

    destroy(): void;
}
