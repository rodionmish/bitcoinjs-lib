'use strict';
// import { BufferReader, BufferWriter } from 'bitcoinjs-lib/src/bufferutils';
// import { crypto as bcrypto, Transaction } from 'bitcoinjs-lib';
Object.defineProperty(exports, '__esModule', { value: true });
exports.DashTransaction = void 0;
const UtxoTransaction_1 = require('../UtxoTransaction');
const networks_1 = require('../networks');
const bufferutils_1 = require('../../bufferutils');
const __1 = require('../..');
class DashTransaction extends UtxoTransaction_1.UtxoTransaction {
  constructor(network, tx) {
    super(network, tx);
    this.type = 0;
    if (!(0, networks_1.isDash)(network)) {
      throw new Error(`invalid network`);
    }
    if (tx) {
      this.version = tx.version;
      if (tx instanceof DashTransaction) {
        this.type = tx.type;
        this.extraPayload = tx.extraPayload;
      }
    }
    // since `__toBuffer` is private we have to do a little hack here
    this.__toBuffer = this.toBufferWithExtraPayload;
  }
  static fromTransaction(tx) {
    return new DashTransaction(tx.network, tx);
  }
  static fromBuffer(buffer, _noStrict, network) {
    const baseTx = UtxoTransaction_1.UtxoTransaction.fromBuffer(
      buffer,
      true,
      network,
    );
    const tx = new DashTransaction(network, baseTx);
    tx.version = baseTx.version & 0xffff;
    tx.type = baseTx.version >> 16;
    if (baseTx.byteLength() !== buffer.length) {
      const bufferReader = new bufferutils_1.BufferReader(
        buffer,
        baseTx.byteLength(),
      );
      tx.extraPayload = bufferReader.readVarSlice();
    }
    return tx;
  }
  clone() {
    return new DashTransaction(this.network, this);
  }
  byteLength(_ALLOW_WITNESS) {
    return (
      super.byteLength(_ALLOW_WITNESS) +
      (this.extraPayload
        ? (0, UtxoTransaction_1.varSliceSize)(this.extraPayload)
        : 0)
    );
  }
  /**
   * Helper to override `__toBuffer()` of bitcoinjs.Transaction.
   * Since the method is private, we use a hack in the constructor to make it work.
   *
   * TODO: remove `private` modifier in bitcoinjs `__toBuffer()` or find some other solution
   *
   * @param buffer - optional target buffer
   * @param initialOffset - can only be undefined or 0. Other values are only used for serialization in blocks.
   * @param _ALLOW_WITNESS - ignored
   */
  toBufferWithExtraPayload(buffer, initialOffset, _ALLOW_WITNESS = false) {
    // We can ignore the `_ALLOW_WITNESS` parameter here since it has no effect.
    if (!buffer) {
      buffer = Buffer.allocUnsafe(this.byteLength(false));
    }
    if (initialOffset !== undefined && initialOffset !== 0) {
      throw new Error(`not supported`);
    }
    // Start out with regular bitcoin byte sequence.
    // This buffer will have excess size because it uses `byteLength()` to allocate.
    const baseBuffer = __1.Transaction.prototype.__toBuffer.call(this);
    baseBuffer.copy(buffer);
    // overwrite leading version bytes (uint16 version, uint16 type)
    const bufferWriter = new bufferutils_1.BufferWriter(buffer, 0);
    bufferWriter.writeUInt32((this.version & 0xffff) | (this.type << 16));
    // Seek to end of original byte sequence and add extraPayload.
    // We must use the byteLength as calculated by the bitcoinjs implementation since
    // `baseBuffer` has an excess size.
    if (this.extraPayload) {
      bufferWriter.offset = __1.Transaction.prototype.byteLength.call(this);
      bufferWriter.writeVarSlice(this.extraPayload);
    }
    return buffer;
  }
  getHash(forWitness) {
    if (forWitness) {
      throw new Error(`invalid argument`);
    }
    return __1.crypto.hash256(this.toBuffer());
  }
  /**
   * Build a hash for all or none of the transaction inputs depending on the hashtype
   * @param hashType
   * @returns Buffer
   */
  getPrevoutHash(hashType) {
    if (!(hashType & UtxoTransaction_1.UtxoTransaction.SIGHASH_ANYONECANPAY)) {
      const bufferWriter = new bufferutils_1.BufferWriter(
        Buffer.allocUnsafe(36 * this.ins.length),
      );
      this.ins.forEach(function(txIn) {
        bufferWriter.writeSlice(txIn.hash);
        bufferWriter.writeUInt32(txIn.index);
      });
      return __1.crypto.hash256(bufferWriter.buffer);
    }
    return Buffer.alloc(32, 0);
  }
}
exports.DashTransaction = DashTransaction;
DashTransaction.DASH_NORMAL = 0;
DashTransaction.DASH_PROVIDER_REGISTER = 1;
DashTransaction.DASH_PROVIDER_UPDATE_SERVICE = 2;
DashTransaction.DASH_PROVIDER_UPDATE_REGISTRAR = 3;
DashTransaction.DASH_PROVIDER_UPDATE_REVOKE = 4;
DashTransaction.DASH_COINBASE = 5;
DashTransaction.DASH_QUORUM_COMMITMENT = 6;
