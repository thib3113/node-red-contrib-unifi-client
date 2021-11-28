import * as RED from 'node-red';
import { TDoorEventsNodeConfig } from './TDoorEventsNodeConfig';

export type TDoorEventsMsg = RED.NodeMessageInFlow &
    Partial<TDoorEventsNodeConfig> &
    Partial<{
        until: number;
    }>;
