import * as REDRegistry from '@node-red/registry';
import { TechnicalNode } from './TechnicalNode';
import { TNodeConfig } from '../types/TNodeConfig';
import { TControllerNode } from '../types/TControllerNode';
import { ENodeStatus } from './ENodeStatus';
import { Controller } from 'unifi-client';
import { TSendMessage } from '../types/TSendMessage';

export class Node<
    TNode extends REDRegistry.Node<TCredentials> = any,
    TNodeDefinition extends TNodeConfig = TNodeConfig,
    TCredentials = any,
    TSettings = any
> extends TechnicalNode<TNode, TNodeDefinition, TCredentials, TSettings> {
    get controller(): Controller {
        if (!this._controller) {
            throw new Error(`can't retrieve _controller before init`);
        }
        return this._controller;
    }
    // private controllerNode?: unifiControllerNode;
    private _controller?: Controller;

    protected setStatus(status: ENodeStatus, text?: string) {
        let nodeStatus: REDRegistry.NodeStatus | null;
        switch (status) {
            case ENodeStatus.PENDING:
                nodeStatus = {
                    fill: 'yellow',
                    shape: 'ring'
                };
                break;
            case ENodeStatus.READY:
                nodeStatus = {
                    fill: 'green',
                    shape: 'dot'
                };
                break;
            case ENodeStatus.ERROR:
                nodeStatus = {
                    fill: 'red',
                    shape: 'dot'
                };
                break;
            case ENodeStatus.RESET:
            default:
                nodeStatus = {};
                break;
        }

        if (text && status !== ENodeStatus.RESET) {
            nodeStatus.text = text;
        }
        this.node.status(nodeStatus);
    }

    public init(
        type: string,
        construct?: (node: any, definition: any) => void,
        opts?: { credentials?: REDRegistry.NodeCredentials<any>; settings?: REDRegistry.NodeSettings<any> },
        postConstructFn?: () => void
    ): void {
        super.init(type, construct, opts, async () => {
            this.setStatus(ENodeStatus.PENDING, 'starting');

            if (!this.definition.controllerNodeId) {
                this.setStatus(ENodeStatus.ERROR, 'Controller not configured');
                return;
            }

            const controllerNode = this.nodeRED.nodes.getNode(this.definition.controllerNodeId) as TControllerNode;

            if (!controllerNode) {
                this.setStatus(ENodeStatus.ERROR, 'fail to get controller configuration');
                return;
            }

            const { controller } = controllerNode;
            if (!controller) {
                this.setStatus(ENodeStatus.ERROR, 'fail to get controller configuration');
                return;
            }

            this._controller = controller;

            this.setStatus(ENodeStatus.PENDING, 'connecting to unifi');

            try {
                await controller.login();
            } catch (e: any) {
                this.setStatus(ENodeStatus.ERROR, e.message);
                return;
            }

            this.setStatus(ENodeStatus.READY, 'connected to unifi');

            if (postConstructFn) {
                postConstructFn();
            }
        });
    }

    protected send(msg: TSendMessage, sendFn?: (msg: TSendMessage) => void) {
        (sendFn || this.node.send)(msg);
    }
}
