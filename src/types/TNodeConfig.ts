import * as RED from 'node-red';

export type TNodeConfig = RED.NodeDef & {
    controllerNodeId: string;
};
