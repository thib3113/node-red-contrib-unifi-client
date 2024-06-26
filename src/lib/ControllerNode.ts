import * as REDRegistry from '@node-red/registry';
import { TechnicalNode } from './TechnicalNode';
import { TNodeConfig } from '../types/TNodeConfig';
import { TControllerNode } from '../types/TControllerNode';
import { ENodeStatus } from './ENodeStatus';
import { Controller, Site } from 'unifi-client';
import { TSendMessage } from '../types/TSendMessage';

export class ControllerNode<
    TNode extends REDRegistry.Node<TCredentials> = any,
    TNodeDefinition extends TNodeConfig = TNodeConfig,
    TCredentials extends Object = {}
> extends TechnicalNode<TNode, TNodeDefinition, TCredentials> {
    private readonly sitesCache: Record<string, Site> = {};

    get site(): Site {
        if (!this._site) {
            throw new Error(`can't retrieve _site before init`);
        }
        return this._site;
    }
    private _site?: Site;

    get controller(): Controller {
        if (!this._controller) {
            throw new Error(`can't retrieve _controller before init`);
        }
        return this._controller;
    }
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

    protected async init(): Promise<void> {
        await super.init();
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

        const { controller, site } = controllerNode;
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

        try {
            this._site = await this.getSite(site);
        } catch (e: any) {
            this.setStatus(ENodeStatus.ERROR, e.message);
            return;
        }

        this.setStatus(ENodeStatus.READY, 'connected to unifi');
    }

    async getSite(name?: string): Promise<Site> {
        if (!name) {
            return this.site;
        }

        if (this.sitesCache[name]) {
            return this.sitesCache[name];
        }

        const site = (await this.controller.getSites()).find((s) => s.name === name);
        if (!site) {
            throw new Error(`fail to get site :"${name}`);
        }
        return (this.sitesCache[name] = site);
    }

    protected send(msg: TSendMessage, sendFn?: (msg: TSendMessage) => void) {
        (sendFn || this.node.send.bind(this.node))(msg);
    }
}
