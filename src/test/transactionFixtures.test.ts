import { describe, it, expect } from 'vitest';
import {
  mockPaymentTransaction,
  mockCreateAccountTransaction,
  mockTrustTransaction,
  mockAllowTrustTransaction,
  mockAccountMergeTransaction,
  mockSorobanTransaction,
  mockUnknownOpTransaction,
  mockMixedMultiOpTransaction,
  mockEmptyOpsTransaction,
  mockFailedTransaction,
  mockMixedTransactionsList,
  createMockTransaction,
  createMockOperation,
} from '@/test/fixtures/transactionFixtures';

describe('Transaction Fixtures Coverage (#245)', () => {
  it('covers all major transaction operation types in mixed list', () => {
    expect(mockMixedTransactionsList.length).toBeGreaterThanOrEqual(10);

    const operationTypes = mockMixedTransactionsList.flatMap((tx) =>
      tx.operations.map((op) => op.type)
    );

    expect(operationTypes).toContain('payment');
    expect(operationTypes).toContain('create_account');
    expect(operationTypes).toContain('change_trust');
    expect(operationTypes).toContain('allow_trust');
    expect(operationTypes).toContain('account_merge');
    expect(operationTypes).toContain('invoke_host_function');
    expect(operationTypes).toContain('claim_claimable_balance');
  });

  it('provides deterministic payment fixture data', () => {
    expect(mockPaymentTransaction.operations[0].type).toBe('payment');
    expect(mockPaymentTransaction.operations[0].amount).toBe('150.50');
    expect(mockPaymentTransaction.operations[0].asset).toBe('XLM');
    expect(mockPaymentTransaction.successful).toBe(true);
  });

  it('provides deterministic account creation fixture data', () => {
    expect(mockCreateAccountTransaction.operations[0].type).toBe('create_account');
    expect(mockCreateAccountTransaction.operations[0].starting_balance).toBe('10.00');
  });

  it('provides deterministic trustline change fixture data', () => {
    expect(mockTrustTransaction.operations[0].type).toBe('change_trust');
    expect(mockTrustTransaction.operations[0].asset).toBe('USDC');
    expect(mockTrustTransaction.operations[0].limit).toBe('1000000');
  });

  it('supports unknown and arbitrary custom operation types for regression testing', () => {
    expect(mockUnknownOpTransaction.operations[0].type).toBe('claim_claimable_balance');
    expect(mockUnknownOpTransaction.operations[0].amount).toBe('75.25');
  });

  it('supports multi-operation mixed transactions', () => {
    expect(mockMixedMultiOpTransaction.operations.length).toBe(3);
    expect(mockMixedMultiOpTransaction.operation_count).toBe(3);
  });

  it('supports empty operations edge case', () => {
    expect(mockEmptyOpsTransaction.operations).toHaveLength(0);
    expect(mockEmptyOpsTransaction.operation_count).toBe(0);
  });

  it('supports failed transaction representation', () => {
    expect(mockFailedTransaction.successful).toBe(false);
  });

  it('allows factory helper to create custom transactions with overrides', () => {
    const customTx = createMockTransaction({
      ledger: 9999999,
      successful: false,
    });
    expect(customTx.ledger).toBe(9999999);
    expect(customTx.successful).toBe(false);
    expect(customTx.operations).toHaveLength(1);
  });

  it('allows factory helper to create custom operations with overrides', () => {
    const customOp = createMockOperation({
      type: 'custom_soroban_contract_call',
      amount: '42.0',
    });
    expect(customOp.type).toBe('custom_soroban_contract_call');
    expect(customOp.amount).toBe('42.0');
  });
});
