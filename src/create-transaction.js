const cardano = require("./cardano")

//funded wallet
const sender = cardano.wallet("ADAPI");
console.log(
    "Balance of Sender wallet: " +
    cardano.toAda(sender.balance().amount.lovelace) +
    " ADA"
);

//receiver address
const receiver =
    "addr1qy665r5aehc7s6qs0mdkuzxt6ywlfmxra9d52nvypztrue4svcnspa6ljktrhpxj2rfjv09xyxppd9lvg0mkzk3cj7gs2nn4rg";

const invalidAfter = cardano.queryTip().slot + 10000

console.log(sender.balance().amount)

// create raw transaction
let txInfo = {
    invalidAfter,
    txIn: cardano.queryUtxo(sender.paymentAddr),
    txOut: [
        {
            address: sender.paymentAddr,
            amount: {
                // lovelace: sender.balance().amount.lovelace,
                lovelace: sender.balance().amount.lovelace - cardano.toLovelace(1.5),
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiRain': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiRocket': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiSpaceTime': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiTimeWarp': 1
            },
        }, //amount going back to sender
        {
            address: receiver,
            amount: {
                lovelace: cardano.toLovelace(1.5),
                // lovelace: cardano.toLovelace(1),
                '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiStar': 1
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiRain': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiRocket': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiSpaceTime': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiTimeWarp': 1
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiPurple': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiShocker': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiTrippy': 1,
                // '12fc3123feb6f5c2d16aeb373eb99f677f2e1c6de9bd3cfe3a395e4d.PiWater': 1
            }
        }, //amount going to receiver
    ],
    metadata: { 1: { message: "With ❤️" } },
};
let raw = cardano.transactionBuildRaw(txInfo);

//calculate fee
let fee = cardano.transactionCalculateMinFee({
    ...txInfo,
    txBody: raw,
    witnessCount: 1,
});

//pay the fee by subtracting it from the sender utxo
txInfo.txOut[0].amount.lovelace -= fee;

//create final transaction
let tx = cardano.transactionBuildRaw({ ...txInfo, fee });

//sign the transaction
let txSigned = cardano.transactionSign({
    txBody: tx,
    signingKeys: [sender.payment.skey],
});

//broadcast transaction
let txHash = cardano.transactionSubmit(txSigned);
console.log("TxHash: " + txHash);