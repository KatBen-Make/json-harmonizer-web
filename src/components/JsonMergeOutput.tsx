
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

type JsonMergeOutputProps = {
  merged: any;
  show: boolean;
};

export default function JsonMergeOutput({ merged, show }: JsonMergeOutputProps) {
  const pretty = merged && Object.keys(merged).length > 0
    ? JSON.stringify(merged, null, 2)
    : "";

  if (!show || !pretty) {
    return (
      <div className="rounded bg-muted/50 text-center text-sm text-muted-foreground p-8 mt-12 border">
        The merged JSON result will appear here.
      </div>
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pretty);
      toast({ title: "Copied to clipboard!" });
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually." });
    }
  }

  return (
    <div className="relative p-5 rounded-xl border bg-zinc-100/70 mt-12 overflow-x-auto group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 opacity-30 group-hover:opacity-100 transition"
        title="Copy merged JSON"
        onClick={handleCopy}
        aria-label="Copy"
      >
        <Copy size={18} />
      </Button>
      <pre className="text-xs md:text-sm text-left font-mono whitespace-pre">{pretty}</pre>
    </div>
  );
}
