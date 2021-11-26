// import { describe } from 'mocha';
// import { ECPair } from 'ecpair';
// import { networks } from '../ts_src/utxo/networks';
// import { Network } from 'ecpair/src/networks';
// import * as payments from '../ts_src/payments';
// import * as bitcashAddress from '../ts_src/utxo/bitcoincash/address';
// import { from, inputs, outputs } from './fixtures/core/bitcash.json';
// import wif = require('wif');
// import { UtxoTransactionBuilder } from '../ts_src/utxo/UtxoTransactionBuilder';
// const SIGHASH_ALL = 0x01;
// const SIGHASH_BITCOINCASHBIP143 = 0x40;

// describe('Bitcoin cash', () => {
//   describe('create address', () => {
//     const keyPair = ECPair.makeRandom({
//       network: networks.bitcoincashTestnet as Network,
//     });

//     const addressDataBit = payments.p2pkh({
//       pubkey: keyPair.publicKey,
//       network: networks.bitcoincashTestnet as Network,
//     });

//     const addressData = bitcashAddress.fromOutputScriptToCashAddress(
//       addressDataBit.output!,
//       networks.bitcoincashTestnet,
//     );

//     const res = {
//       privateKey: keyPair!.privateKey!.toString('hex'),
//       address: addressData,
//     };
//     console.log(res);
//   });

//   describe('create transaction', () => {
//     const bitcashBuilder = new UtxoTransactionBuilder(
//       networks.bitcoincashTestnet,
//     );

//     let signedPairs: Map<any, any> = new Map();

//     for (const input of from) {
//       let buf = Buffer.from(input.privateKey, 'hex');
//       if (!buf.length) {
//         buf = wif.decode(input.privateKey).privateKey;
//       }

//       const signed = ECPair.fromPrivateKey(buf, {
//         network: networks.bitcoincashTestnet as Network,
//       });

//       signedPairs.set(input.address, signed);
//     }

//     const normalizedAddresses = outputs.map(output => ({
//       ...output,
//       address: bitcashAddress.toOutputScriptFromCashAddress(
//         output.address,
//         networks.bitcoincashTestnet,
//       ),
//     }));

//     inputs.forEach(input => {
//       bitcashBuilder.addInput(input.txId, input.vout);
//     });

//     normalizedAddresses.forEach(output => {
//       bitcashBuilder.addOutput(output.address, output.value);
//     });

//     bitcashBuilder.setVersion(2);

//     const hashType = SIGHASH_ALL | SIGHASH_BITCOINCASHBIP143;

//     inputs.forEach((input, index) => {
//       const el = signedPairs.get(input.address);

//       console.log('TRYTRYTRY', index, el, undefined, hashType, input.value);
//       if (el !== undefined) {
//         bitcashBuilder.sign(index, el, undefined, hashType, input.value);
//       }
//     });
//     const builtTransaction = bitcashBuilder.build();

//     console.log(builtTransaction.toHex());
//   });
// });
