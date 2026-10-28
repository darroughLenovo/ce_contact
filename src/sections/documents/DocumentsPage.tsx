import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, FileText, Filter, LayoutGrid, List, Plus, Search, Sparkles, Upload } from 'lucide-react';
import {
  Button,
  ContentSwitcher,
  HorizontalTabItem,
  HorizontalTabs,
  HorizontalTabsList,
  MenuItem,
  Pagination,
  RowsPerPage,
  TextInput,
} from '@cake-admin/cakeand';
import { AccountHeader } from '../../shell/AccountHeader';
import { navigate } from '../../shell/router';
import { useToast } from '../../shell/toast';
import { ActionMenu, ChoiceMenu } from './ActionMenu';
import { CURRENT_USER, SEED_DOCS, thumbFor, type Doc } from './data';
import { ConfirmModal, ShareModal, UploadModal, type ConfirmState, type UploadResult } from './DocumentModals';
import { DocumentGrid, DocumentTable, type DocHandlers } from './DocumentViews';
import { CATEGORIES, type CategoryId } from './naming';
import './documents.css';

type Tab = 'active' | 'archived';
type View = 'grid' | 'list';
type Sort = 'az' | 'za' | 'newest' | 'oldest';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'az', label: 'Sort by A-Z' },
  { value: 'za', label: 'Sort by Z-A' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

type ToastMsg = {
  status: 'success' | 'info' | 'error';
  title: string;
  description?: string;
  undo?: () => void;
};

/** Deep-link the Figma variants: #/documents?tab=archived&view=list&modal=archive|share|upload */
const hashParams = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '');

export default function DocumentsPage() {
  const [q] = useState(hashParams);
  const [docs, setDocs] = useState<Doc[]>(SEED_DOCS);
  const [tab, setTab] = useState<Tab>(q.get('tab') === 'archived' ? 'archived' : 'active');
  const [view, setView] = useState<View>(q.get('view') === 'list' ? 'list' : 'grid');
  const [sort, setSort] = useState<Sort>('az');
  const [filters, setFilters] = useState<CategoryId[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [renamingId, setRenamingId] = useState<string | undefined>(q.get('rename') ? SEED_DOCS[2].id : undefined);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [sharing, setSharing] = useState<Doc | null>(null);
  const [uploading, setUploading] = useState(q.get('modal') === 'upload');
  const [focusId, setFocusId] = useState<string>();

  const showToast = useToast();
  const toast = ({ undo, ...t }: ToastMsg) =>
    showToast({ ...t, ...(undo ? { actionLabel: 'Undo', onAction: undo, duration: 8000 } : {}) });

  const active = docs.filter((d) => !d.archived);
  const archived = docs.filter((d) => d.archived);
  const allNames = docs.map((d) => d.name);

  const visible = useMemo(() => {
    const pool = docs.filter((d) => (tab === 'archived' ? !!d.archived : !d.archived));
    const s = search.trim().toLowerCase();
    const when = (d: Doc) => (d.archived ? d.archived.on : d.modifiedOn).getTime();
    return pool
      .filter((d) => (!filters.length || filters.includes(d.category)) && (!s || d.name.toLowerCase().includes(s)))
      .sort((a, b) => {
        switch (sort) {
          case 'az':
            return a.name.localeCompare(b.name);
          case 'za':
            return b.name.localeCompare(a.name);
          case 'newest':
            return when(b) - when(a);
          case 'oldest':
            return when(a) - when(b);
        }
      });
  }, [docs, tab, search, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageDocs = visible.slice((current - 1) * pageSize, current * pageSize);

  // After an upload, jump to the page holding the new document.
  useEffect(() => {
    if (!focusId) return;
    const i = visible.findIndex((d) => d.id === focusId);
    if (i >= 0) setPage(Math.floor(i / pageSize) + 1);
    setFocusId(undefined);
  }, [focusId, visible, pageSize]);

  const resetPaging = () => setPage(1);
  const update = (id: string, patch: Partial<Doc>) => setDocs((all) => all.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const h: DocHandlers = {
    onOpen: (d) => {
      if (d.category === 'customer-brief') return navigate('customer-brief');
      if (d.category === 'executive-brief') return navigate('executive-brief');
      toast({ status: 'info', title: 'Opening preview', description: d.name });
    },
    onDownload: (d) => toast({ status: 'success', title: 'Download started', description: d.name }),
    onShare: (d) => setSharing(d),
    onRenameStart: (d) => setRenamingId(d.id),
    onRenameCancel: () => setRenamingId(undefined),
    onRenameSave: (d, name) => {
      update(d.id, { name, modifiedBy: CURRENT_USER, modifiedOn: new Date() });
      setRenamingId(undefined);
      toast({ status: 'success', title: 'Document renamed', description: name });
    },
    onArchive: (d) =>
      setConfirm({
        title: 'Are you sure?',
        description: `Once archived, the ${d.name} will be moved to the Archive tab under Documents.`,
        confirmLabel: 'Archive',
        onConfirm: () => {
          update(d.id, { archived: { by: CURRENT_USER, on: new Date() } });
          toast({ status: 'success', title: 'Document archived', description: d.name, undo: () => update(d.id, { archived: undefined }) });
        },
      }),
    onUnarchive: (d) =>
      setConfirm({
        title: 'Unarchive document?',
        description: `${d.name} will be moved back to Documents.`,
        confirmLabel: 'Unarchive',
        onConfirm: () => {
          update(d.id, { archived: undefined });
          toast({ status: 'success', title: 'Document unarchived', description: d.name, undo: () => update(d.id, { archived: d.archived }) });
        },
      }),
    onDelete: (d) =>
      setConfirm({
        title: 'Delete permanently?',
        description: `${d.name} will be deleted for everyone on this account. This can't be undone.`,
        confirmLabel: 'Delete',
        onConfirm: () => {
          setDocs((all) => all.filter((x) => x.id !== d.id));
          toast({ status: 'success', title: 'Document deleted', description: d.name });
        },
      }),
  };

  // Deep-linked modal states, for review against Figma.
  useEffect(() => {
    const m = q.get('modal');
    if (m === 'share') setSharing(SEED_DOCS[0]);
    if (m === 'archive') h.onArchive(SEED_DOCS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUpload = ({ name, category, version }: UploadResult) => {
    const id = `doc-${Date.now()}`;
    const now = new Date();
    setDocs((all) => [
      ...all,
      { id, name, category, version, modifiedBy: CURRENT_USER, modifiedOn: now, createdBy: CURRENT_USER, thumb: thumbFor(category, version) },
    ]);
    setTab('active');
    setSearch('');
    setFilters([]);
    setFocusId(id);
    toast({ status: 'success', title: 'Document uploaded', description: name });
  };

  const viewProps = { docs: pageDocs, archived: tab === 'archived', renamingId, allNames, ...h };
  const filtered = !!filters.length || !!search.trim();

  return (
    <>
      <AccountHeader active="documents" />
      <div className="ce-page docs-page">
        {/* Top (Figma 10210:2857) */}
        <div className="docs-top">
          <h2 className="docs-title">Documents</h2>
          <div className="docs-top__end">
            <div className="docs-search">
              <TextInput
                size="sm"
                aria-label="Search documents"
                placeholder="Search documents"
                type="search"
                startIcon={<Search />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPaging();
                }}
              />
            </div>
            <ActionMenu
              label="Add document"
              items={[
                { key: 'upload', label: 'Upload from computer', icon: <Upload />, onSelect: () => setUploading(true) },
                { key: 'cb', label: 'Generate Customer Brief', icon: <Sparkles />, onSelect: () => navigate('customer-brief') },
                { key: 'eb', label: 'Generate Executive Brief', icon: <FileText />, onSelect: () => navigate('executive-brief') },
              ]}
              trigger={
                <Button startIcon={<Plus />} endIcon={<ChevronDown />}>
                  Add Document
                </Button>
              }
            />
          </div>
        </div>

        {/* Tabs/Filters (Figma 10210:2864) */}
        <div className="docs-tabs">
          <HorizontalTabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as Tab);
              setRenamingId(undefined);
              resetPaging();
            }}
          >
            <HorizontalTabsList aria-label="Document status">
              <HorizontalTabItem value="active">Documents ({active.length})</HorizontalTabItem>
              <HorizontalTabItem value="archived">Archived ({archived.length})</HorizontalTabItem>
            </HorizontalTabsList>
          </HorizontalTabs>
        </div>

        <div className="docs-toolbar">
          <ChoiceMenu
            label="Filter by category"
            keepOpen
            options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            selected={filters}
            onToggle={(v) => {
              setFilters((f) => (f.includes(v as CategoryId) ? f.filter((x) => x !== v) : [...f, v as CategoryId]));
              resetPaging();
            }}
            footer={
              filters.length ? (
                <MenuItem showLeftSlot={false} showRightSlot={false} onClick={() => setFilters([])}>
                  Clear filters
                </MenuItem>
              ) : null
            }
            trigger={
              <Button size="sm" variant="outline" startIcon={<Filter />} endIcon={<ChevronDown />}>
                Filters ({filters.length})
              </Button>
            }
          />
          <div className="docs-toolbar__end">
            <ChoiceMenu
              label="Sort documents"
              options={SORTS}
              selected={[sort]}
              onToggle={(v) => setSort(v as Sort)}
              trigger={
                <Button size="sm" variant="outline" intent="secondary" endIcon={<ChevronDown />}>
                  {SORTS.find((s) => s.value === sort)!.label}
                </Button>
              }
            />
            <ContentSwitcher
              aria-label="View"
              size="sm"
              iconOnly
              value={view}
              onValueChange={(v) => {
                setView(v as View);
                setRenamingId(undefined);
              }}
              options={[
                { value: 'grid', label: 'Grid view', icon: <LayoutGrid /> },
                { value: 'list', label: 'List view', icon: <List /> },
              ]}
            />
          </div>
        </div>

        {pageDocs.length === 0 ? (
          <div className="docs-empty" role="status">
            <p className="docs-empty__title">
              {filtered ? 'No documents match' : tab === 'archived' ? 'No archived documents' : 'No documents yet'}
            </p>
            <p className="docs-empty__text">
              {filtered
                ? 'Try a different search or clear the filters.'
                : tab === 'archived'
                  ? 'Archived documents appear here.'
                  : 'Upload a document or generate a brief to get started.'}
            </p>
            {filtered ? (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters([]);
                  setSearch('');
                }}
              >
                Clear search and filters
              </Button>
            ) : tab === 'active' ? (
              <Button startIcon={<Upload />} onClick={() => setUploading(true)}>
                Upload document
              </Button>
            ) : null}
          </div>
        ) : view === 'grid' ? (
          <DocumentGrid {...viewProps} />
        ) : (
          <DocumentTable {...viewProps} />
        )}

        {visible.length > 0 && (
          <div className="docs-footer">
            <Pagination count={pageCount} page={current} onPageChange={setPage} maxPageButtons={7} label="Documents pages" />
            <RowsPerPage
              label="Per page:"
              options={[6, 12, 24]}
              value={pageSize}
              total={visible.length}
              page={current}
              onValueChange={(n) => {
                setPageSize(n);
                resetPaging();
              }}
            />
          </div>
        )}
      </div>

      <ConfirmModal state={confirm} onClose={() => setConfirm(null)} />
      <ShareModal
        docName={sharing?.name ?? null}
        onClose={() => setSharing(null)}
        onSend={(to) => toast({ status: 'success', title: 'Document shared', description: `Shared with ${to.join(', ')}` })}
      />
      <UploadModal open={uploading} existingNames={allNames} onClose={() => setUploading(false)} onUpload={onUpload} />

    </>
  );
}
