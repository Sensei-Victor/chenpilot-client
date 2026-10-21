import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionTable from './TransactionTable';
import {
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
  mockMixedTransactionsList,
  createMockTransaction,
} from '@/test/fixtures/transactionFixtures';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TransactionTable (#245)', () => {
  const defaultProps = {
    transactions: mockMixedTransactionsList,
    isLoading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalCount: mockMixedTransactionsList.length,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  describe('Empty and Loading States', () => {
    it('renders empty state when there are no transactions', () => {
      render(<TransactionTable {...defaultProps} transactions={[]} totalCount={0} />);
      expect(screen.getByText('No transactions found')).toBeInTheDocument();
      expect(
        screen.getByText('Your on-chain transaction history will appear here')
      ).toBeInTheDocument();
    });

    it('renders loading spinner when isLoading is true and transactions are empty', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[]}
          totalCount={0}
          isLoading={true}
        />
      );
      expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
    });

    it('renders error message when error is provided', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[]}
          error="Network error fetching transactions"
        />
      );
      expect(screen.getByText('Network error fetching transactions')).toBeInTheDocument();
    });
  });

  describe('Operation Type Variants Rendering', () => {
    it('renders payment transaction with correct type label and amount', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockPaymentTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('150.50 XLM')).toBeInTheDocument();
      expect(screen.getByText('1 op')).toBeInTheDocument();
    });

    it('renders account creation transaction with starting balance', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockCreateAccountTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('10.00 XLM')).toBeInTheDocument();
    });

    it('renders change_trust transaction with limit and asset details', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockTrustTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Change Trust')).toBeInTheDocument();
      expect(screen.getByText('Limit: 1,000,000.00 USDC')).toBeInTheDocument();
    });

    it('renders allow_trust transaction type correctly', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockAllowTrustTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Allow Trust')).toBeInTheDocument();
    });

    it('renders account_merge transaction type correctly', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockAccountMergeTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Account Merge')).toBeInTheDocument();
    });

    it('renders soroban host function transaction correctly', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockSorobanTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Invoke Host Function')).toBeInTheDocument();
    });

    it('renders mixed multi-operation transaction and displays correct op count', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockMixedMultiOpTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('3 ops')).toBeInTheDocument();
      // Primary op is create_account
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  describe('Unknown and Edge Case Operation Types (Acceptance Criteria)', () => {
    it('gracefully renders unknown operation types without crashing', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockUnknownOpTransaction]}
          totalCount={1}
        />
      );
      // 'claim_claimable_balance' should be rendered in title case as 'Claim Claimable Balance'
      expect(screen.getByText('Claim Claimable Balance')).toBeInTheDocument();
      expect(screen.getByText('75.25 XLM')).toBeInTheDocument();
    });

    it('renders arbitrary custom operation types formatted cleanly', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockArbitraryCustomTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Future Liquidity Stake')).toBeInTheDocument();
    });

    it('renders transactions with empty operations as "Unknown" without crashing', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockEmptyOpsTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('0 ops')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders transactions with undefined operations gracefully', () => {
      const txWithoutOps = createMockTransaction({
        operations: undefined as any,
        operation_count: 0,
      });
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[txWithoutOps]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Status, Links, and Clipboard Actions', () => {
    it('displays Success status badge for successful transactions', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockPaymentTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('displays Failed status badge for failed transactions', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockFailedTransaction]}
          totalCount={1}
        />
      );
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('provides external link to stellar.expert with transaction hash', () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockPaymentTransaction]}
          totalCount={1}
        />
      );
      const link = screen.getByRole('link', { name: /view/i });
      expect(link).toHaveAttribute(
        'href',
        `https://stellar.expert/explorer/public/tx/${mockPaymentTransaction.hash}`
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('copies transaction hash to clipboard on hash button click', async () => {
      render(
        <TransactionTable
          {...defaultProps}
          transactions={[mockPaymentTransaction]}
          totalCount={1}
        />
      );
      const hashButton = screen.getByTitle(mockPaymentTransaction.hash);
      fireEvent.click(hashButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockPaymentTransaction.hash
      );
    });
  });

  describe('Pagination Controls', () => {
    it('displays correct item counts in pagination summary', () => {
      render(<TransactionTable {...defaultProps} totalCount={25} pageSize={10} currentPage={2} />);
      expect(screen.getByText(/Showing 11 to 20 of 25 transactions/i)).toBeInTheDocument();
    });

    it('invokes onPageChange when clicking next and prev buttons', () => {
      const onPageChange = vi.fn();
      render(
        <TransactionTable
          {...defaultProps}
          totalCount={30}
          pageSize={10}
          currentPage={2}
          onPageChange={onPageChange}
        />
      );

      // Previous button (page 1)
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find((btn) => btn.querySelector('svg.lucide-chevron-left'));
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(onPageChange).toHaveBeenCalledWith(1);
      }

      // Next button (page 3)
      const nextButton = buttons.find((btn) => btn.querySelector('svg.lucide-chevron-right'));
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(onPageChange).toHaveBeenCalledWith(3);
      }
    });

    it('invokes onPageSizeChange when changing page size select', () => {
      const onPageSizeChange = vi.fn();
      render(
        <TransactionTable
          {...defaultProps}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '25' } });
      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });
  });
});
