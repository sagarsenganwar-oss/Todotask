import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectView } from "@/components/project-view";
import { getProjects } from "@/lib/data";

async function findProject(id: string) {
  const projects = await getProjects();
  return projects.find((p) => p.id === id);
}

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  const project = await findProject((await params).id);
  return { title: `${project?.name ?? "Project"} · Todotask` };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  // Only the user's own projects are in this list (Row Level Security),
  // so another user's project id shows "not found".
  const project = await findProject(id);
  if (!project) notFound();
  if (project.is_inbox) redirect("/inbox");
  return <ProjectView project={project} />;
}
