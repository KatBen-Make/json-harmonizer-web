
import React from "react";
import JsonMergeInput from "@/components/JsonMergeInput";
import JsonMergeOutput from "@/components/JsonMergeOutput";
import JsonCommonKeysOutput from "@/components/JsonCommonKeysOutput";

const Index: React.FC = () => {
  const [merged, setMerged] = React.useState({});
  const [validInputs, setValidInputs] = React.useState<string[]>([]);
  const [commonKeys, setCommonKeys] = React.useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
      <main className="w-full max-w-screen-xl flex flex-col gap-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
          JSON Combiner Tool
        </h1>
        <div className="text-muted-foreground text-base mb-2 md:max-w-2xl">
          Paste up to 35 JSON objects below. Click "Add json" to add more sources. 
          Click "Merge files" to see the merged output. Click "Find common Keys" to see keys present in all JSONs.
          The tool will merge the keys recursively, preferring present, non-empty values. 
          Array fields will take the first non-empty array among all sources. The result ignores value differences, except that empty values are replaced by present values if found elsewhere.
        </div>
        <JsonMergeInput 
          onResult={(mergedResult, validInputsArr) => {
            setMerged(mergedResult);
            setValidInputs(validInputsArr);
          }}
          onCommonKeys={(keys) => {
            setCommonKeys(keys);
          }}
        />
        <JsonMergeOutput merged={merged} show={validInputs.length > 0} />
        <JsonCommonKeysOutput commonKeys={commonKeys} show={commonKeys.length > 0} />
        <footer className="mt-8 text-xs text-muted-foreground text-center opacity-60">
          Built with &lt;3 for fast desktop merging.&nbsp;
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            View on GitHub
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Index;
