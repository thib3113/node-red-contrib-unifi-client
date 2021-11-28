import { NodeAPI } from 'node-red';
import { TechnicalNode } from '../lib/TechnicalNode';
import * as REDRegistry from '@node-red/registry';
import Controller from 'unifi-client';
import { TControllerNode } from '../types/TControllerNode';
import { TControllerCredentials } from '../types/TControllerCredentials';

class ControllerNode extends TechnicalNode<TControllerNode, any, TControllerCredentials> {
    init(
        type: string,
        construct?: (node: any, definition: any) => void,
        opts?: { credentials?: REDRegistry.NodeCredentials<any>; settings?: REDRegistry.NodeSettings<any> }
    ) {
        super.init(type, construct, opts, () => {
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
                        // @ts-ignore (logged not public for the moment)
                        if (this.node.controller?.logged) {
                            await this.node.controller.logout();
                        }
                    }
                } catch (e: any) {
                    this.node.error(e.message);
                } finally {
                    done();
                }
            });
        });
    }
}

module.exports = (RED: NodeAPI) => {
    const node = new ControllerNode(RED);
    node.init('unifi-controller', undefined, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' }
        }
    });
};
