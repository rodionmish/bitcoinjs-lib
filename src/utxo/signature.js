'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.signInput2Of3 = exports.signInputP2shP2pk = exports.verifySignatureWithPublicKey = exports.verifySignatureWithPublicKeys = exports.verifySignature = exports.getSignatureVerifications = exports.parseSignatureScript2Of3 = exports.parseSignatureScript = exports.getDefaultSigHash = exports.isPlaceholderSignature = void 0;
const opcodes_1 = require('./opcodes');
const classify = require('../classify');
const ScriptSignature = require('../script_signature');
const __1 = require('..');
const UtxoTransaction_1 = require('./UtxoTransaction');
const outputScripts_1 = require('./outputScripts');
const types_1 = require('./types');
const networks_1 = require('./networks');
const ecpair_1 = require('ecpair');
const inputTypes = [
  'multisig',
  'nonstandard',
  'nulldata',
  'pubkey',
  'pubkeyhash',
  'scripthash',
  'witnesspubkeyhash',
  'witnessscripthash',
  'taproot',
  'taprootnofn',
  'witnesscommitment',
];
function isPlaceholderSignature(v) {
  if (Buffer.isBuffer(v)) {
    return v.length === 0;
  }
  return v === 0;
}
exports.isPlaceholderSignature = isPlaceholderSignature;
function getDefaultSigHash(network, scriptType) {
  switch ((0, networks_1.getMainnet)(network)) {
    case networks_1.networks.bitcoincash:
    case networks_1.networks.bitcoinsv:
    case networks_1.networks.bitcoingold:
      return (
        __1.Transaction.SIGHASH_ALL |
        UtxoTransaction_1.UtxoTransaction.SIGHASH_FORKID
      );
    default:
      return scriptType === 'p2tr'
        ? __1.Transaction.SIGHASH_DEFAULT
        : __1.Transaction.SIGHASH_ALL;
  }
}
exports.getDefaultSigHash = getDefaultSigHash;
/**
 * Parse a transaction's signature script to obtain public keys, signatures, the sig script,
 * and other properties.
 *
 * Only supports script types used in BitGo transactions.
 *
 * @param input
 * @returns ParsedSignatureScript
 */
function parseSignatureScript(input) {
  const isSegwitInput = input.witness.length > 0;
  const isNativeSegwitInput = input.script.length === 0;
  let decompiledSigScript;
  let inputClassification;
  if (isSegwitInput) {
    // The decompiledSigScript is the script containing the signatures, public keys, and the script that was committed
    // to (pubScript). If this is a segwit input the decompiledSigScript is in the witness, regardless of whether it
    // is native or not. The inputClassification is determined based on whether or not the input is native to give an
    // accurate classification. Note that p2shP2wsh inputs will be classified as p2sh and not p2wsh.
    decompiledSigScript = input.witness;
    if (isNativeSegwitInput) {
      inputClassification = classify.witness(decompiledSigScript, true);
    } else {
      inputClassification = classify.input(input.script, true);
    }
  } else {
    inputClassification = classify.input(input.script, true);
    decompiledSigScript = __1.script.decompile(input.script);
  }
  if (!decompiledSigScript) {
    return { scriptType: undefined, isSegwitInput, inputClassification };
  }
  if (inputClassification === 'pubkeyhash') {
    /* istanbul ignore next */
    if (!decompiledSigScript || decompiledSigScript.length !== 2) {
      throw new Error('unexpected signature for p2pkh');
    }
    const [signature, publicKey] = decompiledSigScript;
    /* istanbul ignore next */
    if (!Buffer.isBuffer(signature) || !Buffer.isBuffer(publicKey)) {
      throw new Error('unexpected signature for p2pkh');
    }
    const publicKeys = [publicKey];
    const signatures = [signature];
    const pubScript = __1.payments.p2pkh({ pubkey: publicKey }).output;
    return {
      scriptType: 'p2pkh',
      isSegwitInput,
      inputClassification,
      signatures,
      publicKeys,
      pubScript,
    };
  }
  // Note the assumption here that if we have a p2sh or p2wsh input it will be multisig (appropriate because the
  // BitGo platform only supports multisig within these types of inputs, with the exception of replay protection inputs,
  // which are single signature p2sh). Signatures are all but the last entry in the decompiledSigScript.
  // The redeemScript/witnessScript (depending on which type of input this is) is the last entry in
  // the decompiledSigScript (denoted here as the pubScript). The public keys are the second through
  // antepenultimate entries in the decompiledPubScript. See below for a visual representation of the typical 2-of-3
  // multisig setup:
  //
  //   decompiledSigScript = 0 <sig1> <sig2> [<sig3>] <pubScript>
  //   decompiledPubScript = 2 <pub1> <pub2> <pub3> 3 OP_CHECKMULTISIG
  //
  // Transactions built with `.build()` only have two signatures `<sig1>` and `<sig2>` in _decompiledSigScript_.
  // Transactions built with `.buildIncomplete()` have three signatures, where missing signatures are substituted with `OP_0`.
  if (
    inputClassification !== 'scripthash' &&
    inputClassification !== 'witnessscripthash'
  ) {
    return { scriptType: undefined, isSegwitInput, inputClassification };
  }
  const pubScript = decompiledSigScript[decompiledSigScript.length - 1];
  /* istanbul ignore next */
  if (!Buffer.isBuffer(pubScript)) {
    throw new Error(`invalid pubScript`);
  }
  const p2shOutputClassification = classify.output(pubScript);
  if (
    inputClassification === 'scripthash' &&
    p2shOutputClassification === 'pubkey'
  ) {
    return {
      scriptType: 'p2shP2pk',
      isSegwitInput,
      inputClassification,
      p2shOutputClassification,
    };
  }
  if (p2shOutputClassification !== 'multisig') {
    return {
      scriptType: undefined,
      isSegwitInput,
      inputClassification,
      p2shOutputClassification,
    };
  }
  const decompiledPubScript = __1.script.decompile(pubScript);
  if (decompiledPubScript === null) {
    /* istanbul ignore next */
    throw new Error(`could not decompile pubScript`);
  }
  const expectedScriptLength =
    // complete transactions with 2 signatures
    decompiledSigScript.length === 4 ||
    // incomplete transaction with 3 signatures or signature placeholders
    decompiledSigScript.length === 5;
  if (!expectedScriptLength) {
    return { scriptType: undefined, isSegwitInput, inputClassification };
  }
  if (isSegwitInput) {
    /* istanbul ignore next */
    if (!Buffer.isBuffer(decompiledSigScript[0])) {
      throw new Error(
        `expected decompiledSigScript[0] to be a buffer for segwit inputs`,
      );
    }
    /* istanbul ignore next */
    if (decompiledSigScript[0].length !== 0) {
      throw new Error(`witness stack expected to start with empty buffer`);
    }
  } else if (decompiledSigScript[0] !== opcodes_1.opcodes.OP_0) {
    throw new Error(`sigScript expected to start with OP_0`);
  }
  const signatures = decompiledSigScript.slice(
    1 /* ignore leading OP_0 */,
    -1 /* ignore trailing pubScript */,
  );
  /* istanbul ignore next */
  if (signatures.length !== 2 && signatures.length !== 3) {
    throw new Error(`expected 2 or 3 signatures, got ${signatures.length}`);
  }
  /* istanbul ignore next */
  if (decompiledPubScript.length !== 6) {
    throw new Error(`unexpected decompiledPubScript length`);
  }
  const publicKeys = decompiledPubScript.slice(1, -2);
  publicKeys.forEach(b => {
    /* istanbul ignore next */
    if (!Buffer.isBuffer(b)) {
      throw new Error();
    }
  });
  if (!(0, types_1.isTriple)(publicKeys)) {
    /* istanbul ignore next */
    throw new Error(`expected 3 public keys, got ${publicKeys.length}`);
  }
  // Op codes 81 through 96 represent numbers 1 through 16 (see https://en.bitcoin.it/wiki/Script#Opcodes), which is
  // why we subtract by 80 to get the number of signatures (n) and the number of public keys (m) in an n-of-m setup.
  const len = decompiledPubScript.length;
  const signatureThreshold = decompiledPubScript[0] - 80;
  /* istanbul ignore next */
  if (signatureThreshold !== 2) {
    throw new Error(`expected signatureThreshold 2, got ${signatureThreshold}`);
  }
  const nPubKeys = decompiledPubScript[len - 2] - 80;
  /* istanbul ignore next */
  if (nPubKeys !== 3) {
    throw new Error(`expected nPubKeys 3, got ${nPubKeys}`);
  }
  const lastOpCode = decompiledPubScript[len - 1];
  /* istanbul ignore next */
  if (lastOpCode !== opcodes_1.opcodes.OP_CHECKMULTISIG) {
    throw new Error(
      `expected opcode #${
        opcodes_1.opcodes.OP_CHECKMULTISIG
      }, got opcode #${lastOpCode}`,
    );
  }
  const scriptType = input.witness.length
    ? input.script.length
      ? 'p2shP2wsh'
      : 'p2wsh'
    : input.script.length
    ? 'p2sh'
    : undefined;
  if (scriptType === undefined) {
    throw new Error('illegal state');
  }
  return {
    scriptType,
    isSegwitInput,
    inputClassification,
    p2shOutputClassification,
    signatures: signatures.map(b => {
      if (Buffer.isBuffer(b) || b === 0) {
        return b;
      }
      throw new Error(`unexpected signature element ${b}`);
    }),
    publicKeys,
    pubScript,
  };
}
exports.parseSignatureScript = parseSignatureScript;
function parseSignatureScript2Of3(input) {
  const result = parseSignatureScript(input);
  if (
    ![classify.types.P2WSH, classify.types.P2SH, classify.types.P2PKH].includes(
      result.inputClassification,
    )
  ) {
    throw new Error(
      `unexpected inputClassification ${result.inputClassification}`,
    );
  }
  if (!result.signatures) {
    throw new Error(`missing signatures`);
  }
  if (result.publicKeys.length !== 3 && result.publicKeys.length !== 2) {
    throw new Error(`unexpected pubkey count`);
  }
  if (!result.pubScript || result.pubScript.length === 0) {
    throw new Error(`pubScript missing or empty`);
  }
  return result;
}
exports.parseSignatureScript2Of3 = parseSignatureScript2Of3;
/**
 * @deprecated - use {@see verifySignaturesWithPublicKeys} instead
 * Get signature verifications for multsig transaction
 * @param transaction
 * @param inputIndex
 * @param amount - must be set for segwit transactions and BIP143 transactions
 * @param verificationSettings
 * @param prevOutputs - must be set for p2tr transactions
 * @returns SignatureVerification[] - in order of parsed non-empty signatures
 */
function getSignatureVerifications(
  transaction,
  inputIndex,
  amount,
  verificationSettings = {},
  _prevOutputs,
) {
  /* istanbul ignore next */
  if (!transaction.ins) {
    throw new Error(`invalid transaction`);
  }
  const input = transaction.ins[inputIndex];
  /* istanbul ignore next */
  if (!input) {
    throw new Error(`no input at index ${inputIndex}`);
  }
  if (
    (!input.script || input.script.length === 0) &&
    input.witness.length === 0
  ) {
    // Unsigned input: no signatures.
    return [];
  }
  const parsedScript = parseSignatureScript2Of3(input);
  const signatures = parsedScript.signatures
    .filter(s => s && s.length)
    .filter(
      (_s, i) =>
        verificationSettings.signatureIndex === undefined ||
        verificationSettings.signatureIndex === i,
    );
  const publicKeys = parsedScript.publicKeys.filter(
    buf =>
      verificationSettings.publicKey === undefined ||
      verificationSettings.publicKey.equals(buf) ||
      verificationSettings.publicKey.slice(1).equals(buf),
  );
  return signatures.map(signatureBuffer => {
    if (signatureBuffer === 0 || signatureBuffer.length === 0) {
      return { signedBy: undefined };
    }
    // slice the last byte from the signature hash input because it's the hash type
    const { signature, hashType } = ScriptSignature.decode(signatureBuffer);
    const transactionHash = parsedScript.isSegwitInput
      ? transaction.hashForWitnessV0(
          inputIndex,
          parsedScript.pubScript,
          amount,
          hashType,
        )
      : transaction.hashForSignatureByNetwork(
          inputIndex,
          parsedScript.pubScript,
          amount,
          hashType,
        );
    const signedBy = publicKeys.filter(publicKey =>
      ecpair_1.ECPair.fromPublicKey(publicKey).verify(
        transactionHash,
        signature,
      ),
    );
    if (signedBy.length === 0) {
      return { signedBy: undefined };
    }
    if (signedBy.length === 1) {
      return { signedBy: signedBy[0] };
    }
    throw new Error(`illegal state: signed by multiple public keys`);
  });
}
exports.getSignatureVerifications = getSignatureVerifications;
/**
 * @deprecated use {@see verifySignatureWithPublicKeys} instead
 * @param transaction
 * @param inputIndex
 * @param amount
 * @param verificationSettings - if publicKey is specified, returns true iff any signature is signed by publicKey.
 * @param prevOutputs - must be set for p2tr transactions
 */
function verifySignature(
  transaction,
  inputIndex,
  amount,
  verificationSettings = {},
  prevOutputs,
) {
  const signatureVerifications = getSignatureVerifications(
    transaction,
    inputIndex,
    amount,
    verificationSettings,
    prevOutputs,
  ).filter(
    v =>
      // If no publicKey is set in verificationSettings, all signatures must be valid.
      // Otherwise, a single valid signature by the specified pubkey is sufficient.
      verificationSettings.publicKey === undefined ||
      (v.signedBy !== undefined &&
        (verificationSettings.publicKey.equals(v.signedBy) ||
          verificationSettings.publicKey.slice(1).equals(v.signedBy))),
  );
  return (
    signatureVerifications.length > 0 &&
    signatureVerifications.every(v => v.signedBy !== undefined)
  );
}
exports.verifySignature = verifySignature;
/**
 * @param v
 * @param publicKey
 * @return true iff signature is by publicKey (or xonly variant of publicKey)
 */
function isSignatureByPublicKey(v, publicKey) {
  return (
    !!v.signedBy &&
    (v.signedBy.equals(publicKey) ||
      /* for p2tr signatures, we pass the pubkey in 33-byte format recover it from the signature in 32-byte format */
      (publicKey.length === 33 &&
        isSignatureByPublicKey(v, publicKey.slice(1))))
  );
}
/**
 * @param transaction
 * @param inputIndex
 * @param prevOutputs - transaction outputs for inputs
 * @param publicKeys - public keys to check signatures for
 * @return array of booleans indicating a valid signature for every pubkey in _publicKeys_
 */
function verifySignatureWithPublicKeys(
  transaction,
  inputIndex,
  prevOutputs,
  publicKeys,
) {
  if (transaction.ins.length !== prevOutputs.length) {
    throw new Error(`input length must match prevOutputs length`);
  }
  const signatureVerifications = getSignatureVerifications(
    transaction,
    inputIndex,
    prevOutputs[inputIndex].value,
    {},
    prevOutputs,
  );
  return publicKeys.map(
    publicKey =>
      !!signatureVerifications.find(v => isSignatureByPublicKey(v, publicKey)),
  );
}
exports.verifySignatureWithPublicKeys = verifySignatureWithPublicKeys;
/**
 * Wrapper for {@see verifySignatureWithPublicKeys} for single pubkey
 * @param transaction
 * @param inputIndex
 * @param prevOutputs
 * @param publicKey
 * @return true iff signature is valid
 */
function verifySignatureWithPublicKey(
  transaction,
  inputIndex,
  prevOutputs,
  publicKey,
) {
  return verifySignatureWithPublicKeys(transaction, inputIndex, prevOutputs, [
    publicKey,
  ])[0];
}
exports.verifySignatureWithPublicKey = verifySignatureWithPublicKey;
function signInputP2shP2pk(txBuilder, vin, keyPair) {
  const prevOutScriptType = 'p2sh-p2pk';
  const { redeemScript, witnessScript } = (0,
  outputScripts_1.createOutputScriptP2shP2pk)(keyPair.publicKey);
  keyPair.network = txBuilder.network;
  txBuilder.sign({
    vin,
    prevOutScriptType,
    keyPair,
    hashType: getDefaultSigHash(txBuilder.network),
    redeemScript,
    witnessScript,
    witnessValue: undefined,
  });
}
exports.signInputP2shP2pk = signInputP2shP2pk;
function signInput2Of3(
  txBuilder,
  vin,
  scriptType,
  pubkeys,
  keyPair,
  _cosigner,
  amount,
) {
  let controlBlock;
  let redeemScript;
  let witnessScript;
  const prevOutScriptType = (0, outputScripts_1.scriptType2Of3AsPrevOutType)(
    scriptType,
  );
  if (scriptType === 'p2tr') {
    // ({ witnessScript, controlBlock } = createSpendScriptP2tr(pubkeys, [
    //   keyPair.publicKey,
    //   cosigner,
    // ]));
  } else {
    ({ redeemScript, witnessScript } = (0,
    outputScripts_1.createOutputScript2of3)(pubkeys, scriptType));
  }
  keyPair.network = txBuilder.network;
  txBuilder.sign({
    vin,
    prevOutScriptType,
    keyPair,
    hashType: getDefaultSigHash(txBuilder.network, scriptType),
    redeemScript,
    witnessScript,
    witnessValue: amount,
    controlBlock,
  });
}
exports.signInput2Of3 = signInput2Of3;
