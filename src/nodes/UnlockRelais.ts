import { ControllerNode } from '../lib/ControllerNode';
import * as REDRegistry from '@node-red/registry';
import { ENodeStatus } from '../lib/ENodeStatus';
import { EProxyNamespaces } from 'unifi-client';
import { TUnlockRelaisMsg } from '../types/TUnlockRelaisMsg';
import { TUnlockRelaisNode } from '../types/TUnlockRelaisNode';
import { TUnlockRelaisNodeConfig } from '../types/TUnlockRelaisNodeConfig';
import { registerNode } from '../lib/registerNode';

class UnlockRelaisNode extends ControllerNode<TUnlockRelaisNode, TUnlockRelaisNodeConfig> {
    private deviceId: string = '';
    protected async init(): Promise<void> {
        await super.init();
        if (this.definition.deviceId) {
            this.deviceId = this.definition.deviceId;
        }

        this.node.on('input', async (msg: TUnlockRelaisMsg, _send, done) => {
            try {
                let deviceId = this.deviceId;
                if (msg.deviceId) {
                    deviceId = msg.deviceId;
                }

                await this.unlockRelais(deviceId);
            } catch (e: any) {
                this.node.error(e);
            }
            done();
        });
    }

    private async unlockRelais(deviceId?: string) {
        try {
            this.setStatus(ENodeStatus.PENDING, 'send request');

            try {
                const res = await this.controller.getInstance().put<{
                    code: number;
                    msg: string;
                    data: string;
                }>('/device/:device/relay_unlock', undefined, {
                    apiVersion: 2,
                    proxyNamespace: EProxyNamespaces.ACCESS,
                    urlParams: {
                        device: deviceId ?? this.deviceId
                    }
                });

                if (res.data.msg === 'success') {
                    this.setStatus(ENodeStatus.READY, 'done');
                } else {
                    this.setStatus(ENodeStatus.ERROR, 'something seems wrong');
                    this.node.error(res.data);
                }
            } catch (e: any) {
                this.node.error(e);
                this.setStatus(ENodeStatus.ERROR, `fail to unlock relais "${deviceId ?? this.deviceId}" : ${e.message}`);
            }
        } catch (e: any) {
            this.node.error(e);
        }
    }
}

module.exports = (RED: REDRegistry.NodeAPI) => {
    registerNode(RED, 'unifi-access-unlock-relais', UnlockRelaisNode);
};
