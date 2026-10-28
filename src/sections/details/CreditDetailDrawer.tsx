import { ExternalLink } from 'lucide-react';
import { Badge, Button, DataCell, DataRow, HeaderCell, HeaderRow, Table } from '@cake-admin/cakeand';
import { creditRows } from './data';
import { Drawer } from './Drawer';

/** Figma "Credit detail 8/14" (10210:10264) / "Drawer_Credit_Detail" (10210:10294). */
export function CreditDetailDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Credit Detail">
      <Table
        aria-label="Credit detail"
        header={
          <HeaderRow>
            <HeaderCell>Payer ID</HeaderCell>
            <HeaderCell>Total Credit Line</HeaderCell>
            <HeaderCell>Credit Expire on</HeaderCell>
            <HeaderCell>Available Credit</HeaderCell>
            <HeaderCell>AR Amount Overdue 60 days</HeaderCell>
            <HeaderCell style={{ flex: '0.6 1 0' }}>Status</HeaderCell>
          </HeaderRow>
        }
      >
        {creditRows.map((r) => (
          <DataRow key={r.payerId} selectable={false}>
            <DataCell>{r.payerId}</DataCell>
            <DataCell>{r.totalLine}</DataCell>
            <DataCell>{r.expires}</DataCell>
            <DataCell>{r.available}</DataCell>
            <DataCell>{r.arOverdue}</DataCell>
            <DataCell style={{ flex: '0.6 1 0' }}>
              <Badge color="destructive" tone="subtle" dot={false} title="Red: needs attention">
                {r.status}
                <span className="ce-sr-only"> (needs attention)</span>
              </Badge>
            </DataCell>
          </DataRow>
        ))}
      </Table>
      <div className="dt-credit__more">
        <span className="dt-credit__label">Additional Details</span>
        <Button size="xs" variant="ghost" endIcon={<ExternalLink />} onClick={() => window.open('about:blank', '_blank')}>
          Credit Limit Expiring Detail
        </Button>
        <Button size="xs" variant="ghost" endIcon={<ExternalLink />} onClick={() => window.open('about:blank', '_blank')}>
          AR Over 60 Days
        </Button>
      </div>
    </Drawer>
  );
}
