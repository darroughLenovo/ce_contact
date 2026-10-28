import { Badge } from '@cake-admin/cakeand';

/**
 * Figma draws alerts as a red dot + plain text. cake& Badge (destructive,
 * subtle, with its status dot) is the closest shipped part — delta noted.
 * Long lists ellipsize; the full text is in the title attribute.
 */
export function AlertList({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return <span className="ce-sr-only">No alerts</span>;
  const text = alerts.join(', ');
  return (
    <Badge color="destructive" tone="subtle" title={text} className="dt-alert">
      {text}
    </Badge>
  );
}
