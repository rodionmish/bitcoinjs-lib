import { ECPair, ECPairInterface } from 'ecpair';
import * as ECPairOrigin from 'ecpair';
import { Network } from '../networks';
import typeforce = require('typeforce');

ECPairOrigin['Network'] = typeforce.compile({
  messagePrefix: exports.typeforce.oneOf(
    exports.typeforce.Buffer,
    exports.typeforce.String,
  ),
  bip32: {
    public: exports.typeforce.UInt32,
    private: exports.typeforce.UInt32,
  },
  pubKeyHash: exports.typeforce.UInt8,
  scriptHash: exports.typeforce.UInt8,
  wif: exports.typeforce.UInt8,
});

/**
 * Create an ECPair from the raw private key bytes
 * @param {Buffer} buffer - Private key for the ECPair. Must be exactly 32 bytes.
 * @param {Object} [network] - Network for the ECPair. Defaults to bitcoin.
 * @return {ECPair}
 */
export function privateKeyBufferToECPair(
  buffer: Buffer,
  _network?: Network,
): ECPairInterface {
  if (!Buffer.isBuffer(buffer) || buffer.length !== 32) {
    throw new Error('invalid private key buffer');
  }

  return ECPair.fromPrivateKey(buffer);
}

/**
 * Get the private key as a 32 bytes buffer. If it is smaller than 32 bytes, pad it with zeros
 * @param {ECPair} ecPair
 * @return Buffer 32 bytes
 */
export function privateKeyBufferFromECPair(ecPair: ECPairInterface): Buffer {
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
