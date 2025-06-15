
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { deepMergeJson } from "./JsonMergeLogic";

type JsonMergeInputProps = {
  onResult: (merged: any, validInputs: string[]) => void;
};

export default function JsonMergeInput({ onResult }: JsonMergeInputProps) {
  const [inputs, setInputs] = React.useState<string[]>(["", ""]);
  const [errors, setErrors] = React.useState<(string | null)[]>([null, null]);
  const maxInputs = 20;
  const { toast } = useToast();

  React.useEffect(() => {
    handleMerge();
    // eslint-disable-next-line
  }, [inputs]);

  function addInput() {
    if (inputs.length >= maxInputs) {
      toast({ title: "Maximum reached", description: "Up to 20 JSON files allowed." });
      return;
    }
    setInputs((arr) => [...arr, ""]);
    setErrors((e) => [...e, null]);
  }

  function removeInput(idx: number) {
    setInputs(inputs.filter((_, i) => i !== idx));
    setErrors(errors.filter((_, i) => i !== idx));
  }

  function setInput(idx: number, val: string) {
    setInputs(inputs.map((old, i) => (i === idx ? val : old)));
  }

  function handleMerge() {
    const validObjects: any[] = [];
    const validInputs: string[] = [];
    const newErrors = inputs.map((input) => {
      if (!input.trim()) return null;
      try {
        validObjects.push(JSON.parse(input));
        validInputs.push(input);
        return null;
      } catch (e: any) {
        return "Invalid JSON";
      }
    });
    setErrors(newErrors);
    if (validObjects.length > 0 && newErrors.every(e => e === null)) {
      const merged = deepMergeJson(validObjects);
      onResult(merged, validInputs);
    } else {
      onResult({}, []);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inputs.map((val, idx) => (
          <div key={idx} className="relative flex flex-col">
            <Textarea
              className="font-mono min-h-[140px] resize-y px-3 py-2"
              placeholder={`Paste JSON #${idx + 1} here...`}
              value={val}
              spellCheck={false}
              onChange={e => setInput(idx, e.target.value)}
              data-testid={`json-input-${idx}`}
            />
            <div className="flex flex-row justify-between mt-1">
              <span className="text-xs text-destructive-foreground h-5">
                {errors[idx] && (<span className="text-destructive">{errors[idx]}</span>)}
              </span>
              {inputs.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2 text-xs text-red-500"
                  title="Remove"
                  onClick={() => removeInput(idx)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={addInput} disabled={inputs.length >= maxInputs}>
        Add json
      </Button>
    </div>
  );
}
