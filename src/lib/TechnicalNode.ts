import * as REDRegistry from '@node-red/registry';
import * as RED from 'node-red';

export class TechnicalNode<
    TNode extends REDRegistry.Node<TCredentials> = any,
    TNodeDefinition extends REDRegistry.NodeDef = any,
    TCredentials = any,
    TSettings = any
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
    private nodeConstructor = (
        node: TNode,
        definition: TNodeDefinition,
        construct: (node: TNode, definition: TNodeDefinition) => void = () => {}
    ): void => {
        this._node = node;
        this._definition = definition;
        this.nodeRED.nodes.createNode(node, definition);
        construct(node, definition);
    };

    /**
     * Registers a node constructor
     * @param type - the string type name
     * @param construct - the constructor function for this node type
     * @param opts - optional additional options for the node
     * @param postConstructFn - a function, called after each construc
     */
    public init(
        type: string,
        construct?: (node: TNode, definition: TNodeDefinition) => void,
        opts?: {
            credentials?: REDRegistry.NodeCredentials<TCredentials>;
            settings?: REDRegistry.NodeSettings<TSettings>; // tslint:disable-line:no-unnecessary-generics
        },
        postConstructFn?: () => void
    ): void {
        const self = this;
        this.nodeRED.nodes.registerType(
            type,
            function (this: TNode, definition: TNodeDefinition) {
                try {
                    self.nodeConstructor(this, definition, construct);
                    if (postConstructFn) {
                        postConstructFn();
                    }
                } catch (e) {
                    this.error(e);
                }
            },
            opts
        );
    }
}
