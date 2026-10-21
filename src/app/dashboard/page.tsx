'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  getAccountStatus,
  getBalance,
  getStellarNetworkStatus,
  getAccountTransactions,
} from '@/store/slices/accountSlice';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChatLayout } from '@/components/layout/ChatLayout';
import TransactionTable from '@/components/dashboard/TransactionTable';
import DeploymentStepper from '@/components/deployment/DeploymentStepper';
import { useDeploymentProgress } from '@/hooks/useDeploymentProgress';
import LiquidityPoolStats from '@/components/widgets/LiquidityPoolStats';
import {
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wallet,
  Zap,
  Activity,
  Droplets,
  ExternalLink,
  Circle,
  MessageSquare,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatAddress, formatTokenAmount } from '@/utils/format';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { status, balance, isLoading, network, transactions } = useAppSelector((state) => state.account);
  const { messages } = useAppSelector((state) => state.chat);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeploymentStepper, setShowDeploymentStepper] = useState(false);

  const { progress, startDeployment, completeDeployment, moveToNextStep } = useDeploymentProgress();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    dispatch(getAccountStatus());
    dispatch(getBalance());
    dispatch(getStellarNetworkStatus());
  }, [dispatch, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }
    dispatch(getAccountTransactions({ userId: user.id, page: currentPage, limit: pageSize }));
  }, [dispatch, isAuthenticated, user?.id, currentPage, pageSize]);

  useEffect(() => {
    if (transactions.transactions.length > 0) {
      setTotalCount(transactions.transactions.length);
    }
  }, [transactions.transactions]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleRefreshAll = () => {
    dispatch(getAccountStatus());
    dispatch(getBalance());
    dispatch(getStellarNetworkStatus());
    if (user?.id) {
      dispatch(getAccountTransactions({ userId: user.id, page: currentPage, limit: pageSize }));
    }
    toast.success('Dashboard refreshed');
  };

  const quickActions = [
    {
      title: 'Deploy Account',
      description: 'Deploy your Stellar smart contract account',
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      action: () => setShowDeploymentStepper(true),
    },
    {
      title: 'View Transactions',
      description: 'Check your full on-chain transaction history',
      icon: <Activity className="h-5 w-5 text-blue-400" />,
      action: () => router.push('/transactions'),
    },
    {
      title: 'Manage Contacts',
      description: 'Add and organize payment recipient addresses',
      icon: <Users className="h-5 w-5 text-purple-400" />,
      action: () => router.push('/contacts'),
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-400" />
          <p className="mt-4 text-sm text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatLayout>
      <div className="relative h-full overflow-auto bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">
                Overview of your Stellar wallet account, network status, and recent activity.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isLoading}
                className="text-gray-300 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Account Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wallet Balance */}
            <Card className="bg-gray-900/60 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">Available Balance</span>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {balance ? `${formatTokenAmount(balance.nativeBalance || balance.balance || '0')} XLM` : '0 XLM'}
              </div>
              <p className="text-xs text-gray-500">
                {status?.publicKey ? formatAddress(status.publicKey) : 'Wallet active'}
              </p>
            </Card>

            {/* Account Status / Deployment */}
            <Card className="bg-gray-900/60 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">Account State</span>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status?.isDeployed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : status?.isFunded
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {status?.isDeployed ? 'Deployed & Ready' : status?.isFunded ? 'Funded (Undeployed)' : 'Pending Funding'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Stellar Smart Contract Account
              </p>
            </Card>

            {/* Network Health */}
            <Card className="bg-gray-900/60 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">Stellar Network</span>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    network.status === 'healthy'
                      ? 'bg-green-400'
                      : network.status === 'degraded'
                        ? 'bg-yellow-400'
                        : 'bg-gray-500'
                  }`}
                />
                <span className="text-lg font-bold capitalize text-white">
                  {network.status || 'Checking...'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {network.latestLedger ? `Latest Ledger #${network.latestLedger}` : 'Connecting to Horizon...'}
              </p>
            </Card>
          </div>

          {/* Account Setup Progress (Step 1, 2, 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Created */}
            <Card
              className={`p-5 border-2 transition-all ${
                status?.publicKey ? 'border-green-500/40 bg-green-500/5' : 'border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/20 rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-green-400">1. Account Created</h3>
                </div>
                {status?.publicKey && (
                  <button
                    onClick={() => copyToClipboard(status.publicKey, 'Public Key')}
                    className="text-gray-400 hover:text-white text-xs flex items-center gap-1"
                    title="Copy address"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {status?.publicKey ? formatAddress(status.publicKey) : 'Generating address...'}
              </p>
            </Card>

            {/* Step 2: Funded */}
            <Card
              className={`p-5 border-2 transition-all ${
                status?.isFunded ? 'border-green-500/40 bg-green-500/5' : 'border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${status?.isFunded ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                    {status?.isFunded ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <h3 className={`font-semibold text-sm ${status?.isFunded ? 'text-green-400' : 'text-gray-400'}`}>
                    2. Funded with XLM
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {status?.isFunded ? 'Account funded and activated on Stellar ledger.' : 'Awaiting initial fund deposit.'}
              </p>
            </Card>

            {/* Step 3: Deployed */}
            <Card
              className={`p-5 border-2 transition-all ${
                status?.isDeployed
                  ? 'border-green-500/40 bg-green-500/5'
                  : status?.isFunded
                    ? 'border-yellow-500/40 bg-yellow-500/5'
                    : 'border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      status?.isDeployed
                        ? 'bg-green-500/20'
                        : status?.isFunded
                          ? 'bg-yellow-500/20'
                          : 'bg-gray-800'
                    }`}
                  >
                    {status?.isDeployed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : status?.isFunded ? (
                      <Zap className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <h3
                    className={`font-semibold text-sm ${
                      status?.isDeployed
                        ? 'text-green-400'
                        : status?.isFunded
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                    }`}
                  >
                    3. Smart Contract Deployed
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {status?.isDeployed
                  ? 'Account is live and DeFi/Soroban-ready.'
                  : status?.isFunded
                    ? 'Ready for smart account contract deployment.'
                    : 'Requires funding before deployment.'}
              </p>
            </Card>
          </div>

          {/* Account Deployment Progress Stepper */}
          {showDeploymentStepper && (
            <Card className="p-6 bg-gray-900 border-gray-800">
              <DeploymentStepper progress={progress} />
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-800">
                <Button variant="ghost" onClick={() => setShowDeploymentStepper(false)}>
                  Close
                </Button>
                {!progress.isComplete && !progress.hasError && (
                  <Button
                    onClick={() => {
                      startDeployment();
                      setTimeout(() => moveToNextStep(), 2000);
                      setTimeout(() => moveToNextStep(), 4000);
                      setTimeout(() => moveToNextStep(), 6000);
                      setTimeout(() => completeDeployment(), 8000);
                    }}
                  >
                    Start Deployment
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="bg-gray-900/50 border-gray-800 p-5 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-800 rounded-xl">{action.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{action.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 mb-4">{action.description}</p>
                      <Button variant="ghost" size="sm" onClick={action.action} className="text-xs">
                        Open
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Liquidity Pool Statistics Widget */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-400" />
                Liquidity Pool Statistics
              </h2>
            </div>
            <LiquidityPoolStats />
          </div>

          {/* Transaction History Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Recent Transactions
              </h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>
                View Full History
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <TransactionTable
              transactions={transactions.transactions}
              isLoading={transactions.isLoading}
              error={transactions.error}
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount || transactions.transactions.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>

          {/* Recent Chat Activity */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Recent Agent Activity
            </h2>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              {messages.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    You have <span className="font-bold text-white">{messages.length}</span> recorded chat message{messages.length !== 1 ? 's' : ''} in your session.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/chat')} className="mt-2 text-xs">
                    Continue conversation
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No active chat sessions. Start a query with ChenPilot in the chat workspace.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
