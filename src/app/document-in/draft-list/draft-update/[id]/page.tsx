"use client";
import { DraftForm } from "@/components/document-in/DraftForm";

export default function DraftUpdate({ params }: { params: { id: string } }) {
  return <DraftForm action={"update"} id={params.id} />;
}
