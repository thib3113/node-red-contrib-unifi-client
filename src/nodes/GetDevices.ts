import { ControllerNode } from '../lib/ControllerNode';
import * as REDRegistry from '@node-red/registry';
import { registerNode } from '../lib/registerNode';
import { TGetDevicesNode } from '../types/TGetDevicesNode';
import { TGetDevicesNodeConfig } from '../types/TGetDevicesNodeConfig';
import { TGetDevicesMsg } from '../types/TGetDevicesMsg';

class GetDevicesNode extends ControllerNode<TGetDevicesNode, TGetDevicesNodeConfig> {
    protected async init(): Promise<void> {
        await super.init();

        this.node.on('input', async (msg: TGetDevicesMsg, _send, done) => {
            try {
                _send({
                    payload: await (await this.getSite(msg?.site)).devices.list()
                });
            } catch (e: any) {
                this.node.error(e);
            }
            done();
        });
    }
}

module.exports = (RED: REDRegistry.NodeAPI) => {
    registerNode(RED, 'unifi-network-get-devices', GetDevicesNode);
};
