import { Workspace } from "@/app/_components/workspace";
import { resolveDoiAction } from "@/app/actions";

// A Server Component: it hands the Server Function for DOI resolution to the client-side workspace.
export default function Home() {
  return <Workspace resolve={resolveDoiAction} />;
}
