/**
 * Wrapper around `cashaddress` library.
 *
 * Performs some address sanitation:
 * - add prefix if missing
 * - normalize to lower-case
 * - reject mixed-case
 *
 * Based on these documents
 *
 * - https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
 * - https://www.bitcoinabc.org/cashaddr/
 */
import * as cashaddress from 'cashaddress';
import { getNetworkName, isBitcoinCash, Network, networks } from '../networks';
import { Network as NativeNetwork } from '../../networks';

import { Payment } from '../../payments';
import { address, payments } from '../..';

export const addressFormats = ['default', 'cashaddr'] as const;

export type AddressFormat = typeof addressFormats[number];

/**
 * @param name
 * @param output
 * @return the encoded pubkeyhash or scripthash
 */
function getHashFromOutputScript(
  name: string,
  output: Buffer,
): Buffer | undefined {
  type PaymentFunc = ({ output }: { output: Buffer }) => Payment;
  const func = (payments as Record<string, PaymentFunc>)[name];
  if (!func) {
    throw new Error(`no payment with name ${name}`);
  }
  try {
    return func({ output }).hash;
  } catch (e) {
    return undefined;
  }
}

/**
 * @param network
 * @return network-specific cashaddr prefix
 */
export function getPrefix(network: Network): string {
  switch (network) {
    case networks.bitcoincash:
      return 'bitcoincash';
    case networks.bitcoincashTestnet:
      return 'bchtest';
    default:
      throw new Error(`unsupported prefix for ${getNetworkName(network)}`);
  }
}

/**
 * @param outputScript
 * @param network
 * @return outputScript encoded as cashaddr (prefixed, lowercase)
 */
export function fromOutputScriptToCashAddress(
  outputScript: Buffer,
  network: Network,
): string {
  if (!isBitcoinCash(network)) {
    throw new Error(`invalid network`);
  }
  for (const [paymentName, scriptType] of [
    ['p2pkh', 'pubkeyhash'],
    ['p2sh', 'scripthash'],
  ]) {
    const hash = getHashFromOutputScript(paymentName, outputScript);
    if (hash) {
      return cashaddress.encode(
        getPrefix(network),
        scriptType as cashaddress.ScriptType,
        hash,
      );
    }
  }
  throw new Error(`could not determine hash for outputScript`);
}

/**
 * @param address - Accepts addresses with and without prefix. Accepts all-lowercase and all-uppercase addresses. Rejects mixed-case addresses.
 * @param network
 * @return decoded output script
 */
export function toOutputScriptFromCashAddress(
  address: string,
  network: Network,
): Buffer {
  if (!isBitcoinCash(network)) {
    throw new Error(`invalid network`);
  }
  if (address === address.toUpperCase()) {
    address = address.toLowerCase();
  }
  if (address !== address.toLowerCase()) {
    throw new Error(`mixed-case addresses not allowed`);
  }
  if (!address.startsWith(getPrefix(network) + ':')) {
    address = `${getPrefix(network)}:${address}`;
  }
  const decoded = cashaddress.decode(address);
  let outputScript: Buffer | undefined;
  switch (decoded.version) {
    case 'scripthash':
      outputScript = payments.p2sh({ hash: decoded.hash }).output;
      break;
    case 'pubkeyhash':
      outputScript = payments.p2pkh({ hash: decoded.hash }).output;
      break;
    default:
      throw new Error(`unknown version ${decoded.version}`);
  }
  if (!outputScript) {
    throw new Error(`could not determine output script`);
  }
  return outputScript;
}

/**
 * @param outputScript
 * @param format
 * @param network
 * @return address in specified format
 */
export function fromOutputScriptWithFormat(
  outputScript: Buffer,
  format: AddressFormat,
  network: Network,
): string {
  if (!isBitcoinCash(network)) {
    throw new Error(`invalid network`);
  }

  if (format === 'cashaddr') {
    return fromOutputScriptToCashAddress(outputScript, network);
  }

  if (format === 'default') {
    return address.fromOutputScript(outputScript, network as NativeNetwork);
  }

  throw new Error(`invalid format`);
}

/**
 * @param address
 * @param format
 * @param network
 * @return output script from address in specified format
 */
export function toOutputScriptWithFormat(
  addressIn: string,
  format: AddressFormat,
  network: Network,
): Buffer {
  if (!isBitcoinCash(network)) {
    throw new Error(`invalid network`);
  }

  if (format === 'cashaddr') {
    return toOutputScriptFromCashAddress(addressIn, network);
  }

  if (format === 'default') {
    return address.toOutputScript(addressIn, network as NativeNetwork);
  }

  throw new Error(`invalid format`);
}
