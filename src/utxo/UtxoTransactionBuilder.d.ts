/// <reference types="node" />
import { Signer, Transaction, TxOutput, Network } from '..';
import { Network as utxoNetwork } from './networks';
import { TransactionBuilder } from '../transaction_builder';
import { UtxoTransaction } from './UtxoTransaction';
export interface TxbSignArg {
    prevOutScriptType: string;
    vin: number;
    keyPair: Signer;
    redeemScript?: Buffer;
    hashType?: number;
    witnessValue?: number;
    witnessScript?: Buffer;
    controlBlock?: Buffer;
}
export declare class UtxoTransactionBuilder<T extends UtxoTransaction = UtxoTransaction> extends TransactionBuilder {
    constructor(network: utxoNetwork, txb?: TransactionBuilder, prevOutputs?: TxOutput[]);
    createInitialTransaction(network: utxoNetwork, tx?: Transaction): UtxoTransaction;
    static fromTransaction(tx: UtxoTransaction, _network?: Network, prevOutputs?: TxOutput[]): UtxoTransactionBuilder;
    get tx(): T;
    build(): T;
    buildIncomplete(): T;
    sign(signParams: number | TxbSignArg, keyPair?: Signer, redeemScript?: Buffer, hashType?: number, witnessValue?: number, witnessScript?: Buffer): void;
}
