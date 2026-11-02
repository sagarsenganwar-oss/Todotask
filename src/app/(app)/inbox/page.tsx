import type { Metadata } from "next";
import { ProjectView } from "@/components/project-view";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Inbox · Todotask" };

export default async function InboxPage() {
  const projects = await getProjects();
  const inbox = projects.find((p) => p.is_inbox);
  if (!inbox) throw new Error("Your Inbox could not be found.");
  return <ProjectView project={inbox} />;
}
