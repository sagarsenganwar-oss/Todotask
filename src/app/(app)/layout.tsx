import { AppShell } from "@/components/app-shell";
import { getOpenCounts, getProjects, getUser } from "@/lib/data";

/** Layout for every private page. Checks the session on the server first. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { email } = await getUser();
  const [projects, counts] = await Promise.all([getProjects(), getOpenCounts()]);

  return (
    <AppShell email={email} projects={projects} counts={counts}>
      {children}
    </AppShell>
  );
}
