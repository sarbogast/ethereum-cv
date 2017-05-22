# Ethereum CV
Sample Ethereum Smart Contract to create your resume.

Follow the steps described here below to install, deploy and run the Dapp.

## Step 1. Clone the project

`git clone https://github.com/sarbogast/ethereum-cv.git`


## Step 2. Install all modules

`cd ethereum-cv`
`npm install`


## Step 3. Start your Ethereum node

Start testrpc or your private chain

## Step 4. Configure your project

Edit the file "truffle.js" and set the port number according your Ethereum node.

## Step 5. Compile and Deploy your smart contract

`truffle compile`
`truffle migrate`

## Step 6. Metamask: link to your private node

Open the Metamask extension on Chrome and switch it to the address of your Ethereum node.

## Step 7. Metamask: import your accounts

Import the accounts defined in your Ethereum node.

## Step 8. Run you server

`npm run dev`

## Step 9. Metamask: switch to the coinbase account

The experience of your resume can be added only by the owner of the smart contract.
From Metamask, switch your account to the account used to deploy the contract.

From the Geth console, this account can be identified by running this command:
`eth.coinbase`

From testrpc, the default account is the account[0]

## Step 10. Open the application

From your browser, open the URL: http://localhost:8080

## Step 11. Add an experience

As the owner of the Smart Contract, add a new experience.

Metasmask will ask you to confirm the transaction.

## Step 12. Start the mining

If it's not already the case, start the mining process.

From the Geth console, start the following command:
`miner.start()`

From testrpc, the mining is already started.

## Step 13. Display the experience

When the block is mined, the experiences will be automatically displayed.

## Step 14. Superstitious ?

This step is empty to avoid 13 steps :-)

## Bonus

* Add an experience with an account that is not the contract's owner. The new experience should not be appended to the list.
* Switch to an account that is not the contract's owner and try to refresh the page. You should able to see all experiences.
* Display the events:
** Uncomment the div section from the index.html file
** Uncomment the code located into the listenToEvents function

## Tips

* Is Metasmask slow ? try to disable and enable the extension.
* This behaviour happens sometimes mainly when we work with a private chain.
* when you switch the account from Metamask, don't forget to refresh the page of your application to ensure to get the current account set on Metamask.


Have fun !!!

ChainSkills Team - 2017
