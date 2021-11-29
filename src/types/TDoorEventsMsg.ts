import * as RED from 'node-red';

export type TDoorEventsMsg = RED.NodeMessageInFlow &
    Partial<{
        until: number;
    }>;
