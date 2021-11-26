'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UtxoTransactionBuilder = void 0;
const transaction_builder_1 = require('../transaction_builder');
const UtxoTransaction_1 = require('./UtxoTransaction');
class UtxoTransactionBuilder extends transaction_builder_1.TransactionBuilder {
  constructor(network, txb, prevOutputs) {
    super();
    this.network = network;
    this.__TX = this.createInitialTransaction(network, txb?.__TX);
    if (txb) {
      this.__INPUTS = txb.__INPUTS;
    }
    if (prevOutputs) {
      const txbInputs = this.__INPUTS;
      if (prevOutputs.length !== txbInputs.length) {
        throw new Error(`prevOuts must match txbInput length`);
      }
      prevOutputs.forEach((o, i) => {
        txbInputs[i].value = o.value;
        txbInputs[i].prevOutScript = o.script;
      });
    }
  }
  createInitialTransaction(network, tx) {
    return new UtxoTransaction_1.UtxoTransaction(network, tx);
  }
  static fromTransaction(tx, _network, prevOutputs) {
    return new UtxoTransactionBuilder(
      tx.network,
      transaction_builder_1.TransactionBuilder.fromTransaction(tx),
      prevOutputs,
    );
  }
  get tx() {
    return this.__TX;
  }
  build() {
    return super.build();
  }
  buildIncomplete() {
    return super.buildIncomplete();
  }
  sign(
    signParams,
    keyPair,
    redeemScript,
    hashType,
    witnessValue,
    witnessScript,
  ) {
    // Regular bitcoin p2sh-p2ms inputs do not include the input amount (value) in the signature and
    // thus do not require the parameter `value` to be set.
    // For bitcoincash and bitcoinsv p2sh-p2ms inputs, the value parameter *is* required however.
    // Since the `value` parameter is not passed to the legacy hashing method, we must store it
    // on the transaction input object.
    console.log('signParam ssignParams', signParams);
    console.log('keyPair keyPair', keyPair);
    console.log('redeemScript redeemScript', redeemScript);
    console.log('hashType hashType', hashType);
    console.log('witnessValue witnessValue', witnessValue);
    console.log('witnessScript witnessScript', witnessScript);
    if (typeof signParams === 'number') {
      if (typeof witnessValue === 'number') {
        this.tx.ins[signParams].value = witnessValue;
      }
      return super.sign(
        signParams,
        keyPair,
        redeemScript,
        hashType,
        witnessValue,
        witnessScript,
      );
    }
    if (signParams.witnessValue !== undefined) {
      this.tx.ins[signParams.vin].value = signParams.witnessValue;
    }
    // When calling the sign method via TxbSignArg, the `value` parameter is actually not permitted
    // to be set for p2sh-p2ms transactions.
    if (signParams.prevOutScriptType === 'p2sh-p2ms') {
      delete signParams.witnessValue;
    }
    return super.sign(signParams);
  }
}
exports.UtxoTransactionBuilder = UtxoTransactionBuilder;
