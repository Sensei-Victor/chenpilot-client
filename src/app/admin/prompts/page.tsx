'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatLayout } from '@/components/layout/ChatLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import apiService from '@/services/api';
import { useAppSelector } from '@/store';
import { PromptVersion, PromptVersionRecord } from '@/types';
import { Loader2, RefreshCw, ShieldAlert, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_TEST_INPUT = 'Help a user move idle USDC into the highest-yield low-risk strategy.';
const DEFAULT_VARIABLES = JSON.stringify(
  {
    agentName: 'ChenPilot',
    userName: 'Ada',
    network: 'mainnet',
    riskLevel: 'low',
    tone: 'clear and confident',
  },
  null,
  2
);

function isRecord(value: unknown): value is PromptVersionRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function getBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function extractVersionRecords(payload: unknown): PromptVersionRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }
  if (!isRecord(payload)) {
    return [];
  }
  const directCollections = [payload.versions, payload.data, payload.items, payload.results];
  for (const candidate of directCollections) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isRecord);
    }
  }
  return [];
}

function getTemplate(record: PromptVersionRecord): string {
  return (
    getString(record.template) ??
    getString(record.prompt) ??
    getString(record.systemPrompt) ??
    getString(record.content) ??
    getString(record.body) ??
    getString(record.text) ??
    ''
  );
}

function getLabel(record: PromptVersionRecord, fallbackIndex: number): string {
  return (
    getString(record.name) ??
    getString(record.title) ??
    getString(record.label) ??
    getString(record.version) ??
    `Template ${fallbackIndex + 1}`
  );
}

function normalizeVersion(record: PromptVersionRecord, index: number): PromptVersion {
  const id =
    getString(record.id) ?? getString(record._id) ?? getString(record.uuid) ?? `version-${index + 1}`;
  const rawTags = getArray(record.tags);
  const tags = rawTags.map((tag) => (typeof tag === 'string' ? tag.trim() : '')).filter(Boolean);
  const activeFlag =
    getBoolean(record.isActive) ??
    getBoolean(record.active) ??
    getBoolean(record.is_active) ??
    getString(record.status)?.toLowerCase() === 'active';

  return {
    id,
    label: getLabel(record, index),
    description:
      getString(record.description) ??
      getString(record.summary) ??
      getString(record.notes) ??
      'No description provided for this prompt version.',
    template: getTemplate(record),
    version: getString(record.version) ?? id,
    isActive: Boolean(activeFlag),
    createdAt:
      getString(record.createdAt) ?? getString(record.created_at) ?? getString(record.insertedAt) ?? null,
    updatedAt:
      getString(record.updatedAt) ?? getString(record.updated_at) ?? getString(record.modifiedAt) ?? null,
    tags,
    raw: record,
  };
}

export default function PromptsAdminPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVersions = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      setError(null);
      const response = await apiService.getPromptVersions();
      const normalized = extractVersionRecords(response).map(normalizeVersion);
      setVersions(normalized);
      setSelectedId((curr) => curr || normalized.find((v) => v.isActive)?.id || normalized[0]?.id || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load prompt versions.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadVersions();
  }, [isAuthenticated, router]);

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === selectedId) || versions[0] || null,
    [selectedId, versions]
  );

  const handleActivate = async () => {
    if (!selectedVersion || selectedVersion.isActive) return;
    setIsActivating(true);
    try {
      await apiService.activatePromptVersion(selectedVersion.id);
      setVersions((prev) =>
        prev.map((v) => ({ ...v, isActive: v.id === selectedVersion.id }))
      );
      toast.success(`${selectedVersion.label} is now active`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to activate version.';
      toast.error(msg);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <ChatLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prompt Version Control</h1>
            <p className="text-sm text-gray-400">Manage, test, and activate agent prompt versions.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadVersions(true)}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-3 text-gray-400">Loading prompt versions...</span>
          </div>
        ) : versions.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-400">No prompt versions available.</div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              {versions.map((ver) => (
                <Card
                  key={ver.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    ver.id === selectedId ? 'border-blue-500 bg-blue-500/5' : 'hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedId(ver.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{ver.label}</h3>
                    {ver.isActive && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ver.description}</p>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2 space-y-4">
              {selectedVersion && (
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{selectedVersion.label}</h2>
                      <p className="text-xs text-gray-400">{selectedVersion.description}</p>
                    </div>
                    {!selectedVersion.isActive && (
                      <Button
                        size="sm"
                        onClick={handleActivate}
                        disabled={isActivating}
                      >
                        {isActivating ? 'Activating...' : 'Set as Active'}
                      </Button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Prompt Template
                    </h4>
                    <pre className="p-4 bg-gray-900 rounded-lg text-xs font-mono text-gray-200 overflow-x-auto whitespace-pre-wrap">
                      {selectedVersion.template || '(Empty template)'}
                    </pre>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </ChatLayout>
  );
}
