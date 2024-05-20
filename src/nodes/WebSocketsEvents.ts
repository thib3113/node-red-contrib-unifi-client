import { ControllerNode } from '../lib/ControllerNode';
import * as REDRegistry from '@node-red/registry';
import { registerNode } from '../lib/registerNode';
import { TWebSocketsEventsNode } from '../types/TWebSocketsEventsNode';
import { TWebSocketsEventsNodeConfig } from '../types/TWebSocketsEventsNodeConfig';

class WebSocketsEventsNode extends ControllerNode<TWebSocketsEventsNode, TWebSocketsEventsNodeConfig> {
    protected async init(): Promise<void> {
        await super.init();

        const site = await this.getSite(this.definition.site);
        site.on(this.definition.event ?? '*', (...args: Array<unknown>) => {
            let topic: string | undefined = this.definition.event;
            let payload: unknown = args;

            const args0 = args[0];
            if (args0 && typeof args0 === 'string') {
                topic = args0;
                payload = args.slice(1);
            }

            const msg = {
                topic,
                payload
            };

            this.send(msg);
        });
        await site.initWebSockets();
    }
}

module.exports = (RED: REDRegistry.NodeAPI) => {
    registerNode(RED, 'unifi-core-events', WebSocketsEventsNode);
};
