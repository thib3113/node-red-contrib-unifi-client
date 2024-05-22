import { ControllerNode } from '../lib/ControllerNode';
import * as REDRegistry from '@node-red/registry';
import { registerNode } from '../lib/registerNode';
import { TGetClientsNode } from '../types/TGetClientsNode';
import { TGetClientsNodeConfig } from '../types/TGetClientsNodeConfig';
import { TGetClientsMsg } from '../types/TGetClientsMsg';

class GetActivesClientsNode extends ControllerNode<TGetClientsNode, TGetClientsNodeConfig> {
    protected async init(): Promise<void> {
        await super.init();

        this.node.on('input', async (msg: TGetClientsMsg, _send, done) => {
            try {
                const { active } = (msg.payload ?? {}) as { active?: boolean };

                _send({
                    payload:
                        (
                            await (await this.getSite(msg?.site)).clients
                                .getInstance()
                                .get(`/clients/${active != false ? 'active' : 'history'}`, {
                                    params: {
                                        includeUnifiDevices: true,
                                        withinHours: 0
                                    },
                                    apiVersion: 2
                                })
                        ).data ?? []
                });
            } catch (e: any) {
                this.node.error(e);
            }
            done();
        });
    }
}

module.exports = (RED: REDRegistry.NodeAPI) => {
    registerNode(RED, 'unifi-network-get-active-clients', GetActivesClientsNode);
};
