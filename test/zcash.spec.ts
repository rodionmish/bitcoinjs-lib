import { describe } from 'mocha';
import { networks } from '../ts_src/utxo/networks';
import * as payments from '../ts_src/payments';
import * as zcashAddress from '../ts_src/utxo/zcash/address';
import { from, inputs, outputs } from '../test/fixtures/core/zcash.json';
import { ZcashTransactionBuilder } from '../ts_src/utxo/zcash/ZcashTransactionBuilder';
import wif = require('wif');
import { Network } from '../ts_src';
// import { ECPair } from 'ecpair';
// TODO: need ECPAIR from library
import * as ECPair from '../ts_src/ecpair';

describe('Bitcoin cash', () => {
  describe('create address', () => {
    const keyPair = ECPair.makeRandom({
      network: networks.zcashTest as Network,
    });

    const addressDataBit = payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: networks.zcashTest as Network,
    });

    const addressData = zcashAddress.fromOutputScript(
      addressDataBit.output!,
      networks.zcashTest,
    );
    const res = {
      privateKey: keyPair!.privateKey!.toString('hex'),
      address: addressData,
    };

    console.log(res);
  });

  describe('create transaction', () => {
    const zCashBuilder = new ZcashTransactionBuilder(networks.zcashTest);
    zCashBuilder.setVersion(4);
    zCashBuilder.setVersionGroupId(parseInt('0x892F2085', 16));
    zCashBuilder.setConsensusBranchId(networks.zcashTest.consensusBranchId[4]);
    let signedPairs: Map<any, any> = new Map();
    for (const input of from) {
      let buf = Buffer.from(input.privateKey, 'hex');
      if (!buf.length) {
        buf = wif.decode(input.privateKey).privateKey;
      }
      const signed = ECPair.fromPrivateKey(buf, {
        network: networks.zcashTest as Network,
      });
      signedPairs.set(input.address, signed);
    }
    inputs.forEach(input => {
      zCashBuilder.addInput(input.txId, input.vout);
    });
    outputs.forEach(output => {
      zCashBuilder.addOutput(output.address, output.value);
    });
    zCashBuilder.tx.ins.map(
      (i, index) => ((i as any).value = inputs[index].value),
    );
    inputs.forEach((input, index) => {
      const el = signedPairs.get(input.address);
      if (el !== undefined) {
        zCashBuilder.sign(index, el);
      }
    });
    const builtTransaction = zCashBuilder.build() as any;
    console.log(builtTransaction.toHex());
  });
});
