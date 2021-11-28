import { Node } from '../lib/Node';
import * as REDRegistry from '@node-red/registry';
import { ENodeStatus } from '../lib/ENodeStatus';
import { TDoorEventsNode } from '../types/TDoorEventsNode';
import { TDoorEventsNodeConfig } from '../types/TDoorEventsNodeConfig';
import { TDoorEventsMsg } from '../types/TDoorEventsMsg';
import { EProxyNamespaces } from 'unifi-client';
import { TSendMessage } from '../types/TSendMessage';

class DoorEventsNode extends Node<TDoorEventsNode, TDoorEventsNodeConfig> {
    private polling: boolean = false;
    private eventsUntil: number = 0;
    private get pollInterval(): number {
        return this._pollInterval;
    }
    private set pollInterval(value: number) {
        this._pollInterval = Number(value) > 0 ? Number(value) * 1000 : this.pollInterval;
    }
    private _pollInterval: number = 5000;
    private pollTimeout?: NodeJS.Timeout;
    init(
        type: string,
        construct?: (node: any, definition: any) => void,
        opts?: { credentials?: REDRegistry.NodeCredentials<any>; settings?: REDRegistry.NodeSettings<any> }
    ): void {
        super.init(type, construct, opts, () => {
            this.node.on('input', async (msg: TDoorEventsMsg, send, done) => {
                try {
                    //manually ask a verification
                    if (msg.pollInterval) {
                        this.pollInterval = msg.pollInterval;
                    }

                    if (msg.polling || msg.polling === false) {
                        if (msg.polling) {
                            this.polling = true;
                        } else {
                            this.polling = false;
                            this.pollLoopStop();
                        }
                    }

                    if (msg.until) {
                        this.eventsUntil = msg.until;
                    }

                    await this.poll(send);
                } catch (e: any) {
                    this.node.error(e);
                }
                done();
            });

            this.node.on('close', () => {
                this.pollLoopStop();
            });

            this.pollInterval = this.definition.pollInterval;

            if (this.definition.polling) {
                this.polling = true;
                this.poll();
            }
        });
    }

    private async poll(sendFn?: (msg: TSendMessage) => void) {
        try {
            this.pollLoopStop();

            this.setStatus(ENodeStatus.PENDING, 'start polling');

            try {
                const res = await this.controller.getInstance().get<{
                    code: number;
                    msg: string;
                    data: {
                        event: Array<{
                            events: Array<{
                                user_id: string;
                                name: string;
                                first_name: string;
                                last_name: string;
                                avatar: string;
                                sso_picture: string;
                                door: string;
                                door_id: string;
                                door_type: string;
                                location: string;
                                location_id: string;
                                location_type: string;
                                door_entry_method: string;
                                credential_provider: string;
                                event_time: number;
                                result: string;
                                resource_id: string;
                                resource_info: null;
                            }>;
                            total: number;
                            begin_timestamp: number;
                        }>;
                        event_count: Array<number>;
                        query_door_event_take_time: number;
                        query_user_take_time: number;
                        query_resource_take_time: number;
                        count_take_time: number;
                    };
                }>('/dashboard/timeline', {
                    apiVersion: 2,
                    proxyNamespace: EProxyNamespaces.ACCESS,
                    params: {
                        event_line_size: 8,
                        timestamp: Date.now(),
                        interval: 1,
                        scale_time: 5
                    }
                });

                //get events from request
                const { event } = res.data.data;
                const events = event
                    .filter((e) => e.total > 0)
                    .map((e) => e.events)
                    .flat()
                    // filter only new events
                    .filter((e) => e.event_time * 1000 >= this.eventsUntil);

                events.forEach((e) => {
                    this.send(
                        {
                            payload: {
                                door: {
                                    user_id: e.user_id,
                                    name: e.name,
                                    first_name: e.first_name,
                                    last_name: e.last_name,
                                    door: e.door,
                                    door_id: e.door_id,
                                    door_type: e.door_type,
                                    location: e.location,
                                    location_id: e.location_id,
                                    location_type: e.location_type,
                                    door_entry_method: e.door_entry_method,
                                    credential_provider: e.credential_provider,
                                    event_time: e.event_time,
                                    result: e.result,
                                    resource_id: e.resource_id,
                                    resource_info: e.resource_info
                                }
                            }
                        },
                        sendFn
                    );
                });

                this.eventsUntil = Date.now();
                this.setStatus(ENodeStatus.READY, 'end polling');
            } catch (e: any) {
                this.node.error(e);
                this.setStatus(ENodeStatus.ERROR, `fail to read door datas : ${e.message}`);
            }

            if (this.polling) {
                this.pollLoopStart();
            }
        } catch (e: any) {
            this.node.error(e);
        }
    }

    private pollLoopStop() {
        if (this.pollTimeout) {
            clearTimeout(this.pollTimeout);
        }
    }

    private pollLoopStart() {
        this.pollTimeout = setTimeout(() => {
            this.poll();
        }, this.pollInterval);
    }
}

module.exports = (RED: REDRegistry.NodeAPI) => {
    const node = new DoorEventsNode(RED);
    node.init('unifi-door-events');
};
