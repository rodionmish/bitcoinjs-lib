'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.padInputScript = void 0;
const assert = require('assert');
// import * as opcodes from 'bitcoin-ops';
const opcodes_1 = require('./opcodes');
const __1 = require('..');
const classify = require('../classify');
/**
 * @param input - Input of non-standard half-signed transaction created with `tx.build()` instead of `tx.buildIncomplete()`.
 * @param signatureIndex - Position to map the existing signatures to. Other signatures will be padded with OP_0.
 */
function padInputScript(input, signatureIndex) {
  if (![0, 1, 2].includes(signatureIndex)) {
    /* istanbul ignore next */
    throw new Error(`invalid signature index: must be one of [0, 1, 2]`);
  }
  let decompiledSigScript;
  if (input.witness && input.witness.length > 0) {
    decompiledSigScript = input.witness;
  } else {
    decompiledSigScript = __1.script.decompile(input.script);
  }
  // The shape of a non-standard half-signed input is
  //   OP_0 <signature> <p2ms>
  if (!decompiledSigScript || decompiledSigScript.length !== 3) {
    /* istanbul ignore next */
    return;
  }
  const [op0, signatureBuffer, sigScript] = decompiledSigScript;
  if (
    op0 !== opcodes_1.opcodes.OP_0 &&
    !(Buffer.isBuffer(op0) && op0.length === 0)
  ) {
    /* istanbul ignore next */
    return;
  }
  if (!Buffer.isBuffer(sigScript)) {
    /* istanbul ignore next */
    return;
  }
  if (classify.output(sigScript) !== classify.types.P2MS) {
    /* istanbul ignore next */
    return;
  }
  const paddedSigScript = [
    op0,
    ...[0, 1, 2].map(i =>
      i === signatureIndex ? signatureBuffer : Buffer.from([]),
    ),
    sigScript,
  ];
  if (input.witness.length) {
    paddedSigScript.forEach(b => assert(Buffer.isBuffer(b)));
    input.witness = paddedSigScript;
  } else {
    input.script = __1.script.compile(paddedSigScript);
  }
}
exports.padInputScript = padInputScript;
