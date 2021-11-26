/// <reference types="node" />
import { Transaction, TxOutput } from '..';
import { Network } from './networks';
export declare function varSliceSize(slice: Buffer): number;
export declare class UtxoTransaction extends Transaction {
    network: Network;
    static SIGHASH_FORKID: number;
    /** @deprecated use SIGHASH_FORKID */
    static SIGHASH_BITCOINCASHBIP143: number;
    constructor(network: Network, transaction?: Transaction);
    static fromBuffer(buf: Buffer, noStrict: boolean, network?: Network, _prevOutput?: TxOutput[]): UtxoTransaction;
    addForkId(hashType: number): number;
    hashForWitnessV0(inIndex: number, prevOutScript: Buffer, value: number, hashType: number): Buffer;
    /**
     * Calculate the hash to verify the signature against
     */
    hashForSignatureByNetwork(inIndex: number, prevoutScript: Buffer, value: number | undefined, hashType: number): Buffer;
    hashForSignature(inIndex: number, prevOutScript: Buffer, hashType: number): Buffer;
    clone(): UtxoTransaction;
}
