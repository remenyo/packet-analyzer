# packet-analyzer

This small project is to intercept an UDP communication.
Don't use it for serious things, it is not tested.

## How it works

S E R V E R <-WebSocket-> BROWSER  \
|\
| UDP\
|\
port 0 & 1

Path of an udp packet:\

sender -> port0 (server) -> browser -> server (port1) -> reciever\

It can work backwards as well, I made a crude NAT implementation.
