/// <reference types="node" />
import { Network, ZcashNetwork } from './networks';
import { UtxoTransaction } from './UtxoTransaction';
import { UtxoTransactionBuilder } from './UtxoTransactionBuilder';
import { TxOutput } from '..';
export declare function createTransactionFromBuffer(buf: Buffer, network: Network, { version }?: {
    version?: number;
}): UtxoTransaction;
export declare function createTransactionFromHex(hex: string, network: Network): UtxoTransaction;
export declare function getDefaultTransactionVersion(network: Network): number;
export declare function setTransactionBuilderDefaults(txb: UtxoTransactionBuilder, network: Network | ZcashNetwork, { version, }?: {
    version?: number;
}): void;
export declare function createTransactionBuilderForNetwork(network: Network, { version }?: {
    version?: number;
}): UtxoTransactionBuilder;
export declare function createTransactionBuilderFromTransaction(tx: UtxoTransaction, prevOutputs?: TxOutput[]): UtxoTransactionBuilder;
