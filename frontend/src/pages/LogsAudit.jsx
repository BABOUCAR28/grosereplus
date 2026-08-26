// Back-office — consultation du journal d'audit (lecture seule).
import AppLayout from '../layouts/AppLayout.jsx';
import JournalAudit from '../components/JournalAudit.jsx';

export default function LogsAudit() {
  return (
    <AppLayout titre="Journal d'audit">
      <JournalAudit />
    </AppLayout>
  );
}
