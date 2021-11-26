/// <reference types="node" />
import { Network } from '..';
export declare const scriptTypeP2shP2pk = "p2shP2pk";
export declare type ScriptTypeP2shP2pk = typeof scriptTypeP2shP2pk;
export declare const scriptTypes2Of3: readonly ["p2sh", "p2shP2wsh", "p2wsh", "p2tr"];
export declare type ScriptType2Of3 = typeof scriptTypes2Of3[number];
export declare function isScriptType2Of3(t: string): t is ScriptType2Of3;
export declare type ScriptType = ScriptTypeP2shP2pk | ScriptType2Of3;
/**
 * @param network
 * @param scriptType
 * @return true iff script type is supported for network
 */
export declare function isSupportedScriptType(_network: Network, scriptType: ScriptType): boolean;
/**
 * @param t
 * @return string prevOut as defined in PREVOUT_TYPES (bitcoinjs-lib/.../transaction_builder.js)
 */
export declare function scriptType2Of3AsPrevOutType(t: ScriptType2Of3): string;
export declare type SpendableScript = {
    scriptPubKey: Buffer;
    /** @deprecated - use createSpendScripts2of3 */
    redeemScript?: Buffer;
    /** @deprecated - use createSpendScript2of3 */
    witnessScript?: Buffer;
};
export declare type SpendScriptP2tr = {
    controlBlock: Buffer;
    witnessScript: Buffer;
};
/**
 * Return scripts for p2sh-p2pk (used for BCH/BSV replay protection)
 * @param pubkey
 */
export declare function createOutputScriptP2shP2pk(pubkey: Buffer): SpendableScript;
/**
 * Return scripts for 2-of-3 multisig output
 * @param pubkeys - the key triple for multisig
 * @param scriptType
 * @param network - if set, performs sanity check for scriptType support
 * @returns {{redeemScript, witnessScript, scriptPubKey}}
 */
export declare function createOutputScript2of3(pubkeys: Buffer[], scriptType: ScriptType2Of3, network?: Network): SpendableScript;
/**
 * Creates and returns a taproot output script using the user and bitgo keys for the aggregate
 * public key and a taptree containing a user+bitgo 2-of-2 script at the first depth level of the
 * tree and user+backup and bitgo+backup 2-of-2 scripts one level deeper.
 * @param pubkeys - a pubkey array containing the user key, backup key, and bitgo key in that order
 * @returns {{scriptPubKey}}
 */
