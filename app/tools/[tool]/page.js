import ToolPage from "./page.client";
import { toolIds } from "@/lib/tools";

export function generateStaticParams() {
  return toolIds.map((tool) => ({ tool }));
}

export default async function Page({ params }) {
  const { tool } = await params;
  return <ToolPage tool={tool} />;
}
