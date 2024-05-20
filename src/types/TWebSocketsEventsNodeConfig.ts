import { TNodeConfig } from './TNodeConfig';

export type TWebSocketsEventsNodeConfig = TNodeConfig & {
    site?: string;
    event?: string;
};
