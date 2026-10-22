        operations: [
          {
            id: 'op-out',
            type: 'payment',
            amount: '45.5',
            asset: 'USDC',
            from: activeUser,
            to: otherUser,
            source_account: activeUser,
          },
        ],
      },
      {
        id: 'tx-self',
        hash: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        ledger: 503,
        created_at: '2026-10-20T12:10:00Z',
        source_account: activeUser,
        fee_charged: '100',
        operation_count: 1,
        successful: true,
        operations: [
          {
            id: 'op-self',
            type: 'payment',
            amount: '20',
            asset: 'XLM',
            from: activeUser,
            to: activeUser,
            source_account: activeUser,
          },
        ],
      },
      {
        id: 'tx-unknown',
        hash: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        ledger: 504,
        created_at: '2026-10-20T12:15:00Z',
        source_account: activeUser,
        fee_charged: '100',
        operation_count: 1,
        successful: true,
        operations: [
          {
            id: 'op-unknown',
            type: 'change_trust',
            source_account: activeUser,
          },
        ],
      },
    ];

    it('renders directional badges and formatted amounts consistently', () => {
      render(
        <TransactionTable
          transactions={mockTxs}
          isLoading={false}
          error={null}
          currentPage={1}
          pageSize={10}
          totalCount={4}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          activeAccountAddress={activeUser}
        />
      );

      // Check Direction column header
      expect(screen.getByText('Direction')).toBeDefined();

      // Check Incoming row
      const inDirection = screen.getByTestId('tx-direction-tx-incoming');
      expect(inDirection.textContent?.toLowerCase()).toBe('incoming');
      const inAmount = screen.getByTestId('tx-amount-tx-incoming');
      expect(inAmount.textContent).toBe('+100.0000000 XLM');

      // Check Outgoing row
      const outDirection = screen.getByTestId('tx-direction-tx-outgoing');
      expect(outDirection.textContent?.toLowerCase()).toBe('outgoing');
      const outAmount = screen.getByTestId('tx-amount-tx-outgoing');
      expect(outAmount.textContent).toBe('-45.5000000 USDC');

      // Check Self row
      const selfDirection = screen.getByTestId('tx-direction-tx-self');
      expect(selfDirection.textContent?.toLowerCase()).toBe('self-transfer');
      const selfAmount = screen.getByTestId('tx-amount-tx-self');
      expect(selfAmount.textContent).toBe('20.0000000 XLM');

      // Check Unknown / missing op accounts row
      const unkDirection = screen.getByTestId('tx-direction-tx-unknown');
      expect(unkDirection.textContent?.toLowerCase()).toBe('unknown');
      const unkAmount = screen.getByTestId('tx-amount-tx-unknown');
      expect(unkAmount.textContent).toBe('-');
    });

    it('renders empty state when there are no transactions', () => {
      render(
        <TransactionTable
          transactions={[]}
          isLoading={false}
          error={null}
          currentPage={1}
          pageSize={10}
          totalCount={0}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          activeAccountAddress={activeUser}
        />
      );

      expect(screen.getByText('No transactions found')).toBeDefined();
    });

    it('renders error message when error is provided', () => {
      render(
        <TransactionTable
          transactions={[]}
          isLoading={false}
          error="Network error fetching transactions"
          currentPage={1}
          pageSize={10}
          totalCount={0}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          activeAccountAddress={activeUser}
        />
      );
