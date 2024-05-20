import * as RED from 'node-red';

export type TSiteMsg = RED.NodeMessageInFlow &
    Partial<{
        site: string;
    }>;
