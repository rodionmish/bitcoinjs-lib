'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DashTransactionBuilder = void 0;
const UtxoTransactionBuilder_1 = require('../UtxoTransactionBuilder');
const DashTransaction_1 = require('./DashTransaction');
class DashTransactionBuilder extends UtxoTransactionBuilder_1.UtxoTransactionBuilder {
  constructor(network, txb) {
    super(network, txb);
  }
  createInitialTransaction(network, tx) {
    return new DashTransaction_1.DashTransaction(network, tx);
  }
  setType(type) {
    this.tx.type = type;
  }
  setExtraPayload(extraPayload) {
    this.tx.extraPayload = extraPayload;
  }
  static fromTransaction(tx, network, prevOutput) {
    const txb = new DashTransactionBuilder(
      tx.network,
      UtxoTransactionBuilder_1.UtxoTransactionBuilder.fromTransaction(
        tx,
        network,
        prevOutput,
      ),
    );
    txb.setType(tx.type);
    txb.setExtraPayload(tx.extraPayload);
    return txb;
  }
}
exports.DashTransactionBuilder = DashTransactionBuilder;
