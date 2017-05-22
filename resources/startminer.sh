#!/bin/bash

geth --identity "miner" --networkid 42 --datadir "../chain" --nodiscover --rpc --rpccorsdomain "*" --nat "any" --rpcapi eth,web3,personal,net --ipcpath "~/Library/Ethereum/geth.ipc"
