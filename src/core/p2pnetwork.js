/*
  (c) 2021 Open AR Cloud
  This code is licensed under MIT license (see LICENSE for details)
*/

import { v4 as uuidv4 } from 'uuid';
import Perge from 'perge';
import Automerge, {change} from 'automerge'
import Peer from 'peerjs';


let instance;
const docSet = new Automerge.DocSet();

let updateFunction;


export function initialSetup() {
    // TODO: Add initial values to the docset
}

export function connect(headlessPeerId, isHeadless = false, updateftn) {
    console.log('connect', headlessPeerId);

    updateFunction = updateftn;

    const localPeerId = isHeadless ? headlessPeerId :uuidv4();

    setupPerge(localPeerId);
    setupPeerEvents(headlessPeerId, isHeadless);
}

export function disconnect() {
    console.log('disconnect');
}

export function send(message) {
    console.log(message);

    instance.select('event')(change, doc => {
        doc[message.event] = message.value;
    })
}

function updateReceived() {
    console.log('Received', JSON.stringify(docSet.docs, null, 2));

    if (updateFunction) {
        // TODO: There has to be a better way to get to the content of a doc
        updateFunction(JSON.parse(JSON.stringify(docSet.docs)).event);
    }
}

function setupPerge(peerId) {
    const peer = new Peer(peerId, {
        host:'peerjs-server.herokuapp.com', secure:true, port:443
    })

    instance = new Perge(peerId, {
        decode: JSON.parse, // msgpack or protobuf would also be a good option
        encode: JSON.stringify,
        peer: peer,
        docSet: docSet
    })

    instance.subscribe(() => {
        console.log('instance.subscribe');
        updateReceived();
    })
}

function setupPeerEvents(headlessPeerId, isHeadless) {
    //Emitted when a connection to the PeerServer is established.
    instance.peer.on('open', (id) => {
        console.log('Connection to the PeerServer established. Peer ID ' + id);

        if (!isHeadless) {
            console.log('Connecting to headless');
            instance.connect(headlessPeerId);
        }
    });

    // Emitted when a new data connection is established from a remote peer.
    instance.peer.on('connection', (connection) => {
        console.log('Connection established with remote peer: ' + connection.peer);
    });

    // Errors on the peer are almost always fatal and will destroy the peer.
    instance.peer.on('error', (error) => {
        console.error('Error:' + error)
    })

    // Emitted when the peer is disconnected from the signalling server
    instance.peer.on('disconnected', () => {
        console.log('Disconnected from PeerServer')
    });

    // Emitted when the peer is destroyed and can no longer accept or create any new connections
    instance.peer.on('close', () => {
        console.log('Connection closed.');
    });
}
