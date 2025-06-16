
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

type JsonCommonKeysOutputProps = {
  commonKeys: string[];
  show: boolean;
};

export default function JsonCommonKeysOutput({ commonKeys, show }: JsonCommonKeysOutputProps) {
  if (!show || commonKeys.length === 0) {
    return null;
  }

  const keysText = commonKeys.join('\n');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(keysText);
      toast({ title: "Copied to clipboard!" });
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually." });
    }
  }

  return (
    <div className="relative p-5 rounded-xl border bg-blue-50/70 mt-6 overflow-x-auto group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-blue-900">
          Common Keys ({commonKeys.length} found)
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-30 group-hover:opacity-100 transition"
          title="Copy common keys"
          onClick={handleCopy}
          aria-label="Copy"
        >
          <Copy size={18} />
        </Button>
      </div>
      <div className="text-xs md:text-sm text-left font-mono whitespace-pre-wrap text-blue-800 max-h-60 overflow-y-auto">
        {keysText}
      </div>
    </div>
  );
}
