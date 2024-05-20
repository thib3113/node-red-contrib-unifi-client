import * as REDRegistry from '@node-red/registry';
import * as RED from 'node-red';

export class TechnicalNode<
    TNode extends REDRegistry.Node<TCredentials> = any,
    TNodeDefinition extends REDRegistry.NodeDef = any,
    TCredentials extends Object = {}
> {
    protected get definition(): TNodeDefinition {
        if (!this._definition) {
            throw new Error(`can't retrieve definition before init`);
        }
        return this._definition;
    }
    protected get node(): TNode {
        if (!this._node) {
            throw new Error(`can't retrieve node before init`);
        }
        return this._node;
    }
    private _node?: TNode;
    private _definition?: TNodeDefinition;
    /**
     * @param nodeRED - the object coming from node-red
     */
    constructor(readonly nodeRED: RED.NodeAPI) {}

    //arrow function for binding
    public nodeConstructor = (node: TNode, definition: TNodeDefinition): void => {
        this._node = node;
        this._definition = definition;
        this.nodeRED.nodes.createNode(node, definition);
        this.init();
    };

    protected async init(): Promise<void> {}
}
