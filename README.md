# node-red-contrib-unifi-client

This project add some nodes to node-red, to interact with unifi from [ubiquiti](https://ui.com) .

This project, is mainly a proof of concept of the library [unifi-client](https://github.com/thib3113/unifi-client), and so mainly reuse tested functions .

You can read nodes documentation [here](https://github.com/thib3113/node-red-contrib-unifi-client/wiki) .

## Requirements
- Installed UniFi-Controller version v6 or newer
- An unifi user, without 2FA*

*: 2FA is supported, but not adapted to automated usage .

## Installation recommended
The recommended way to install this module is from the Node-RED GUI itself.
Menu/manage palette/Install/search for unifi and then click install.

## Main Nodes

### unifi-raw-controller-request
Allow you to do all the request you want to unifi . The node will do the connection and other for you, and then return directly the result of the request in msg.payload

### unifi-door-events
Check for events on Unifi access Doors, and send a message per event .

Can be used to trigger a workflow depending on who open the door .

### unifi-access-unlock-relais
Ask to unlock a relais (doors for example)

## Developpers / Contributing
Adding nodes to this library is pretty easy .

First of all, be sure to have a ready node-red environnement (follow install tutorial), then clone the repos and install it in node-red config directory with a local module `npm i /home/thib3113/repo/` .

Then, you can create a new node, you can check the example of `DoorEvents` :
```
- create a ts file in src/nodes
  - create a classe extending Node
  - export a function that will call the function "registerNode"
- create an html file with the same name as the ts file (without the extension)
- configure the package.json node-red part to add your node
```

To do request to Unifi, feel free to read the documentation of [unifi-client](https://thib3113.github.io/unifi-client/) .

When you are ready, open a PR

Thank you
