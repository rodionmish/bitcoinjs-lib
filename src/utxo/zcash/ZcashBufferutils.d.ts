/**
 * Transaction (de)serialization helpers.
 * Only supports full transparent transactions without shielded inputs or outputs.
 *
 * References:
 * - https://github.com/zcash/zcash/blob/v4.5.1/src/primitives/transaction.h#L771
 */
/// <reference types="node" />
import { TxInput, TxOutput } from '../..';
import { BufferReader, BufferWriter } from '../../bufferutils';
import { ZcashTransaction } from './ZcashTransaction';
export declare const VALUE_INT64_ZERO: Buffer;
export declare function readInputs(bufferReader: BufferReader): TxInput[];
export declare function readOutputs(bufferReader: BufferReader): TxOutput[];
export declare function readEmptyVector(bufferReader: BufferReader): void;
export declare function readEmptyOrchardBundle(bufferReader: BufferReader): void;
export declare function writeEmptyOrchardBundle(bufferWriter: BufferWriter): void;
export declare function readEmptySaplingBundle(bufferReader: BufferReader): void;
export declare function writeEmptySamplingBundle(bufferWriter: BufferWriter): void;
export declare function fromBufferV4(bufferReader: BufferReader, tx: ZcashTransaction): void;
export declare function fromBufferV5(bufferReader: BufferReader, tx: ZcashTransaction): void;
export declare function writeInputs(bufferWriter: BufferWriter, ins: TxInput[]): void;
export declare function writeOutputs(bufferWriter: BufferWriter, outs: TxOutput[]): void;
export declare function toBufferV4(bufferWriter: BufferWriter, tx: ZcashTransaction): void;
export declare function toBufferV5(bufferWriter: BufferWriter, tx: ZcashTransaction): void;
