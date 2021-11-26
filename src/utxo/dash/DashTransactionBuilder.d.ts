/// <reference types="node" />
import { Network } from '../networks';
import { UtxoTransactionBuilder } from '../UtxoTransactionBuilder';
import { DashTransaction } from './DashTransaction';
import { Transaction, TxOutput } from '../..';
import { Network as NativeNetwork } from '../../networks';
export declare class DashTransactionBuilder extends UtxoTransactionBuilder<DashTransaction> {
    constructor(network: Network, txb?: UtxoTransactionBuilder);
    createInitialTransaction(network: Network, tx?: Transaction): DashTransaction;
    setType(type: number): void;
    setExtraPayload(extraPayload?: Buffer): void;
    static fromTransaction(tx: DashTransaction, network?: NativeNetwork, prevOutput?: TxOutput[]): DashTransactionBuilder;
}
