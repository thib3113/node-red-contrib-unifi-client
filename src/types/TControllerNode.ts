import * as RED from 'node-red';
import Controller from 'unifi-client';
import { TControllerCredentials } from './TControllerCredentials';

export type TControllerNode = RED.Node<TControllerCredentials> & {
    controller: Controller;
};
