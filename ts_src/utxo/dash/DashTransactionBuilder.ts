import { Network } from '../networks';
import { UtxoTransactionBuilder } from '../UtxoTransactionBuilder';
import { DashTransaction } from './DashTransaction';
import { UtxoTransaction } from '../UtxoTransaction';
import { Transaction, TxOutput } from '../..';
import { Network as NativeNetwork } from '../../networks';

export class DashTransactionBuilder extends UtxoTransactionBuilder<
  DashTransaction
> {
  constructor(network: Network, txb?: UtxoTransactionBuilder) {
    super(network, txb);
  }

  createInitialTransaction(
    network: Network,
    tx?: Transaction,
  ): DashTransaction {
    return new DashTransaction(network, tx as UtxoTransaction);
  }

  setType(type: number): void {
    this.tx.type = type;
  }

  setExtraPayload(extraPayload?: Buffer): void {
    this.tx.extraPayload = extraPayload;
  }

  static fromTransaction(
    tx: DashTransaction,
    network?: NativeNetwork,
    prevOutput?: TxOutput[],
  ): DashTransactionBuilder {
    const txb = new DashTransactionBuilder(
      tx.network,
      UtxoTransactionBuilder.fromTransaction(tx, network, prevOutput),
    );
    txb.setType(tx.type);
    txb.setExtraPayload(tx.extraPayload);
    return txb;
  }
}
