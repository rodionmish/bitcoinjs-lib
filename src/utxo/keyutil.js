'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.privateKeyBufferFromECPair = exports.privateKeyBufferToECPair = void 0;
const ecpair_1 = require('ecpair');
/**
 * Create an ECPair from the raw private key bytes
 * @param {Buffer} buffer - Private key for the ECPair. Must be exactly 32 bytes.
 * @param {Object} [network] - Network for the ECPair. Defaults to bitcoin.
 * @return {ECPair}
 */
function privateKeyBufferToECPair(buffer, _network) {
  if (!Buffer.isBuffer(buffer) || buffer.length !== 32) {
    throw new Error('invalid private key buffer');
  }
  return ecpair_1.ECPair.fromPrivateKey(buffer);
}
exports.privateKeyBufferToECPair = privateKeyBufferToECPair;
/**
 * Get the private key as a 32 bytes buffer. If it is smaller than 32 bytes, pad it with zeros
 * @param {ECPair} ecPair
 * @return Buffer 32 bytes
 */
function privateKeyBufferFromECPair(ecPair) {
  if (ecPair.constructor.name !== 'ECPair') {
    throw new TypeError(`invalid argument ecpair`);
  }
  const privkey = ecPair.privateKey;
  if (!Buffer.isBuffer(privkey)) {
    throw new Error(`unexpected privkey type`);
  }
  if (privkey.length !== 32) {
    throw new Error(`unexpected privkey length`);
  }
  return privkey;
}
exports.privateKeyBufferFromECPair = privateKeyBufferFromECPair;
