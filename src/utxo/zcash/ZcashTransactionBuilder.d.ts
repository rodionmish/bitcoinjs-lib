/// <reference types="node" />
import { ZcashTransaction } from './ZcashTransaction';
import { UtxoTransactionBuilder } from '../UtxoTransactionBuilder';
import { Network, ZcashNetwork } from '../networks';
import { Transaction } from '../../transaction';
import { TxOutput } from '../..';
export declare class ZcashTransactionBuilder extends UtxoTransactionBuilder<ZcashTransaction> {
    constructor(network: ZcashNetwork);
    createInitialTransaction(network: Network, tx?: Transaction): ZcashTransaction;
    static fromTransaction(transaction: ZcashTransaction, _network?: Network, _prevOutput?: TxOutput[]): ZcashTransactionBuilder;
    setVersion(version: number, overwinter?: boolean): void;
    setDefaultsForVersion(network: ZcashNetwork, version: number): void;
    private hasSignatures;
    private setPropertyCheckSignatures;
    setConsensusBranchId(consensusBranchId: number): void;
    setVersionGroupId(versionGroupId: number): void;
    setExpiryHeight(expiryHeight: number): void;
    build(): ZcashTransaction;
    buildIncomplete(): ZcashTransaction;
    addOutput(scriptPubKey: string | Buffer, value: number): number;
}
