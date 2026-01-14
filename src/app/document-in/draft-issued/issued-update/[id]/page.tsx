import { IssuedDetail } from "@/components/document-in/IssuedDetail";

export default function IssuedUpdate({ params }: { params: { id: string } }) {
  return <IssuedDetail id={params.id} action={"update"} />;
}
