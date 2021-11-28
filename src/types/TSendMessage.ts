import { NodeMessage } from '@node-red/registry';

export type TSendMessage = NodeMessage | Array<NodeMessage | Array<NodeMessage> | null>;
