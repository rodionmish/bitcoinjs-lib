'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.unspentSum = exports.addToTransactionBuilder = exports.toPrevOutput = exports.getOutputIdForInput = exports.formatOutputId = exports.parseOutputId = exports.toOutput = void 0;
const address_1 = require('../address');
/**
 * @return TxOutput from Unspent
 */
function toOutput(u, network) {
  return {
    script: (0, address_1.toOutputScript)(u.address, network),
    value: u.value,
  };
}
exports.toOutput = toOutput;
/**
 * @param outputId
 * @return TxOutPoint
 */
function parseOutputId(outputId) {
  const parts = outputId.split(':');
  if (parts.length !== 2) {
    throw new Error(`invalid outputId, must have format txid:vout`);
  }
  const [txid, voutStr] = parts;
  const vout = Number(voutStr);
  if (txid.length !== 64) {
    throw new Error(`invalid txid ${txid} ${txid.length}`);
  }
  if (Number.isNaN(vout) || vout < 0 || !Number.isSafeInteger(vout)) {
    throw new Error(`invalid vout: must be integer >= 0`);
  }
  return { txid, vout };
}
exports.parseOutputId = parseOutputId;
/**
 * @param txid
 * @param vout
 * @return outputId
 */
function formatOutputId({ txid, vout }) {
  return `${txid}:${vout}`;
}
exports.formatOutputId = formatOutputId;
function getOutputIdForInput(i) {
  return {
    txid: Buffer.from(i.hash)
      .reverse()
      .toString('hex'),
    vout: i.index,
  };
}
exports.getOutputIdForInput = getOutputIdForInput;
/**
 * @return PrevOutput from Unspent
 */
function toPrevOutput(u, network) {
  return {
    ...parseOutputId(u.id),
    ...toOutput(u, network),
  };
}
exports.toPrevOutput = toPrevOutput;
/**
 * @param txb
 * @param u
 * @param sequence - sequenceId
 */
function addToTransactionBuilder(txb, u, sequence) {
  const { txid, vout, script } = toPrevOutput(u, txb.network);
  // TODO: CHECK HERE
  // txb.addInput(txid, vout, sequence, script, value);
  txb.addInput(txid, vout, sequence, script);
}
exports.addToTransactionBuilder = addToTransactionBuilder;
function unspentSum(unspents) {
  return unspents.reduce((sum, u) => sum + u.value, 0);
}
exports.unspentSum = unspentSum;
