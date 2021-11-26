import { describe } from 'mocha';
import { ECPair } from 'ecpair';
import { networks } from '../ts_src/utxo/networks';
import { Network } from 'ecpair/src/networks';
import * as payments from '../ts_src/payments';
import { from, inputs, outputs } from '../test/fixtures/core/dash.json';
import { DashTransactionBuilder } from '../ts_src/utxo/dash/DashTransactionBuilder';
import wif = require('wif');

describe('Dash', () => {
  describe('create address', () => {
    const keyPair = ECPair.makeRandom({
      network: networks.dashTest as Network,
    });

    const addressData = payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: networks.dashTest as Network,
    });

    const res = {
      privateKey: keyPair!.privateKey!.toString('hex'),
      address: addressData.address,
    };
    console.log(res);
  });

  describe('create transaction', () => {
    const dashBuilder = new DashTransactionBuilder(networks.dashTest);

    let signedPairs: Map<any, any> = new Map();

    for (const input of from) {
      let buf = Buffer.from(input.privateKey, 'hex');
      if (!buf.length) {
        buf = wif.decode(input.privateKey).privateKey;
      }

      const signed = ECPair.fromPrivateKey(buf, {
        network: networks.dashTest as Network,
      });

      signedPairs.set(input.address, signed);
    }

    inputs.forEach(input => {
      dashBuilder.addInput(input.txId, input.vout);
    });

    outputs.forEach(output => {
      dashBuilder.addOutput(output.address, output.value);
    });

    inputs.forEach((input, index) => {
      const el = signedPairs.get(input.address);

      if (el !== undefined) {
        dashBuilder.sign(index, el);
      }
    });
    const builtTransaction = dashBuilder.build();

    console.log(builtTransaction.toHex());
  });
});
