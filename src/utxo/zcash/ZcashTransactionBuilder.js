'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ZcashTransactionBuilder = void 0;
// import * as bitcoinjs from 'bitcoinjs-lib';
const types = require('../../../src/types');
const typeforce = require('typeforce');
// import { Network } from '../..';
const ZcashTransaction_1 = require('./ZcashTransaction');
const UtxoTransactionBuilder_1 = require('../UtxoTransactionBuilder');
const address_1 = require('./address');
class ZcashTransactionBuilder extends UtxoTransactionBuilder_1.UtxoTransactionBuilder {
  constructor(network) {
    super(network);
  }
  createInitialTransaction(network, tx) {
    return new ZcashTransaction_1.ZcashTransaction(network, tx);
  }
  static fromTransaction(transaction, _network, _prevOutput) {
    const txb = new ZcashTransactionBuilder(transaction.network);
    // Copy transaction fields
    txb.setVersion(transaction.version, !!transaction.overwintered);
    txb.setLockTime(transaction.locktime);
    // Copy Zcash overwinter fields. Omitted if the transaction builder is not for Zcash.
    if (txb.tx.isOverwinterCompatible()) {
      txb.setVersionGroupId(transaction.versionGroupId);
      txb.setExpiryHeight(transaction.expiryHeight);
    }
    txb.setConsensusBranchId(transaction.consensusBranchId);
    // Copy outputs (done first to avoid signature invalidation)
    transaction.outs.forEach(function(txOut) {
      txb.addOutput(txOut.script, txOut.value);
    });
    // Copy inputs
    transaction.ins.forEach(function(txIn) {
      txb.__addInputUnsafe(txIn.hash, txIn.index, {
        sequence: txIn.sequence,
        script: txIn.script,
        witness: txIn.witness,
        value: txIn.value,
      });
    });
    return txb;
  }
  setVersion(version, overwinter = true) {
    typeforce(types.UInt32, version);
    this.tx.overwintered = overwinter ? 1 : 0;
    this.tx.version = version;
  }
  setDefaultsForVersion(network, version) {
    switch (version) {
      case 4:
      case ZcashTransaction_1.ZcashTransaction.VERSION4_BRANCH_CANOPY:
      case ZcashTransaction_1.ZcashTransaction.VERSION4_BRANCH_NU5:
        this.setVersion(4);
        break;
      case 5:
      case ZcashTransaction_1.ZcashTransaction.VERSION5_BRANCH_NU5:
        this.setVersion(5);
        break;
      default:
        throw new Error(`invalid version ${version}`);
    }
    this.tx.versionGroupId = (0,
    ZcashTransaction_1.getDefaultVersionGroupIdForVersion)(version);
    this.tx.consensusBranchId = (0,
    ZcashTransaction_1.getDefaultConsensusBranchIdForVersion)(network, version);
  }
  hasSignatures() {
    return this.__INPUTS.some(function(input) {
      return input.signatures !== undefined;
    });
  }
  setPropertyCheckSignatures(propName, value) {
    if (this.tx[propName] === value) {
      return;
    }
    if (this.hasSignatures()) {
      throw new Error(
        `Changing property ${propName} for a partially signed transaction would invalidate signatures`,
      );
    }
    this.tx[propName] = value;
  }
  setConsensusBranchId(consensusBranchId) {
    typeforce(types.UInt32, consensusBranchId);
    this.setPropertyCheckSignatures('consensusBranchId', consensusBranchId);
  }
  setVersionGroupId(versionGroupId) {
    typeforce(types.UInt32, versionGroupId);
    this.setPropertyCheckSignatures('versionGroupId', versionGroupId);
  }
  setExpiryHeight(expiryHeight) {
    typeforce(types.UInt32, expiryHeight);
    this.setPropertyCheckSignatures('expiryHeight', expiryHeight);
  }
  build() {
    return super.build();
  }
  buildIncomplete() {
    return super.buildIncomplete();
  }
  addOutput(scriptPubKey, value) {
    // Attempt to get a script if it's a base58 or bech32 address string
    if (typeof scriptPubKey === 'string') {
      scriptPubKey = (0, address_1.toOutputScript)(scriptPubKey, this.network);
    }
    return super.addOutput(scriptPubKey, value);
  }
}
exports.ZcashTransactionBuilder = ZcashTransactionBuilder;
