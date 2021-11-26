'use strict';
/**
 * Transaction (de)serialization helpers.
 * Only supports full transparent transactions without shielded inputs or outputs.
 *
 * References:
 * - https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L771
 */
// import { TxInput, TxOutput } from 'bitcoinjs-lib';
// import { BufferReader, BufferWriter } from 'bitcoinjs-lib/src/bufferutils';
Object.defineProperty(exports, '__esModule', { value: true });
exports.toBufferV5 = exports.toBufferV4 = exports.writeOutputs = exports.writeInputs = exports.fromBufferV5 = exports.fromBufferV4 = exports.writeEmptySamplingBundle = exports.readEmptySaplingBundle = exports.writeEmptyOrchardBundle = exports.readEmptyOrchardBundle = exports.readEmptyVector = exports.readOutputs = exports.readInputs = exports.VALUE_INT64_ZERO = void 0;
const ZcashTransaction_1 = require('./ZcashTransaction');
exports.VALUE_INT64_ZERO = Buffer.from('0000000000000000', 'hex');
function readInputs(bufferReader) {
  const vinLen = bufferReader.readVarInt();
  const ins = [];
  for (let i = 0; i < vinLen; ++i) {
    ins.push({
      hash: bufferReader.readSlice(32),
      index: bufferReader.readUInt32(),
      script: bufferReader.readVarSlice(),
      sequence: bufferReader.readUInt32(),
      witness: [],
    });
  }
  return ins;
}
exports.readInputs = readInputs;
function readOutputs(bufferReader) {
  const voutLen = bufferReader.readVarInt();
  const outs = [];
  for (let i = 0; i < voutLen; ++i) {
    outs.push({
      value: bufferReader.readUInt64(),
      script: bufferReader.readVarSlice(),
    });
  }
  return outs;
}
exports.readOutputs = readOutputs;
function readEmptyVector(bufferReader) {
  const n = bufferReader.readVarInt();
  if (n !== 0) {
    throw new ZcashTransaction_1.UnsupportedTransactionError(
      `expected empty vector`,
    );
  }
}
exports.readEmptyVector = readEmptyVector;
function readEmptyOrchardBundle(bufferReader) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/orchard.h#L66
  // https://github.com/zcash/librustzcash/blob/edcde252de221d4851f1e5145306c2caf95453bc/zcash_primitives/src/transaction/components/orchard.rs#L36
  const v = bufferReader.readUInt8();
  if (v !== 0x00) {
    throw new ZcashTransaction_1.UnsupportedTransactionError(
      `expected byte 0x00`,
    );
  }
}
exports.readEmptyOrchardBundle = readEmptyOrchardBundle;
function writeEmptyOrchardBundle(bufferWriter) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/orchard.h#L66
  // https://github.com/zcash/librustzcash/blob/edcde252de221d4851f1e5145306c2caf95453bc/zcash_primitives/src/transaction/components/orchard.rs#L201
  bufferWriter.writeUInt8(0);
}
exports.writeEmptyOrchardBundle = writeEmptyOrchardBundle;
function readEmptySaplingBundle(bufferReader) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L283
  readEmptyVector(bufferReader) /* vSpendsSapling */;
  readEmptyVector(bufferReader) /* vOutputsSapling */;
}
exports.readEmptySaplingBundle = readEmptySaplingBundle;
function writeEmptySamplingBundle(bufferWriter) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L283
  bufferWriter.writeVarInt(0) /* vSpendsSapling */;
  bufferWriter.writeVarInt(0) /* vOutputsSapling */;
}
exports.writeEmptySamplingBundle = writeEmptySamplingBundle;
function fromBufferV4(bufferReader, tx) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L855-L857
  tx.ins = readInputs(bufferReader);
  tx.outs = readOutputs(bufferReader);
  tx.locktime = bufferReader.readUInt32();
  if (tx.isOverwinterCompatible()) {
    tx.expiryHeight = bufferReader.readUInt32();
  }
  if (tx.isSaplingCompatible()) {
    const valueBalance = bufferReader.readSlice(8);
    if (!valueBalance.equals(exports.VALUE_INT64_ZERO)) {
      /* istanbul ignore next */
      throw new ZcashTransaction_1.UnsupportedTransactionError(
        `valueBalance must be zero`,
      );
    }
    // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L863
    readEmptySaplingBundle(bufferReader);
  }
  if (tx.supportsJoinSplits()) {
    // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L869
    readEmptyVector(bufferReader) /* vJoinSplit */;
  }
}
exports.fromBufferV4 = fromBufferV4;
function fromBufferV5(bufferReader, tx) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L815
  tx.consensusBranchId = bufferReader.readUInt32();
  tx.locktime = bufferReader.readUInt32();
  tx.expiryHeight = bufferReader.readUInt32();
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L828
  tx.ins = readInputs(bufferReader);
  tx.outs = readOutputs(bufferReader);
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L835
  readEmptySaplingBundle(bufferReader);
  readEmptyOrchardBundle(bufferReader);
}
exports.fromBufferV5 = fromBufferV5;
function writeInputs(bufferWriter, ins) {
  bufferWriter.writeVarInt(ins.length);
  ins.forEach(function(txIn) {
    bufferWriter.writeSlice(txIn.hash);
    bufferWriter.writeUInt32(txIn.index);
    bufferWriter.writeVarSlice(txIn.script);
    bufferWriter.writeUInt32(txIn.sequence);
  });
}
exports.writeInputs = writeInputs;
function writeOutputs(bufferWriter, outs) {
  bufferWriter.writeVarInt(outs.length);
  outs.forEach(function(txOut) {
    if (txOut.valueBuffer) {
      bufferWriter.writeSlice(txOut.valueBuffer);
    } else {
      bufferWriter.writeUInt64(txOut.value);
    }
    bufferWriter.writeVarSlice(txOut.script);
  });
}
exports.writeOutputs = writeOutputs;
function toBufferV4(bufferWriter, tx) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L1083
  writeInputs(bufferWriter, tx.ins);
  writeOutputs(bufferWriter, tx.outs);
  bufferWriter.writeUInt32(tx.locktime);
  if (tx.isOverwinterCompatible()) {
    bufferWriter.writeUInt32(tx.expiryHeight);
  }
  if (tx.isSaplingCompatible()) {
    bufferWriter.writeSlice(exports.VALUE_INT64_ZERO);
    bufferWriter.writeVarInt(0); // vShieldedSpendLength
    bufferWriter.writeVarInt(0); // vShieldedOutputLength
  }
  if (tx.supportsJoinSplits()) {
    bufferWriter.writeVarInt(0); // joinsSplits length
  }
}
exports.toBufferV4 = toBufferV4;
function toBufferV5(bufferWriter, tx) {
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L825-L826
  bufferWriter.writeUInt32(tx.consensusBranchId);
  bufferWriter.writeUInt32(tx.locktime);
  bufferWriter.writeUInt32(tx.expiryHeight);
  writeInputs(bufferWriter, tx.ins);
  writeOutputs(bufferWriter, tx.outs);
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L1063
  writeEmptySamplingBundle(bufferWriter);
  // https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L1081
  writeEmptyOrchardBundle(bufferWriter);
}
exports.toBufferV5 = toBufferV5;
