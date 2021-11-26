'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.toOutputScript = exports.fromOutputScript = exports.toBase58Check = exports.fromBase58Check = void 0;
const assert = require('assert');
const __1 = require('../..');
// import { payments } from 'bitcoinjs-lib';
// import * as types from 'bitcoinjs-lib/src/types';
// import { Base58CheckResult } from 'bitcoinjs-lib/types/address';
// import * as types from '../../../src/types';
const types = require('../../../src/types');
const networks_1 = require('../networks');
const bs58check = require('bs58check');
const typeforce = require('typeforce');
function fromBase58Check(address) {
  const payload = bs58check.decode(address);
  const version = payload.readUInt16BE(0);
  const hash = payload.slice(2);
  return { version, hash };
}
exports.fromBase58Check = fromBase58Check;
function toBase58Check(hash, version) {
  console.log('HASH', hash);
  typeforce(types.tuple(types.Hash160bit, types.Number), arguments);
  const payload = Buffer.allocUnsafe(22);
  payload.writeUInt16BE(version, 0);
  hash.copy(payload, 2);
  return bs58check.encode(payload);
}
exports.toBase58Check = toBase58Check;
function fromOutputScript(outputScript, network) {
  assert((0, networks_1.isZcash)(network));
  let o;
  let prefix;
  try {
    o = __1.payments.p2pkh({ output: outputScript });
    prefix = network.pubKeyHash;
  } catch (e) {}
  try {
    o = __1.payments.p2sh({ output: outputScript });
    prefix = network.scriptHash;
  } catch (e) {}
  if (!o || !o.hash || prefix === undefined) {
    throw new Error(`unsupported outputScript`);
  }
  return toBase58Check(o.hash, prefix);
}
exports.fromOutputScript = fromOutputScript;
function toOutputScript(address, network) {
  assert((0, networks_1.isZcash)(network));
  const { version, hash } = fromBase58Check(address);
  if (version === network.pubKeyHash) {
    return __1.payments.p2pkh({ hash }).output;
  }
  if (version === network.scriptHash) {
    return __1.payments.p2sh({ hash }).output;
  }
  throw new Error(address + ' has no matching Script');
}
exports.toOutputScript = toOutputScript;
