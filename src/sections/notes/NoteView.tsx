import { ExternalLink, Pencil, Star, Trash2, X } from 'lucide-react';
import { Badge, Button, Card, IconButton } from '@cake-admin/cakeand';
import { navigate } from '../../shell/router';
import { SideDrawer } from './SideDrawer';
import { contactById, formatDate, noteMeta, orNA, type Note } from './data';

type Props = {
  note?: Note;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
};

/**
 * Note detail drawer — Figma "Note" 14373:63030 (created) and 14373:63101
 * (updated: meta switches to "Updated on…", timeline gains an Updated row).
 * Delete is not drawn in Figma; it is added here (with a confirm Modal) so
 * the prototype covers the full create/edit/delete loop.
 */
export function NoteView({ note, onClose, onEdit, onDelete, onToggleFavorite }: Props) {
  if (!note) return null;
  const contacts = note.contactIds.map(contactById).filter(Boolean);
  const meta = noteMeta(note);

  return (
    <SideDrawer
      open
      largeTitle
      onOpenChange={(o) => !o && onClose()}
      title={note.title}
      subtitle={
        <>
          <p className="notes-caption">{meta}</p>
          <p className="notes-caption">Tags: {note.tags.length ? note.tags.join(', ') : 'NA'}</p>
          {note.type && (
            <Badge color="teal" tone="subtle" dot={false}>
              {note.type}
            </Badge>
          )}
        </>
      }
      actions={
        <>
          <IconButton
            size="sm"
            variant="ghost"
            intent="secondary"
            label={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
            aria-pressed={note.favorite}
            icon={<Star className={note.favorite ? 'notes-star--on' : undefined} />}
            onClick={onToggleFavorite}
          />
          <Button size="xs" variant="outline" intent="secondary" startIcon={<Trash2 />} onClick={onDelete}>
            Delete
          </Button>
          <Button size="xs" startIcon={<Pencil />} onClick={onEdit}>
            Edit
          </Button>
          <IconButton size="sm" variant="ghost" intent="secondary" label="Close" icon={<X />} onClick={onClose} />
        </>
      }
    >
      <div className="notes-view">
        <Card className="notes-view__body" tabIndex={0} aria-label="Note body">
          <p className="notes-view__text">{note.body.trim() ? note.body : 'NA'}</p>
        </Card>

        <div className="notes-view__links">
          <section className="notes-view__col" aria-labelledby={`${note.id}-opp`}>
            <h3 id={`${note.id}-opp`} className="notes-view__h">
              Linked Opportunity
            </h3>
            <Card>
              <div className="notes-view__card">
                <dl className="notes-view__dl">
                  <div>
                    <dt>Opportunity ID</dt>
                    <dd className={note.opportunityId ? 'notes-link-text' : undefined}>{orNA(note.opportunityId)}</dd>
                  </div>
                  <div>
                    <dt>Opportunity Name</dt>
                    <dd className="notes-view__strong">{orNA(note.opportunityName)}</dd>
                  </div>
                </dl>
                {note.opportunityId && (
                  <div>
                    <Button size="sm" variant="ghost" startIcon={<ExternalLink />} onClick={() => navigate('details')}>
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section className="notes-view__col" aria-labelledby={`${note.id}-con`}>
            <h3 id={`${note.id}-con`} className="notes-view__h">
              Linked Contact
            </h3>
            {contacts.length ? (
              <ul className="notes-view__contacts">
                {contacts.map((c) => (
                  <li key={c!.id}>
                    <Card>
                      <div className="notes-view__card notes-view__contact">
                        <span className="notes-view__strong">{c!.name}</span>
                        <span className="notes-view__sub">{c!.title}</span>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="notes-view__sub">NA</p>
            )}
          </section>
        </div>

        <section className="notes-view__history" aria-label="History Timeline">
          <h3 className="notes-view__h">History Timeline</h3>
          <ul className="notes-view__timeline">
            <li className="notes-caption">{`Created on ${formatDate(note.createdAt)} • By ${note.author}`}</li>
            {note.updatedAt && (
              <li className="notes-caption">{`Updated on ${formatDate(note.updatedAt)} • By ${note.updatedBy ?? note.author}`}</li>
            )}
          </ul>
        </section>
      </div>
    </SideDrawer>
  );
}
