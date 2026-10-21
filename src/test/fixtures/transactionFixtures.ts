import { StellarTransaction, StellarOperation, StellarOperationType } from '@/types';

/**
 * Reusable Stellar operation fixtures covering all supported variants
 * as well as unknown / custom operation types for regression testing.
 */

export const mockPaymentOperation: StellarOperation = {
  id: 'op-payment-1',
  type: 'payment',
  amount: '150.50',
  asset: 'XLM',
  from: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  to: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockUsdcPaymentOperation: StellarOperation = {
  id: 'op-payment-2',
  type: 'payment',
  amount: '500.00',
  asset: 'USDC',
  from: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  to: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockCreateAccountOperation: StellarOperation = {
  id: 'op-create-account-1',
  type: 'create_account',
  starting_balance: '10.00',
  amount: '10.00',
  asset: 'XLM',
  from: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  to: 'GCPNYDCO6N5W67TWW5O3E25UHQH3R33V747E24U5X2R2O5Y2X2O5Y2X2',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockChangeTrustOperation: StellarOperation = {
  id: 'op-change-trust-1',
  type: 'change_trust',
  asset: 'USDC',
  limit: '1000000',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  trustee: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
};

export const mockTrustLegacyOperation: StellarOperation = {
  id: 'op-trust-legacy-1',
  type: 'trust',
  asset: 'EURC',
  limit: '500000',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockAllowTrustOperation: StellarOperation = {
  id: 'op-allow-trust-1',
  type: 'allow_trust',
  asset: 'USDC',
  source_account: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  trustor: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockAccountMergeOperation: StellarOperation = {
  id: 'op-account-merge-1',
  type: 'account_merge',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  to: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
};

export const mockManageOfferOperation: StellarOperation = {
  id: 'op-manage-offer-1',
  type: 'manage_offer',
  amount: '250.00',
  asset: 'XLM',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockSorobanOperation: StellarOperation = {
  id: 'op-soroban-1',
  type: 'invoke_host_function',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockExtSorobanOperation: StellarOperation = {
  id: 'op-ext-soroban-1',
  type: 'ext_soroban_op',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockUnknownOperation: StellarOperation = {
  id: 'op-unknown-1',
  type: 'claim_claimable_balance' as StellarOperationType,
  amount: '75.25',
  asset: 'XLM',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

export const mockArbitraryCustomOperation: StellarOperation = {
  id: 'op-custom-arbitrary-1',
  type: 'future_liquidity_stake' as StellarOperationType,
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
};

/**
 * Reusable Stellar transaction fixtures
 */

export const mockPaymentTransaction: StellarTransaction = {
  id: 'tx-payment-001',
  hash: 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
  ledger: 5432101,
  created_at: '2026-10-21T08:00:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 1,
  successful: true,
  operations: [mockPaymentOperation],
};

export const mockCreateAccountTransaction: StellarTransaction = {
  id: 'tx-create-account-002',
  hash: 'b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012b2c3d4e5f6789012',
  ledger: 5432102,
  created_at: '2026-10-21T08:05:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 1,
  successful: true,
  operations: [mockCreateAccountOperation],
};

export const mockTrustTransaction: StellarTransaction = {
  id: 'tx-trust-003',
  hash: 'c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234c3d4e5f678901234',
  ledger: 5432103,
  created_at: '2026-10-21T08:10:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 1,
  successful: true,
  operations: [mockChangeTrustOperation],
};

export const mockAllowTrustTransaction: StellarTransaction = {
  id: 'tx-allow-trust-004',
  hash: 'd4e5f67890123456d4e5f67890123456d4e5f67890123456d4e5f67890123456',
  ledger: 5432104,
  created_at: '2026-10-21T08:15:00Z',
  source_account: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  fee_charged: '100',
  operation_count: 1,
  successful: true,
  operations: [mockAllowTrustOperation],
};

export const mockAccountMergeTransaction: StellarTransaction = {
  id: 'tx-account-merge-005',
  hash: 'e5f6789012345678e5f6789012345678e5f6789012345678e5f6789012345678',
  ledger: 5432105,
  created_at: '2026-10-21T08:20:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 1,
  successful: true,
  operations: [mockAccountMergeOperation],
};

export const mockSorobanTransaction: StellarTransaction = {
  id: 'tx-soroban-006',
  hash: 'f678901234567890f678901234567890f678901234567890f678901234567890',
  ledger: 5432106,
  created_at: '2026-10-21T08:25:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '250',
  operation_count: 1,
  successful: true,
  operations: [mockSorobanOperation],
};

export const mockUnknownOpTransaction: StellarTransaction = {
  id: 'tx-unknown-007',
  hash: '7890123456789012789012345678901278901234567890127890123456789012',
  ledger: 5432107,
  created_at: '2026-10-21T08:30:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 1,
  successful: true,
  operations: [mockUnknownOperation],
};

export const mockArbitraryCustomTransaction: StellarTransaction = {
  id: 'tx-custom-008',
  hash: '8901234567890123890123456789012389012345678901238901234567890123',
  ledger: 5432108,
  created_at: '2026-10-21T08:35:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 1,
  successful: true,
  operations: [mockArbitraryCustomOperation],
};

export const mockMixedMultiOpTransaction: StellarTransaction = {
  id: 'tx-multi-009',
  hash: '9012345678901234901234567890123490123456789012349012345678901234',
  ledger: 5432109,
  created_at: '2026-10-21T08:40:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '300',
  operation_count: 3,
  successful: true,
  operations: [mockCreateAccountOperation, mockChangeTrustOperation, mockPaymentOperation],
};

export const mockEmptyOpsTransaction: StellarTransaction = {
  id: 'tx-empty-010',
  hash: '0123456789012345012345678901234501234567890123450123456789012345',
  ledger: 5432110,
  created_at: '2026-10-21T08:45:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 0,
  successful: true,
  operations: [],
};

export const mockFailedTransaction: StellarTransaction = {
  id: 'tx-failed-011',
  hash: '1234567890123456123456789012345612345678901234561234567890123456',
  ledger: 5432111,
  created_at: '2026-10-21T08:50:00Z',
  source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
  fee_charged: '100',
  operation_count: 1,
  successful: false,
  operations: [mockPaymentOperation],
};

/**
 * Reusable full mixed list of transactions containing all supported & unknown variants
 */
export const mockMixedTransactionsList: StellarTransaction[] = [
  mockPaymentTransaction,
  mockCreateAccountTransaction,
  mockTrustTransaction,
  mockAllowTrustTransaction,
  mockAccountMergeTransaction,
  mockSorobanTransaction,
  mockUnknownOpTransaction,
  mockArbitraryCustomTransaction,
  mockMixedMultiOpTransaction,
  mockEmptyOpsTransaction,
  mockFailedTransaction,
];

/**
 * Factory helper for creating custom mock transactions with overrides
 */
export function createMockTransaction(overrides?: Partial<StellarTransaction>): StellarTransaction {
  return {
    id: `tx-mock-${Date.now()}`,
    hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    ledger: 5000000,
    created_at: '2026-10-21T00:00:00Z',
    source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
    fee_charged: '100',
    operation_count: 1,
    successful: true,
    operations: [
      {
        id: 'op-default-1',
        type: 'payment',
        amount: '10.0',
        asset: 'XLM',
        source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
      },
    ],
    ...overrides,
  };
}

/**
 * Factory helper for creating custom mock operations with overrides
 */
export function createMockOperation(overrides?: Partial<StellarOperation>): StellarOperation {
  return {
    id: `op-mock-${Date.now()}`,
    type: 'payment',
    amount: '10.0',
    asset: 'XLM',
    source_account: 'GBXKQ73U6I3Y2K5Z4W3V2U1T0S9R8Q7P6O5N4M3L2K1J0I9H8G7F6E5D4C3B2A1',
    ...overrides,
  };
}
