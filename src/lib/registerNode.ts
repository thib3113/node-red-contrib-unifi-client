import * as RED from 'node-red';
import * as REDRegistry from '@node-red/registry';
import { TechnicalNode } from './TechnicalNode';

export function registerNode<
    TNode extends REDRegistry.Node<TCredentials> = any,
    TNodeDefinition extends REDRegistry.NodeDef = any,
    TCredentials = any,
    TSettings = any
>(
    nodeRED: RED.NodeAPI,
    type: string,
    nodeConstructor: new (nodeRED: RED.NodeAPI) => TechnicalNode<TNode, TNodeDefinition, TCredentials>,
    opts?: {
        credentials?: REDRegistry.NodeCredentials<TCredentials>;
        settings?: REDRegistry.NodeSettings<TSettings>; // tslint:disable-line:no-unnecessary-generics
    }
) {
    nodeRED.nodes.registerType(
        type,
        function (this: TNode, definition: TNodeDefinition) {
            try {
                const node = new nodeConstructor(nodeRED);
                node.nodeConstructor(this, definition);
            } catch (e) {
                this.error(e);
            }
        },
        opts
    );
}
