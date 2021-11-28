import * as RED from 'node-red';
import { Method } from 'axios';
import { EProxyNamespaces } from 'unifi-client';

export type TRawControllerRequestNodeMsg = RED.NodeMessageInFlow &
    Partial<{
        method: Method;
        url: string;
        proxyNamespace: EProxyNamespaces;
        data: Record<string, any>;
        params: Record<string, any>;
        urlParams: Record<string, string>;
        site: string;
        apiVersion: number;
    }>;
