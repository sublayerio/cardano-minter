const cardano = require('./cardano')

const createTransaction = (tx) => {
  const raw = cardano.transactionBuildRaw(tx);
  const fee = cardano.transactionCalculateMinFee({
    ...tx,
    txBody: raw,
  });
  tx.txOut[0].value.lovelace -= fee;
  return cardano.transactionBuildRaw({ ...tx, fee });
};

const signTransaction = (wallet, tx) => {
  return cardano.transactionSign({
    signingKeys: [wallet.payment.skey, wallet.payment.skey],
    txBody: tx,
  });
};

const wallet = cardano.wallet("ADAPI");

const mintScript = {
  keyHash: cardano.addressKeyHash(wallet.name),
  type: "sig",
};

const policy = cardano.transactionPolicyid(mintScript);
const ASSET_NAME = policy + ".PiPurple69";

const metadata = {
  721: {
    [policy]: {
      "PiPurple69": {
        "image": "ipfs://QmdsGwHo9EqqA6pFCKs64p7P4HWJVfHksa8abmw8FMCrjn",
        "name": "PiPurple69",
        "authors": ["Wael", "Olivier"],
        "website": "http://ada-pi.io/"
      }
    }
  }
}


const invalidAfter = cardano.queryTip().slot + 10000

console.log('invalidAfter', invalidAfter)

let tx = {
  invalidAfter,
  txIn: wallet.balance().utxo,
  txOut: [
    {
      address: wallet.paymentAddr,
      value: { ...wallet.balance().value, [ASSET_NAME]: 1 },
    },
  ],
  mint: {
    action: [{ type: "mint", quantity: 1, asset: ASSET_NAME }],
    script: [mintScript]
  },
  metadata,
  witnessCount: 2,
};

// console.log(JSON.stringify(tx, null, 2))

let raw = createTransaction(tx);
let signed = signTransaction(wallet, raw);
console.log(cardano.transactionView({ txFile: signed }));
let txHash = cardano.transactionSubmit(signed);
console.log(txHash);