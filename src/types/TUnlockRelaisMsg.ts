import * as RED from 'node-red';

export type TUnlockRelaisMsg = RED.NodeMessageInFlow &
    Partial<{
        deviceId: string;
    }>;
