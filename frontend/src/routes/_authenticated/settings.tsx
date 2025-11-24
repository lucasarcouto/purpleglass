import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/pages-contents/settings/settings-page';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  return <SettingsPage />;
}
