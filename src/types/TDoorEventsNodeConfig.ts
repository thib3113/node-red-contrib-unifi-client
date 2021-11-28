import { TNodeConfig } from './TNodeConfig';

export type TDoorEventsNodeConfig = TNodeConfig & {
    pollInterval: number;
    polling: boolean;
};
