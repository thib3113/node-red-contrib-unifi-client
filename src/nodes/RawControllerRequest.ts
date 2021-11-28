import { NodeAPI } from 'node-red';
import { Node } from '../lib/Node';
import * as REDRegistry from '@node-red/registry';
import { TRawControllerRequestNode } from '../types/TRawControllerRequestNode';
import { TRawControllerRequestNodeMsg } from '../types/TRawControllerRequestNodeMsg';
import { EProxyNamespaces } from 'unifi-client';
import { Method } from 'axios';
import { ENodeStatus } from '../lib/ENodeStatus';

class RawControllerRequestNode extends Node<TRawControllerRequestNode> {
    init(
        type: string,
        construct?: (node: any, definition: any) => void,
        opts?: { credentials?: REDRegistry.NodeCredentials<any>; settings?: REDRegistry.NodeSettings<any> }
    ) {
        super.init(type, construct, opts, async () => {
            this.node.on('input', async (msg: TRawControllerRequestNodeMsg, send, done) => {
                try {
                    let method: Method = 'get';
                    if (
                        msg.method &&
                        ['get', 'delete', 'head', 'options', 'post', 'put', 'patch', 'purge', 'link', 'unlink'].includes(
                            msg.method?.toLowerCase()
                        )
                    ) {
                        method = msg.method?.toLowerCase() as Method;
                    } else if (msg.method) {
                        this.setStatus(ENodeStatus.ERROR, `unknown method "${msg.method}"`);
                    }

                    let url = '/';
                    if (msg.url) {
                        url = msg.url;
                    }

                    let proxyNamespace = undefined;
                    if (msg.proxyNamespace && Object.values(EProxyNamespaces)?.includes(msg.proxyNamespace)) {
                        proxyNamespace = msg.proxyNamespace;
                    } else if (msg.proxyNamespace) {
                        this.setStatus(ENodeStatus.ERROR, `unknown namespace "${msg.proxyNamespace}"`);
                    }

                    let data;
                    if (msg.data) {
                        data = msg.data;
                    }

                    let params;
                    if (msg.params) {
                        params = msg.params;
                    }

                    let urlParams;
                    if (msg.urlParams) {
                        urlParams = msg.urlParams;
                    }

                    let site;
                    if (msg.site) {
                        site = msg.site;
                    }
                    let apiVersion;
                    if (msg.apiVersion) {
                        apiVersion = msg.apiVersion;
                    }

                    const res = (
                        await this.controller.getInstance().request({
                            url,
                            method,
                            proxyNamespace,
                            data,
                            params,
                            urlParams,
                            site,
                            apiVersion
                        })
                    ).data;

                    this.send(
                        {
                            ...msg,
                            payload: {
                                data: res
                            }
                        },
                        send
                    );
                } catch (e: any) {
                    this.node.error(e);
                    this.send(
                        {
                            ...msg,
                            payload: {
                                error: {
                                    message: e.message,
                                    stack: e.stack,
                                    code: e.code
                                }
                            }
                        },
                        send
                    );
                }
                done();
            });
        });
    }
}

module.exports = (RED: NodeAPI) => {
    const node = new RawControllerRequestNode(RED);
    node.init('unifi-raw-controller-request');
};
