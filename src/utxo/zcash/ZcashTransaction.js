'use strict';
// import { Transaction, crypto } from 'bitcoinjs-lib';
// import * as types from 'bitcoinjs-lib/src/types';
// import { BufferReader, BufferWriter } from 'bitcoinjs-lib/src/bufferutils';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ZcashTransaction = exports.getDefaultConsensusBranchIdForVersion = exports.getDefaultVersionGroupIdForVersion = exports.UnsupportedTransactionError = void 0;
const bufferutils_1 = require('../../bufferutils');
const __1 = require('../..');
// import * as types from '../../../src/types';
const types = require('../../../src/types');
const varuint = require('varuint-bitcoin');
const typeforce = require('typeforce');
const networks_1 = require('../networks');
const UtxoTransaction_1 = require('../UtxoTransaction');
const ZcashBufferutils_1 = require('./ZcashBufferutils');
const hashZip0244_1 = require('./hashZip0244');
const ZERO = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex',
);
// https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L29
const SAPLING_VERSION_GROUP_ID = 0x892f2085;
const ZIP225_VERSION_GROUP_ID = 0x26a7270a;
// https://github.com/zcash/zcash/blob/v4.5.1/src/consensus/upgrades.cpp#L11
const OVERWINTER_BRANCH_ID = 0x5ba81b19;
const CANOPY_BRANCH_ID = 0xe9ff75a6;
const NU5_BRANCH_ID = 0x37519621;
class UnsupportedTransactionError extends Error {
  constructor(message) {
    super(message);
  }
}
exports.UnsupportedTransactionError = UnsupportedTransactionError;
function getDefaultVersionGroupIdForVersion(version) {
  switch (version) {
    case 400:
    case 450:
      return SAPLING_VERSION_GROUP_ID;
    case 500:
      return ZIP225_VERSION_GROUP_ID;
  }
  throw new Error(`no value for version ${version}`);
}
exports.getDefaultVersionGroupIdForVersion = getDefaultVersionGroupIdForVersion;
function getDefaultConsensusBranchIdForVersion(network, version) {
  switch (version) {
    case 1:
    case 2:
      return 0;
    case 3:
      return OVERWINTER_BRANCH_ID;
    case 4:
      return (0, networks_1.isMainnet)(network)
        ? CANOPY_BRANCH_ID
        : NU5_BRANCH_ID;
    case ZcashTransaction.VERSION4_BRANCH_CANOPY:
      // https://zips.z.cash/zip-0251
      return CANOPY_BRANCH_ID;
    case 5:
    case ZcashTransaction.VERSION4_BRANCH_NU5:
    case ZcashTransaction.VERSION5_BRANCH_NU5:
      // https://zips.z.cash/zip-0252
      return NU5_BRANCH_ID;
  }
  throw new Error(`no value for version ${version}`);
}
exports.getDefaultConsensusBranchIdForVersion = getDefaultConsensusBranchIdForVersion;
class ZcashTransaction extends UtxoTransaction_1.UtxoTransaction {
  constructor(network, tx) {
    super(network, tx);
    this.network = network;
    // 1 if the transaction is post overwinter upgrade, 0 otherwise
    this.overwintered = 0;
    // 0x03C48270 (63210096) for overwinter and 0x892F2085 (2301567109) for sapling
    this.versionGroupId = 0;
    // Block height after which this transactions will expire, or 0 to disable expiry
    this.expiryHeight = 0;
    // let consensusBranchId;
    // console.log('txtxtx', tx);
    // if (tx) {
    //   this.overwintered = tx.overwintered;
    //   this.versionGroupId = tx.versionGroupId;
    //   this.expiryHeight = tx.expiryHeight;
    //   // if (tx.consensusBranchId !== undefined) {
    //   //   consensusBranchId = tx.consensusBranchId;
    //   // }
    // }
    // this.consensusBranchId = getDefaultConsensusBranchIdForVersion(
    //   network,
    //   this.version,
    // );
    // console.log('this.consensusBranchId', this.consensusBranchId);
    // let consensusBranchId;
    if (tx) {
      this.overwintered = tx.overwintered;
      this.versionGroupId = tx.versionGroupId;
      this.expiryHeight = tx.expiryHeight;
      // if (tx.consensusBranchId !== undefined) {
      //   consensusBranchId = tx.consensusBranchId;
      // }
    }
    this.consensusBranchId = getDefaultConsensusBranchIdForVersion(
      network,
      this.version,
    );
  }
  static fromBuffer(buffer, __noStrict, network) {
    /* istanbul ignore next */
    if (!network) {
      throw new Error(`must provide network`);
    }
    const bufferReader = new bufferutils_1.BufferReader(buffer);
    const tx = new ZcashTransaction(network);
    tx.version = bufferReader.readInt32();
    // Split the header into fOverwintered and nVersion
    // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L772
    tx.overwintered = tx.version >>> 31; // Must be 1 for version 3 and up
    tx.version = tx.version & 0x07fffffff; // 3 for overwinter
    tx.consensusBranchId = getDefaultConsensusBranchIdForVersion(
      network,
      tx.version,
    );
    if (tx.isOverwinterCompatible()) {
      tx.versionGroupId = bufferReader.readUInt32();
    }
    if (tx.version === 5) {
      (0, ZcashBufferutils_1.fromBufferV5)(bufferReader, tx);
    } else {
      (0, ZcashBufferutils_1.fromBufferV4)(bufferReader, tx);
    }
    if (__noStrict) return tx;
    if (bufferReader.offset !== buffer.length) {
      const trailing = buffer.slice(bufferReader.offset);
      throw new Error(`Unexpected trailing bytes: ${trailing.toString('hex')}`);
    }
    return tx;
  }
  static fromBufferWithVersion(buf, network, version) {
    const tx = ZcashTransaction.fromBuffer(buf, false, network);
    if (version) {
      tx.consensusBranchId = getDefaultConsensusBranchIdForVersion(
        network,
        version,
      );
    }
    return tx;
  }
  byteLength() {
    let byteLength = super.byteLength();
    if (this.isOverwinterCompatible()) {
      byteLength += 4; // nVersionGroupId
    }
    if (this.isOverwinterCompatible()) {
      byteLength += 4; // nExpiryHeight
    }
    const emptyVectorLength = varuint.encodingLength(0);
    if (this.version === 5) {
      // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L822
      byteLength += 4; // consensusBranchId
      byteLength += emptyVectorLength; // saplingBundle inputs
      byteLength += emptyVectorLength; // saplingBundle outputs
      byteLength += 1; // orchardBundle (empty)
    } else {
      if (this.isSaplingCompatible()) {
        // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L862
        byteLength += 8; // valueBalance (uint64)
        byteLength += emptyVectorLength; // inputs
        byteLength += emptyVectorLength; // outputs
      }
      if (this.supportsJoinSplits()) {
        //
        byteLength += emptyVectorLength; // joinsplits
      }
    }
    return byteLength;
  }
  isSaplingCompatible() {
    return (
      !!this.overwintered && this.version >= ZcashTransaction.VERSION_SAPLING
    );
  }
  isOverwinterCompatible() {
    return (
      !!this.overwintered && this.version >= ZcashTransaction.VERSION_OVERWINTER
    );
  }
  supportsJoinSplits() {
    return (
      !!this.overwintered &&
      this.version >= ZcashTransaction.VERSION_JOINSPLITS_SUPPORT
    );
  }
  /**
   * Build a hash for all or none of the transaction inputs depending on the hashtype
   * @param hashType
   * @returns Buffer - BLAKE2b hash or 256-bit zero if doesn't apply
   */
  getPrevoutHash(hashType) {
    if (!(hashType & __1.Transaction.SIGHASH_ANYONECANPAY)) {
      const bufferWriter = new bufferutils_1.BufferWriter(
        Buffer.allocUnsafe(36 * this.ins.length),
      );
      this.ins.forEach(function(txIn) {
        bufferWriter.writeSlice(txIn.hash);
        bufferWriter.writeUInt32(txIn.index);
      });
      return (0, hashZip0244_1.getBlake2bHash)(
        bufferWriter.buffer,
        'ZcashPrevoutHash',
      );
    }
    return ZERO;
  }
  /**
   * Build a hash for all or none of the transactions inputs sequence numbers depending on the hashtype
   * @param hashType
   * @returns Buffer BLAKE2b hash or 256-bit zero if doesn't apply
   */
  getSequenceHash(hashType) {
    if (
      !(hashType & __1.Transaction.SIGHASH_ANYONECANPAY) &&
      (hashType & 0x1f) !== __1.Transaction.SIGHASH_SINGLE &&
      (hashType & 0x1f) !== __1.Transaction.SIGHASH_NONE
    ) {
      const bufferWriter = new bufferutils_1.BufferWriter(
        Buffer.allocUnsafe(4 * this.ins.length),
      );
      this.ins.forEach(function(txIn) {
        bufferWriter.writeUInt32(txIn.sequence);
      });
      return (0, hashZip0244_1.getBlake2bHash)(
        bufferWriter.buffer,
        'ZcashSequencHash',
      );
    }
    return ZERO;
  }
  /**
   * Build a hash for one, all or none of the transaction outputs depending on the hashtype
   * @param hashType
   * @param inIndex
   * @returns Buffer BLAKE2b hash or 256-bit zero if doesn't apply
   */
  getOutputsHash(hashType, inIndex) {
    if (
      (hashType & 0x1f) !== __1.Transaction.SIGHASH_SINGLE &&
      (hashType & 0x1f) !== __1.Transaction.SIGHASH_NONE
    ) {
      // Find out the size of the outputs and write them
      const txOutsSize = this.outs.reduce(function(sum, output) {
        return sum + 8 + (0, UtxoTransaction_1.varSliceSize)(output.script);
      }, 0);
      const bufferWriter = new bufferutils_1.BufferWriter(
        Buffer.allocUnsafe(txOutsSize),
      );
      this.outs.forEach(function(out) {
        bufferWriter.writeUInt64(out.value);
        bufferWriter.writeVarSlice(out.script);
      });
      return (0, hashZip0244_1.getBlake2bHash)(
        bufferWriter.buffer,
        'ZcashOutputsHash',
      );
    } else if (
      (hashType & 0x1f) === __1.Transaction.SIGHASH_SINGLE &&
      inIndex < this.outs.length
    ) {
      // Write only the output specified in inIndex
      const output = this.outs[inIndex];
      const bufferWriter = new bufferutils_1.BufferWriter(
        Buffer.allocUnsafe(
          8 + (0, UtxoTransaction_1.varSliceSize)(output.script),
        ),
      );
      bufferWriter.writeUInt64(output.value);
      bufferWriter.writeVarSlice(output.script);
      return (0, hashZip0244_1.getBlake2bHash)(
        bufferWriter.buffer,
        'ZcashOutputsHash',
      );
    }
    return ZERO;
  }
  /**
   * Hash transaction for signing a transparent transaction in Zcash. Protected transactions are not supported.
   * @param inIndex
   * @param prevOutScript
   * @param value
   * @param hashType
   * @returns Buffer BLAKE2b hash
   */
  hashForSignatureByNetwork(inIndex, prevOutScript, value, hashType) {
    // https://github.com/zcash/zcash/blob/v4.5.1/src/script/interpreter.cpp#L1175
    if (this.version === 5) {
      return (0, hashZip0244_1.getSignatureDigest)(
        this,
        inIndex,
        prevOutScript,
        value,
        hashType,
      );
    }
    typeforce(types.tuple(types.UInt32, types.Buffer, types.Number), arguments);
    if (inIndex === undefined) {
      throw new Error(`invalid inIndex`);
    }
    /* istanbul ignore next */
    if (inIndex >= this.ins.length) {
      throw new Error('Input index is out of range');
    }
    /* istanbul ignore next */
    if (!this.isOverwinterCompatible()) {
      throw new Error(`unsupported version ${this.version}`);
    }
    const hashPrevouts = this.getPrevoutHash(hashType);
    const hashSequence = this.getSequenceHash(hashType);
    const hashOutputs = this.getOutputsHash(hashType, inIndex);
    const hashJoinSplits = ZERO;
    const hashShieldedSpends = ZERO;
    const hashShieldedOutputs = ZERO;
    let baseBufferSize = 0;
    baseBufferSize += 4 * 5; // header, nVersionGroupId, lock_time, nExpiryHeight, hashType
    baseBufferSize += 32 * 4; // 256 hashes: hashPrevouts, hashSequence, hashOutputs, hashJoinSplits
    baseBufferSize += 4 * 2; // input.index, input.sequence
    baseBufferSize += 8; // value
    baseBufferSize += 32; // input.hash
    baseBufferSize += (0, UtxoTransaction_1.varSliceSize)(prevOutScript); // prevOutScript
    if (this.isSaplingCompatible()) {
      baseBufferSize += 32 * 2; // hashShieldedSpends and hashShieldedOutputs
      baseBufferSize += 8; // valueBalance
    }
    const mask = this.overwintered ? 1 : 0;
    const header = this.version | (mask << 31);
    const bufferWriter = new bufferutils_1.BufferWriter(
      Buffer.alloc(baseBufferSize),
    );
    bufferWriter.writeInt32(header);
    bufferWriter.writeUInt32(this.versionGroupId);
    bufferWriter.writeSlice(hashPrevouts);
    bufferWriter.writeSlice(hashSequence);
    bufferWriter.writeSlice(hashOutputs);
    bufferWriter.writeSlice(hashJoinSplits);
    if (this.isSaplingCompatible()) {
      bufferWriter.writeSlice(hashShieldedSpends);
      bufferWriter.writeSlice(hashShieldedOutputs);
    }
    bufferWriter.writeUInt32(this.locktime);
    bufferWriter.writeUInt32(this.expiryHeight);
    if (this.isSaplingCompatible()) {
      bufferWriter.writeSlice(ZcashBufferutils_1.VALUE_INT64_ZERO);
    }
    bufferWriter.writeInt32(hashType);
    // The input being signed (replacing the scriptSig with scriptCode + amount)
    // The prevout may already be contained in hashPrevout, and the nSequence
    // may already be contained in hashSequence.
    const input = this.ins[inIndex];
    bufferWriter.writeSlice(input.hash);
    bufferWriter.writeUInt32(input.index);
    bufferWriter.writeVarSlice(prevOutScript);
    bufferWriter.writeUInt64(value);
    bufferWriter.writeUInt32(input.sequence);
    const personalization = Buffer.alloc(16);
    const prefix = 'ZcashSigHash';
    personalization.write(prefix);
    personalization.writeUInt32LE(this.consensusBranchId, prefix.length);
    return (0, hashZip0244_1.getBlake2bHash)(
      bufferWriter.buffer,
      personalization,
    );
  }
  toBuffer(buffer, initialOffset = 0) {
    if (!buffer) buffer = Buffer.allocUnsafe(this.byteLength());
    const bufferWriter = new bufferutils_1.BufferWriter(buffer, initialOffset);
    if (this.isOverwinterCompatible()) {
      const mask = this.overwintered ? 1 : 0;
      bufferWriter.writeInt32(this.version | (mask << 31)); // Set overwinter bit
      bufferWriter.writeUInt32(this.versionGroupId);
    } else {
      bufferWriter.writeInt32(this.version);
    }
    if (this.version === 5) {
      (0, ZcashBufferutils_1.toBufferV5)(bufferWriter, this);
    } else {
      (0, ZcashBufferutils_1.toBufferV4)(bufferWriter, this);
    }
    if (initialOffset !== undefined) {
      return buffer.slice(initialOffset, bufferWriter.offset);
    }
    return buffer;
  }
  getHash(forWitness) {
    if (forWitness) {
      throw new Error(`invalid argument`);
    }
    if (this.version === 5) {
      return (0, hashZip0244_1.getTxidDigest)(this);
    }
    return __1.crypto.hash256(this.toBuffer());
  }
  clone() {
    return new ZcashTransaction(this.network, this);
  }
}
exports.ZcashTransaction = ZcashTransaction;
ZcashTransaction.VERSION_JOINSPLITS_SUPPORT = 2;
ZcashTransaction.VERSION_OVERWINTER = 3;
ZcashTransaction.VERSION_SAPLING = 4;
ZcashTransaction.VERSION4_BRANCH_CANOPY = 400;
ZcashTransaction.VERSION4_BRANCH_NU5 = 450;
ZcashTransaction.VERSION5_BRANCH_NU5 = 500;
