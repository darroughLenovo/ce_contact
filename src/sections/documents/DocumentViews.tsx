import { Archive, ArchiveRestore, Download, ExternalLink, Maximize2, MoreVertical, PencilLine, Share2, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  DataCell,
  DataRow,
  HeaderCell,
  HeaderRow,
  IconButton,
  Table,
} from '@cake-admin/cakeand';
import { ActionMenu, type MenuAction } from './ActionMenu';
import { fileIcon, type Doc } from './data';
import { categoryOf, displayDate } from './naming';
import { RenameField } from './RenameField';

export type DocHandlers = {
  onOpen: (d: Doc) => void;
  onDownload: (d: Doc) => void;
  onShare: (d: Doc) => void;
  onRenameStart: (d: Doc) => void;
  onRenameSave: (d: Doc, name: string) => void;
  onRenameCancel: () => void;
  onArchive: (d: Doc) => void;
  onUnarchive: (d: Doc) => void;
  onDelete: (d: Doc) => void;
};

type ViewProps = DocHandlers & {
  docs: Doc[];
  archived: boolean;
  renamingId?: string;
  /** Every current name, for the rename uniqueness rule. */
  allNames: string[];
};

function menuItems(d: Doc, archived: boolean, h: DocHandlers): MenuAction[] {
  if (archived) {
    return [
      { key: 'delete', label: 'Delete', icon: <Trash2 />, onSelect: () => h.onDelete(d), danger: true },
    ];
  }
  return [
    { key: 'share', label: 'Share', icon: <Share2 />, onSelect: () => h.onShare(d) },
    { key: 'rename', label: 'Rename', icon: <PencilLine />, onSelect: () => h.onRenameStart(d) },
    { key: 'archive', label: 'Archive', icon: <Archive />, onSelect: () => h.onArchive(d), danger: true },
  ];
}

const Kebab = ({ d, archived, h, size = 'xs' }: { d: Doc; archived: boolean; h: DocHandlers; size?: 'xs' | 'sm' }) => (
  <ActionMenu
    label={`Actions for ${d.name}`}
    items={menuItems(d, archived, h)}
    trigger={<IconButton size={size} variant="ghost" intent="secondary" label={`More actions for ${d.name}`} icon={<MoreVertical />} />}
  />
);

const UnarchiveButton = ({ d, h }: { d: Doc; h: DocHandlers }) => (
  <Button size="sm" variant="ghost" startIcon={<ArchiveRestore />} underline={false} onClick={() => h.onUnarchive(d)} aria-label={`Unarchive ${d.name}`}>
    Unarchive
  </Button>
);

/* ── Grid (Figma 01_Documents 10210:2855, 02_Archived 10210:3943) ───── */

export function DocumentGrid({ docs, archived, renamingId, allNames, ...h }: ViewProps) {
  return (
    <ul className="docs-grid" aria-label={archived ? 'Archived documents' : 'Documents'}>
      {docs.map((d) => {
        const c = categoryOf(d.category);
        const meta = archived
          ? `Archived on ${displayDate(d.archived!.on)} by ${d.archived!.by}`
          : `Modified on ${displayDate(d.modifiedOn)} by ${d.modifiedBy}`;
        return (
          <li key={d.id} className="docs-grid__item">
            <Card className="docs-card">
              <button type="button" className="docs-card__thumb" onClick={() => h.onOpen(d)} aria-label={`Open ${d.name}`}>
                <img className="docs-card__img" src={d.thumb} alt="" />
                <span className="docs-card__hover" aria-hidden>
                  {archived ? <ExternalLink /> : <Maximize2 />}
                </span>
                <span className="docs-card__type" aria-hidden>
                  <img src={fileIcon(d.name)} alt="" />
                </span>
              </button>
              <div className="docs-card__body">
                <div className="docs-card__badge">
                  <Badge color={c.badge} tone="subtle" dot={false}>
                    {c.label}
                  </Badge>
                </div>
                {renamingId === d.id ? (
                  <RenameField
                    name={d.name}
                    taken={allNames.filter((n) => n !== d.name)}
                    onSave={(n) => h.onRenameSave(d, n)}
                    onCancel={h.onRenameCancel}
                  />
                ) : (
                  <h3 className="docs-card__title" title={d.name}>
                    {d.name}
                  </h3>
                )}
                <div className="docs-card__foot">
                  <span className="docs-card__meta" title={meta}>
                    {meta}
                  </span>
                  <div className="docs-card__actions">
                    {archived ? (
                      <UnarchiveButton d={d} h={h} />
                    ) : (
                      <Button size="sm" variant="ghost" underline={false} startIcon={<Download />} onClick={() => h.onDownload(d)} aria-label={`Download ${d.name}`}>
                        Download
                      </Button>
                    )}
                    <Kebab d={d} archived={archived} h={h} />
                  </div>
                </div>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

/* ── List (Figma 10210:3058, archived 10210:3570, rename 10210:3243) ── */

export function DocumentTable({ docs, archived, renamingId, allNames, ...h }: ViewProps) {
  return (
    <Table
      className="docs-table"
      aria-label={archived ? 'Archived documents' : 'Documents'}
      header={
        archived ? (
          <HeaderRow>
            <HeaderCell className="docs-col--name">File Name</HeaderCell>
            <HeaderCell className="docs-col--cat">Categories</HeaderCell>
            <HeaderCell>Archived by</HeaderCell>
            <HeaderCell>Archived on</HeaderCell>
            <HeaderCell>Created by</HeaderCell>
            <HeaderCell className="docs-col--actions">Actions</HeaderCell>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HeaderCell className="docs-col--name">File Name</HeaderCell>
            <HeaderCell className="docs-col--narrow">Latest Version</HeaderCell>
            <HeaderCell className="docs-col--cat">Categories</HeaderCell>
            <HeaderCell>Modified by</HeaderCell>
            <HeaderCell>Last Modified</HeaderCell>
            <HeaderCell>Created by</HeaderCell>
            <HeaderCell className="docs-col--actions">Actions</HeaderCell>
          </HeaderRow>
        )
      }
    >
      {docs.map((d, i) => {
        const c = categoryOf(d.category);
        const name =
          renamingId === d.id ? (
            <RenameField
              name={d.name}
              taken={allNames.filter((n) => n !== d.name)}
              onSave={(n) => h.onRenameSave(d, n)}
              onCancel={h.onRenameCancel}
            />
          ) : (
            <span className="docs-ellipsis" title={d.name}>
              {d.name}
            </span>
          );
        return (
          <DataRow key={d.id} selectable={false} stripe={i % 2 ? 'inverse' : 'default'}>
            <DataCell className="docs-col--name">{name}</DataCell>
            {archived ? null : <DataCell className="docs-col--narrow">{d.version}</DataCell>}
            <DataCell className="docs-col--cat">{c.label}</DataCell>
            <DataCell>{archived ? d.archived!.by : d.modifiedBy}</DataCell>
            <DataCell>{displayDate(archived ? d.archived!.on : d.modifiedOn)}</DataCell>
            <DataCell>{d.createdBy}</DataCell>
            <DataCell className="docs-col--actions">
              <div className="docs-row-actions">
                {archived ? (
                  <>
                    <UnarchiveButton d={d} h={h} />
                    <Kebab d={d} archived h={h} />
                  </>
                ) : (
                  <>
                    <IconButton size="xs" variant="ghost" intent="secondary" label={`Open ${d.name}`} icon={<Maximize2 />} onClick={() => h.onOpen(d)} />
                    <IconButton size="xs" variant="ghost" intent="secondary" label={`Download ${d.name}`} icon={<Download />} onClick={() => h.onDownload(d)} />
                    <Kebab d={d} archived={false} h={h} />
                  </>
                )}
              </div>
            </DataCell>
          </DataRow>
        );
      })}
    </Table>
  );
}
