'use strict';
// import { TxOutput } from 'bitcoinjs-lib';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createTransactionBuilderFromTransaction = exports.createTransactionBuilderForNetwork = exports.setTransactionBuilderDefaults = exports.getDefaultTransactionVersion = exports.createTransactionFromHex = exports.createTransactionFromBuffer = void 0;
const networks_1 = require('./networks');
const UtxoTransaction_1 = require('./UtxoTransaction');
const UtxoTransactionBuilder_1 = require('./UtxoTransactionBuilder');
// import { DashTransaction } from './dash/DashTransaction';
// import { DashTransactionBuilder } from './dash/DashTransactionBuilder';
const ZcashTransactionBuilder_1 = require('./zcash/ZcashTransactionBuilder');
const ZcashTransaction_1 = require('./zcash/ZcashTransaction');
function createTransactionFromBuffer(buf, network, { version } = {}) {
  switch ((0, networks_1.getMainnet)(network)) {
    case networks_1.networks.bitcoin:
    case networks_1.networks.bitcoincash:
    case networks_1.networks.bitcoinsv:
    case networks_1.networks.bitcoingold:
    case networks_1.networks.litecoin:
      return UtxoTransaction_1.UtxoTransaction.fromBuffer(buf, false, network);
    // case networks.dash:
    //   return DashTransaction.fromBuffer(buf, false, network);
    case networks_1.networks.zcash:
      return ZcashTransaction_1.ZcashTransaction.fromBufferWithVersion(
        buf,
        network,
        version,
      );
  }
  /* istanbul ignore next */
  throw new Error(`invalid network`);
}
exports.createTransactionFromBuffer = createTransactionFromBuffer;
/* istanbul ignore next */
function createTransactionFromHex(hex, network) {
  return createTransactionFromBuffer(Buffer.from(hex, 'hex'), network);
}
exports.createTransactionFromHex = createTransactionFromHex;
function getDefaultTransactionVersion(network) {
  switch ((0, networks_1.getMainnet)(network)) {
    case networks_1.networks.bitcoincash:
    case networks_1.networks.bitcoinsv:
    case networks_1.networks.bitcoingold:
      return 2;
    case networks_1.networks.zcash:
      return (0, networks_1.isMainnet)(network)
        ? ZcashTransaction_1.ZcashTransaction.VERSION4_BRANCH_CANOPY
        : ZcashTransaction_1.ZcashTransaction.VERSION4_BRANCH_NU5;
    default:
      return 1;
  }
}
exports.getDefaultTransactionVersion = getDefaultTransactionVersion;
function setTransactionBuilderDefaults(
  txb,
  network,
  { version = getDefaultTransactionVersion(network) } = {},
) {
  switch ((0, networks_1.getMainnet)(network)) {
    case networks_1.networks.bitcoincash:
    case networks_1.networks.bitcoinsv:
    case networks_1.networks.bitcoingold:
      if (version !== 2) {
        throw new Error(`invalid version`);
      }
      txb.setVersion(version);
      break;
    case networks_1.networks.zcash:
      txb.setDefaultsForVersion(network, version);
      break;
    default:
      if (version !== 1) {
        throw new Error(`invalid version`);
      }
  }
}
exports.setTransactionBuilderDefaults = setTransactionBuilderDefaults;
function createTransactionBuilderForNetwork(network, { version } = {}) {
  let txb;
  switch ((0, networks_1.getMainnet)(network)) {
    case networks_1.networks.bitcoin:
    case networks_1.networks.bitcoincash:
    case networks_1.networks.bitcoinsv:
    case networks_1.networks.bitcoingold:
    case networks_1.networks.litecoin: {
      txb = new UtxoTransactionBuilder_1.UtxoTransactionBuilder(network);
      break;
    }
    // case networks.dash:
    //   txb = new DashTransactionBuilder(network);
    //   break;
    case networks_1.networks.zcash: {
      txb = new ZcashTransactionBuilder_1.ZcashTransactionBuilder(network);
      break;
    }
    default:
      throw new Error(`unsupported network`);
  }
  setTransactionBuilderDefaults(txb, network, { version });
  return txb;
}
exports.createTransactionBuilderForNetwork = createTransactionBuilderForNetwork;
function createTransactionBuilderFromTransaction(tx, prevOutputs) {
  switch ((0, networks_1.getMainnet)(tx.network)) {
    case networks_1.networks.bitcoin:
    case networks_1.networks.bitcoincash:
    case networks_1.networks.bitcoinsv:
    case networks_1.networks.bitcoingold:
    case networks_1.networks.litecoin:
      return UtxoTransactionBuilder_1.UtxoTransactionBuilder.fromTransaction(
        tx,
        undefined,
        prevOutputs,
      );
    // case networks.dash:
    //   return DashTransactionBuilder.fromTransaction(
    //     tx as DashTransaction,
    //     undefined,
    //     prevOutputs,
    //   );
    case networks_1.networks.zcash:
      return ZcashTransactionBuilder_1.ZcashTransactionBuilder.fromTransaction(
        tx,
        undefined,
        prevOutputs,
      );
  }
  throw new Error(`invalid network`);
}
exports.createTransactionBuilderFromTransaction = createTransactionBuilderFromTransaction;
