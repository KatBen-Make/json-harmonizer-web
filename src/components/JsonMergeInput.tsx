
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { deepMergeJson } from "./JsonMergeLogic";
import { findCommonKeys } from "./JsonCommonKeysLogic";

type JsonMergeInputProps = {
  onResult: (merged: any, validInputs: string[]) => void;
  onCommonKeys?: (commonKeys: string[]) => void;
};

export default function JsonMergeInput({ onResult, onCommonKeys }: JsonMergeInputProps) {
  const [inputs, setInputs] = React.useState<string[]>(["", ""]);
  const [errors, setErrors] = React.useState<(string | null)[]>([null, null]);
  const maxInputs = 35; // raised from 20 to 35
  const { toast } = useToast();

  function addInput() {
    if (inputs.length >= maxInputs) {
      toast({ title: "Maximum reached", description: "Up to 35 JSON files allowed." });
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
    setErrors(errors.map((old, i) => (i === idx ? null : old)));
  }

  function getValidObjects() {
    const validObjects: any[] = [];
    const validInputs: string[] = [];
    const newErrors = inputs.map((input) => {
      if (!input.trim()) return null;
      try {
        const parsed = JSON.parse(input);
        validObjects.push(parsed);
        validInputs.push(input);
        return null;
      } catch (e: any) {
        return "Invalid JSON";
      }
    });
    setErrors(newErrors);
    return { validObjects, validInputs, hasErrors: !newErrors.every(e => e === null) };
  }

  function handleMerge() {
    const { validObjects, validInputs } = getValidObjects();
    if (validObjects.length > 0) {
      const merged = deepMergeJson(validObjects);
      onResult(merged, validInputs);
    } else {
      onResult({}, []);
    }
  }

  function handleFindCommonKeys() {
    const { validObjects, hasErrors } = getValidObjects();
    if (validObjects.length < 2) {
      toast({ title: "Need at least 2 valid JSONs", description: "Please provide at least 2 valid JSON objects to find common keys." });
      return;
    }
    if (hasErrors) {
      toast({ title: "Fix JSON errors first", description: "Please fix all JSON syntax errors before finding common keys." });
      return;
    }
    
    const commonKeys = findCommonKeys(validObjects);
    onCommonKeys?.(commonKeys);
    
    if (commonKeys.length === 0) {
      toast({ title: "No common keys found", description: "No keys are present in all JSON objects." });
    } else {
      toast({ title: "Common keys found", description: `Found ${commonKeys.length} common keys.` });
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
      <div className="flex flex-wrap gap-4 items-center">
        <Button type="button" variant="outline" onClick={addInput} disabled={inputs.length >= maxInputs}>
          Add json
        </Button>
        <Button type="button" variant="default" onClick={handleMerge}>
          Merge files
        </Button>
        <Button type="button" variant="secondary" onClick={handleFindCommonKeys}>
          Find common Keys
        </Button>
      </div>
    </div>
  );
}
