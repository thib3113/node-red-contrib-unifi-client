import { ControllerNode } from '../lib/ControllerNode';
import * as REDRegistry from '@node-red/registry';
import { ENodeStatus } from '../lib/ENodeStatus';
import { EProxyNamespaces } from 'unifi-client';
import { TSendMessage } from '../types/TSendMessage';
import { TGetAccessDevicesNode } from '../types/TGetAccessDevicesNode';
import { TGetAccessDevicesNodeConfig } from '../types/TGetAccessDevicesNodeConfig';
import { registerNode } from '../lib/registerNode';

export interface TopoCommons {
    unique_id: string;
    name: string;
    up_id: string;
    timezone: string;
    location_type: string;
    extra_type: string;
    full_name: string;
    level: number;
    work_time: string;
    work_time_id: string;
    extras: Record<string, string>;
}

export interface Topology extends TopoCommons {
    floors: Array<Floor>;
}

export interface Floor extends TopoCommons {
    doors: Array<Door>;
}

export interface Door extends TopoCommons {
    device_groups?: Array<Array<DeviceGroup>>;
    hotel_devices?: Array<any>;
}

export interface DeviceGroup {
    unique_id: string;
    name: string;
    device_type: string;
    connected_uah_id: string;
    location_id: string;
    firmware: string;
    version: string;
    ip: string;
    mac: string;
    hw_type: string;
    start_time: number;
    security_check: boolean;
    resource_name: string;
    revision: string;
    revision_update_time: number;
    version_update_time: number;
    firmware_update_time: number;
    adopt_time: number;
    location: Door;
    configs: Array<Config>;
    is_connected: boolean;
    is_online: boolean;
    is_revision_up_to_date: boolean;
    is_adopted: boolean;
    is_managed: boolean;
    update: null;
    capabilities: Array<string>;
}

export interface Config {
    device_id: string;
    key: string;
    value: string;
    tag: string;
}

class GetAccessDevicesNode extends ControllerNode<TGetAccessDevicesNode, TGetAccessDevicesNodeConfig> {
    protected async init(): Promise<void> {
        await super.init();
        this.node.on('input', async (_msg, send, done) => {
            try {
                await this.getDevices(send);
            } catch (e: any) {
                this.node.error(e);
            }
            done();
        });
    }

    private async getDevices(sendFn?: (msg: TSendMessage) => void) {
        try {
            this.setStatus(ENodeStatus.PENDING, 'send request');

            try {
                //better way to do this ?
                const res = await this.controller.getInstance().get<{
                    code: number;
                    msg: string;
                    data: Array<Topology>;
                }>('/devices/topology', {
                    apiVersion: 2,
                    proxyNamespace: EProxyNamespaces.ACCESS
                });

                //get events from request
                const topologies = res.data.data;

                const devices = topologies
                    .map((topologie) => topologie.floors.map((floor) => floor.doors.map((door) => door.device_groups)))
                    .flat(4)
                    //remove undefined results
                    .filter((d) => !!d) as Array<DeviceGroup>;

                devices.forEach((d) => {
                    this.send(
                        {
                            payload: {
                                device: d
                            }
                        },
                        sendFn
                    );
                });

                this.setStatus(ENodeStatus.READY, 'done');
            } catch (e: any) {
                this.node.error(e);
                this.setStatus(ENodeStatus.ERROR, `fail to list access devices : ${e.message}`);
            }
        } catch (e: any) {
            this.node.error(e);
        }
    }
}

module.exports = (RED: REDRegistry.NodeAPI) => {
    registerNode(RED, 'unifi-get-access-devices', GetAccessDevicesNode);
};
