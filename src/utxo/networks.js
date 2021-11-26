'use strict';
/*

The values for the various fork coins can be found in these files:

property       filename                  varname                           notes
------------------------------------------------------------------------------------------------------------------------
messagePrefix  src/validation.cpp        strMessageMagic                   Format `${CoinName} Signed Message`
bech32_hrp     src/chainparams.cpp       bech32_hrp                        Only for some networks
bip32.public   src/chainparams.cpp       base58Prefixes[EXT_PUBLIC_KEY]    Mainnets have same value, testnets have same value
bip32.private  src/chainparams.cpp       base58Prefixes[EXT_SECRET_KEY]    Mainnets have same value, testnets have same value
pubKeyHash     src/chainparams.cpp       base58Prefixes[PUBKEY_ADDRESS]
scriptHash     src/chainparams.cpp       base58Prefixes[SCRIPT_ADDRESS]
wif            src/chainparams.cpp       base58Prefixes[SECRET_KEY]        Testnets have same value
forkId         src/script/interpreter.h  FORKID_*

*/
Object.defineProperty(exports, '__esModule', { value: true });
exports.supportsTaproot = exports.supportsSegwit = exports.isValidNetwork = exports.isZcash = exports.isLitecoin = exports.isDash = exports.isBitcoinSV = exports.isBitcoinGold = exports.isBitcoinCash = exports.isBitcoin = exports.getTestnet = exports.isSameCoin = exports.isTestnet = exports.isMainnet = exports.getMainnet = exports.getNetworkName = exports.getNetworkList = exports.networks = void 0;
function getDefaultBip32Mainnet() {
  return {
    // base58 'xpub'
    public: 0x0488b21e,
    // base58 'xprv'
    private: 0x0488ade4,
  };
}
function getDefaultBip32Testnet() {
  return {
    // base58 'tpub'
    public: 0x043587cf,
    // base58 'tprv'
    private: 0x04358394,
  };
}
exports.networks = {
  // https://github.com/bitcoin/bitcoin/blob/master/src/validation.cpp
  // https://github.com/bitcoin/bitcoin/blob/master/src/chainparams.cpp
  bitcoin: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: getDefaultBip32Mainnet(),
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
  },
  testnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: getDefaultBip32Testnet(),
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  },
  // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/src/validation.cpp
  // https://github.com/Bitcoin-ABC/bitcoin-abc/blob/master/src/chainparams.cpp
  // https://github.com/bitcoincashorg/bitcoincash.org/blob/master/spec/cashaddr.md
  bitcoincash: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: getDefaultBip32Mainnet(),
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
    forkId: 0x00,
    cashAddr: {
      prefix: 'bitcoincash',
      pubKeyHash: 0x00,
      scriptHash: 0x08,
    },
  },
  bitcoincashTestnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: getDefaultBip32Testnet(),
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
    cashAddr: {
      prefix: 'bchtest',
      pubKeyHash: 0x00,
      scriptHash: 0x08,
    },
  },
  // https://github.com/BTCGPU/BTCGPU/blob/master/src/validation.cpp
  // https://github.com/BTCGPU/BTCGPU/blob/master/src/chainparams.cpp
  // https://github.com/BTCGPU/BTCGPU/blob/master/src/script/interpreter.h
  bitcoingold: {
    messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
    bech32: 'btg',
    bip32: getDefaultBip32Mainnet(),
    pubKeyHash: 0x26,
    scriptHash: 0x17,
    wif: 0x80,
    forkId: 79,
  },
  bitcoingoldTestnet: {
    messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
    bech32: 'tbtg',
    bip32: getDefaultBip32Testnet(),
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 0xef,
    forkId: 79,
  },
  // https://github.com/bitcoin-sv/bitcoin-sv/blob/master/src/validation.cpp
  // https://github.com/bitcoin-sv/bitcoin-sv/blob/master/src/chainparams.cpp
  bitcoinsv: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: getDefaultBip32Mainnet(),
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
    forkId: 0x00,
  },
  bitcoinsvTestnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: getDefaultBip32Testnet(),
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
    forkId: 0x00,
  },
  // https://github.com/dashpay/dash/blob/master/src/validation.cpp
  // https://github.com/dashpay/dash/blob/master/src/chainparams.cpp
  dash: {
    messagePrefix: '\x19DarkCoin Signed Message:\n',
    bip32: getDefaultBip32Mainnet(),
    pubKeyHash: 0x4c,
    scriptHash: 0x10,
    wif: 0xcc,
  },
  dashTest: {
    messagePrefix: '\x19DarkCoin Signed Message:\n',
    bip32: getDefaultBip32Testnet(),
    pubKeyHash: 0x8c,
    scriptHash: 0x13,
    wif: 0xef,
  },
  // https://github.com/litecoin-project/litecoin/blob/master/src/validation.cpp
  // https://github.com/litecoin-project/litecoin/blob/master/src/chainparams.cpp
  litecoin: {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: getDefaultBip32Mainnet(),
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
  },
  litecoinTest: {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'tltc',
    bip32: getDefaultBip32Testnet(),
    pubKeyHash: 0x6f,
    scriptHash: 0x3a,
    wif: 0xef,
  },
  // https://github.com/zcash/zcash/blob/master/src/validation.cpp
  // https://github.com/zcash/zcash/blob/master/src/chainparams.cpp
  zcash: {
    messagePrefix: '\x18ZCash Signed Message:\n',
    bip32: getDefaultBip32Mainnet(),
    pubKeyHash: 0x1cb8,
    scriptHash: 0x1cbd,
    wif: 0x80,
    consensusBranchId: { '1': 0, '2': 0, '3': 1537743641, '4': 928093729 },
  },
  zcashTest: {
    messagePrefix: '\x18ZCash Signed Message:\n',
    bip32: getDefaultBip32Testnet(),
    pubKeyHash: 0x1d25,
    scriptHash: 0x1cba,
    wif: 0xef,
    consensusBranchId: { '1': 0, '2': 0, '3': 1537743641, '4': 928093729 },
  },
};
/**
 * @returns {Network[]} all known networks as array
 */
function getNetworkList() {
  return Object.values(exports.networks);
}
exports.getNetworkList = getNetworkList;
/**
 * @param {Network} network
 * @returns {string} the name of the network. Returns undefined if network is not a value
 *                   of `networks`
 */
function getNetworkName(network) {
  return Object.keys(exports.networks).find(
    n => exports.networks[n] === network,
  );
}
exports.getNetworkName = getNetworkName;
/**
 * @param {Network} network
 * @returns {Object} the mainnet corresponding to a testnet
 */
function getMainnet(network) {
  switch (network) {
    case exports.networks.bitcoin:
    case exports.networks.testnet:
      return exports.networks.bitcoin;
    case exports.networks.bitcoincash:
    case exports.networks.bitcoincashTestnet:
      return exports.networks.bitcoincash;
    case exports.networks.bitcoingold:
    case exports.networks.bitcoingoldTestnet:
      return exports.networks.bitcoingold;
    case exports.networks.bitcoinsv:
    case exports.networks.bitcoinsvTestnet:
      return exports.networks.bitcoinsv;
    case exports.networks.dash:
    case exports.networks.dashTest:
      return exports.networks.dash;
    case exports.networks.litecoin:
    case exports.networks.litecoinTest:
      return exports.networks.litecoin;
    case exports.networks.zcash:
    case exports.networks.zcashTest:
      return exports.networks.zcash;
  }
  throw new TypeError(`invalid network`);
}
exports.getMainnet = getMainnet;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is a mainnet
 */
function isMainnet(network) {
  return getMainnet(network) === network;
}
exports.isMainnet = isMainnet;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is a testnet
 */
function isTestnet(network) {
  return getMainnet(network) !== network;
}
exports.isTestnet = isTestnet;
/**
 *
 * @param {Network} network
 * @param {Network} otherNetwork
 * @returns {boolean} true iff both networks are for the same coin
 */
function isSameCoin(network, otherNetwork) {
  return getMainnet(network) === getMainnet(otherNetwork);
}
exports.isSameCoin = isSameCoin;
const mainnets = getNetworkList().filter(isMainnet);
const testnets = getNetworkList().filter(isTestnet);
/**
 * Map where keys are mainnet networks and values are testnet networks
 * @type {Map<Network, Network[]>}
 */
const mainnetTestnetPairs = new Map(
  mainnets.map(m => [m, testnets.filter(t => getMainnet(t) === m)]),
);
/**
 * @param {Network} network
 * @returns {Network|undefined} - The testnet corresponding to a mainnet.
 *                               Returns undefined if a network has no testnet.
 */
function getTestnet(network) {
  if (isTestnet(network)) {
    return network;
  }
  const testnets = mainnetTestnetPairs.get(network);
  if (testnets === undefined) {
    throw new Error(`invalid argument`);
  }
  if (testnets.length === 0) {
    return;
  }
  if (testnets.length === 1) {
    return testnets[0];
  }
  throw new Error(`more than one testnet for ${getNetworkName(network)}`);
}
exports.getTestnet = getTestnet;
/**
 * @param {Network} network
 * @returns {boolean} true iff network bitcoin or testnet
 */
function isBitcoin(network) {
  return getMainnet(network) === exports.networks.bitcoin;
}
exports.isBitcoin = isBitcoin;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is bitcoincash or bitcoincashTestnet
 */
function isBitcoinCash(network) {
  return getMainnet(network) === exports.networks.bitcoincash;
}
exports.isBitcoinCash = isBitcoinCash;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is bitcoingold
 */
function isBitcoinGold(network) {
  return getMainnet(network) === exports.networks.bitcoingold;
}
exports.isBitcoinGold = isBitcoinGold;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is bitcoinsv or bitcoinsvTestnet
 */
function isBitcoinSV(network) {
  return getMainnet(network) === exports.networks.bitcoinsv;
}
exports.isBitcoinSV = isBitcoinSV;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is dash or dashTest
 */
function isDash(network) {
  return getMainnet(network) === exports.networks.dash;
}
exports.isDash = isDash;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is litecoin or litecoinTest
 */
function isLitecoin(network) {
  return getMainnet(network) === exports.networks.litecoin;
}
exports.isLitecoin = isLitecoin;
/**
 * @param {Network} network
 * @returns {boolean} true iff network is zcash or zcashTest
 */
function isZcash(network) {
  try {
    return getMainnet(network) === exports.networks.zcash;
  } catch (e) {
    return false;
  }
}
exports.isZcash = isZcash;
/**
 * @param {unknown} network
 * @returns {boolean} returns true iff network is any of the network stated in the argument
 */
function isValidNetwork(network) {
  return getNetworkList().includes(network);
}
exports.isValidNetwork = isValidNetwork;
function supportsSegwit(network) {
  return [
    exports.networks.bitcoin,
    exports.networks.litecoin,
    exports.networks.bitcoingold,
  ].includes(getMainnet(network));
}
exports.supportsSegwit = supportsSegwit;
function supportsTaproot(network) {
  return getMainnet(network) === exports.networks.bitcoin;
}
exports.supportsTaproot = supportsTaproot;
