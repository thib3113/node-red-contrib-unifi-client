import { NodeAPI } from 'node-red';
import { TechnicalNode } from '../lib/TechnicalNode';
import Controller from 'unifi-client';
import { TControllerNode } from '../types/TControllerNode';
import { TControllerCredentials } from '../types/TControllerCredentials';
import { registerNode } from '../lib/registerNode';

class ControllerNode extends TechnicalNode<TControllerNode, any, TControllerCredentials> {
    protected async init(): Promise<void> {
        await super.init();
        this.node.controller = new Controller({
            username: this.node.credentials.username,
            password: this.node.credentials.password,
            url: this.definition.url,
            strictSSL: this.definition.strictSSL
        });

        this.node.on('close', async (removed: boolean, done: () => void) => {
            try {
                if (removed) {
                    // This node has been disabled/deleted
                    // try to logout
                    if (this.node.controller.logged) {
                        await this.node.controller.logout();
                    }
                }
            } catch (e: any) {
                this.node.error(e.message);
            } finally {
                done();
            }
        });
    }
}

module.exports = (RED: NodeAPI) => {
    registerNode(RED, 'unifi-controller', ControllerNode, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' }
        }
    });
};
