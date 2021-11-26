'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UtxoTransaction = exports.varSliceSize = void 0;
const varuint = require('varuint-bitcoin');
const __1 = require('..');
const networks_1 = require('./networks');
function varSliceSize(slice) {
  const length = slice.length;
  return varuint.encodingLength(length) + length;
}
exports.varSliceSize = varSliceSize;
class UtxoTransaction extends __1.Transaction {
  constructor(network, transaction = new __1.Transaction()) {
    super();
    this.network = network;
    this.version = transaction.version;
    this.locktime = transaction.locktime;
    this.ins = transaction.ins.map(v => ({ ...v }));
    this.outs = transaction.outs.map(v => ({ ...v }));
  }
  static fromBuffer(buf, noStrict, network, _prevOutput) {
    if (!network) {
      throw new Error(`must provide network`);
    }
    return new UtxoTransaction(
      network,
      __1.Transaction.fromBuffer(buf, noStrict),
    );
  }
  addForkId(hashType) {
    if (hashType & UtxoTransaction.SIGHASH_FORKID) {
      const forkId = (0, networks_1.isBitcoinGold)(this.network) ? 79 : 0;
      return (hashType | (forkId << 8)) >>> 0;
    }
    return hashType;
  }
  hashForWitnessV0(inIndex, prevOutScript, value, hashType) {
    return super.hashForWitnessV0(
      inIndex,
      prevOutScript,
      value,
      this.addForkId(hashType),
    );
  }
  /**
   * Calculate the hash to verify the signature against
   */
  hashForSignatureByNetwork(inIndex, prevoutScript, value, hashType) {
    switch ((0, networks_1.getMainnet)(this.network)) {
      case networks_1.networks.zcash:
        throw new Error(`illegal state`);
      case networks_1.networks.bitcoincash:
      case networks_1.networks.bitcoinsv:
      case networks_1.networks.bitcoingold:
        /*
                  Bitcoin Cash supports a FORKID flag. When set, we hash using hashing algorithm
                   that is used for segregated witness transactions (defined in BIP143).
        
                  The flag is also used by BitcoinSV and BitcoinGold
        
                  https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/replay-protected-sighash.md
                 */
        const addForkId = (hashType & UtxoTransaction.SIGHASH_FORKID) > 0;
        if (addForkId) {
          /*
                      ``The sighash type is altered to include a 24-bit fork id in its most significant bits.''
                      We also use unsigned right shift operator `>>>` to cast to UInt32
                      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unsigned_right_shift
                     */
          if (value === undefined) {
            throw new Error(`must provide value`);
          }
          return super.hashForWitnessV0(
            inIndex,
            prevoutScript,
            value,
            this.addForkId(hashType),
          );
        }
    }
    return super.hashForSignature(inIndex, prevoutScript, hashType);
  }
  hashForSignature(inIndex, prevOutScript, hashType) {
    return this.hashForSignatureByNetwork(
      inIndex,
      prevOutScript,
      this.ins[inIndex].value,
      hashType,
    );
  }
  clone() {
    return new UtxoTransaction(this.network, super.clone());
  }
}
exports.UtxoTransaction = UtxoTransaction;
UtxoTransaction.SIGHASH_FORKID = 0x40;
/** @deprecated use SIGHASH_FORKID */
UtxoTransaction.SIGHASH_BITCOINCASHBIP143 = UtxoTransaction.SIGHASH_FORKID;
