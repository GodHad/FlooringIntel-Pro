import { Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadService, type ExportFieldSetting } from "@/services/api";

export const Route = createFileRoute("/dashboard/downloads_/customize")({
  head: () => ({ meta: [{ title: "Customize export fields - FlooringIntel" }] }),
  component: CustomizeExportFieldsPage,
});

const NO_KEY_VALUE = "__no_key__";

const getFieldKeys = (field: ExportFieldSetting) => Array.from(new Set(field.fields.filter(Boolean)));
const getAvailableFieldKey = (field: ExportFieldSetting) => field.fields[0] || "";

const normalizeOrders = (fields: ExportFieldSetting[]) =>
  fields
    .filter((field) => field.enabled !== false)
    .map((field, index) => {
      const keys = getFieldKeys(field);
      return { ...field, fields: keys, enabled: true, order: index };
    });

const makeBlankField = (order: number): ExportFieldSetting => ({
  fields: [],
  label: "New field",
  enabled: true,
  order,
  width: 18,
});

function CustomizeExportFieldsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["export-fields"], queryFn: downloadService.getExportFields });
  const [fields, setFields] = useState<ExportFieldSetting[]>([]);

  useEffect(() => {
    if (data?.fields) {
      setFields(normalizeOrders(data.fields));
    }
  }, [data?.fields]);

  const activeFields = useMemo(
    () => fields.filter((field) => field.enabled !== false).sort((a, b) => a.order - b.order),
    [fields]
  );

  const saveMutation = useMutation({
    mutationFn: (payload: ExportFieldSetting[]) => downloadService.updateExportFields(payload),
    onSuccess: (response) => {
      setFields(normalizeOrders(response.fields));
      queryClient.invalidateQueries({ queryKey: ["export-fields"] });
      toast.success("Export fields updated.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save export fields."),
  });

  const setActiveOrder = (nextActive: ExportFieldSetting[]) => {
    setFields(nextActive.map((field, index) => {
      const keys = getFieldKeys(field);
      return { ...field, fields: keys, enabled: true, order: index };
    }));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= activeFields.length) return;
    const next = [...activeFields];
    [next[index], next[target]] = [next[target], next[index]];
    setActiveOrder(next);
  };

  const updateField = (index: number, updates: Partial<ExportFieldSetting>) => {
    setFields((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updates } : item)));
  };

  const updateFieldKeys = (index: number, keys: string[]) => {
    const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
    updateField(index, { fields: uniqueKeys });
  };

  const addKey = (index: number, key: string) => {
    if (!key || key === NO_KEY_VALUE) return;
    const currentKeys = getFieldKeys(activeFields[index]);
    updateFieldKeys(index, [...currentKeys, key]);
  };

  const removeKey = (index: number, key: string) => {
    updateFieldKeys(index, getFieldKeys(activeFields[index]).filter((item) => item !== key));
  };

  const moveKey = (fieldIndex: number, keyIndex: number, direction: -1 | 1) => {
    const keys = getFieldKeys(activeFields[fieldIndex]);
    const target = keyIndex + direction;
    if (target < 0 || target >= keys.length) return;
    const next = [...keys];
    [next[keyIndex], next[target]] = [next[target], next[keyIndex]];
    updateFieldKeys(fieldIndex, next);
  };

  const removeField = (index: number) => {
    setActiveOrder(activeFields.filter((_, itemIndex) => itemIndex !== index));
  };

  const addField = () => {
    setActiveOrder([...activeFields, makeBlankField(activeFields.length)]);
  };

  const resetToDefaults = () => {
    if (!data?.availableFields) return;
    setFields(normalizeOrders(data.availableFields.map((field) => ({ ...field, fields: getFieldKeys(field), enabled: true }))));
  };

  const getFieldLabel = (key: string) => {
    const field = data?.availableFields.find((item) => getAvailableFieldKey(item) === key);
    // return field ? `${field.label} (${getAvailableFieldKey(field)})` : key;
    return field ? `${field.label}` : key;
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Customize export fields" description="Choose the columns included in product exports" />
        <Card className="p-6 text-sm text-muted-foreground">Loading export field settings...</Card>
      </div>
    );
  }

  if (!data?.canCustomize) {
    return (
      <div>
        <PageHeader title="Customize export fields" description="Choose the columns included in product exports" />
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold">Export customization unavailable</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Custom export fields are not enabled for your account. Your exports will continue to use the default FlooringIntel field set.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/dashboard/downloads"><ArrowLeft className="mr-2 h-4 w-4" /> Back to downloads</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Customize export fields" description="Set each Excel column name and map it to one or more product fields" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard/downloads"><ArrowLeft className="mr-2 h-4 w-4" /> Downloads</Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="mr-2 h-4 w-4" /> Add field
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset defaults
          </Button>
          <Button type="button" size="sm" onClick={() => saveMutation.mutate(normalizeOrders(fields))} disabled={saveMutation.isPending || activeFields.length === 0}>
            <Save className="mr-2 h-4 w-4" /> Save fields
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="font-display text-lg font-semibold">Export columns</h3>
          <p className="text-sm text-muted-foreground">Field name becomes the Excel column header. Field keys are checked from top to bottom, and the first non-empty value is exported.</p>
        </div>
        <div className="divide-y divide-border">
          {activeFields.map((field, index) => {
            const keys = getFieldKeys(field);
            const availableKeys = data.availableFields.filter((availableField) => {
              const key = getAvailableFieldKey(availableField);
              return Boolean(key) && !keys.includes(key);
            });
            return (
              <div key={`${field.label}-${index}`} className="grid gap-4 p-4 xl:grid-cols-[96px_minmax(180px,260px)_1fr_120px] xl:items-start">
                <div className="flex gap-2 xl:pt-7">
                  <Button type="button" variant="outline" size="icon" onClick={() => moveField(index, -1)} disabled={index === 0} aria-label="Move field up">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => moveField(index, 1)} disabled={index === activeFields.length - 1} aria-label="Move field down">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Field name</Label>
                  <Input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} placeholder="Column header" />
                </div>
                <div className="space-y-2">
                  <Label>Field keys</Label>
                  <div className="rounded-md border border-border bg-muted/20 px-2">
                    {keys.length === 0 && <p className="px-2 py-1 text-sm text-muted-foreground">No field keys selected. This column will be blank.</p>}
                    {keys.map((key, keyIndex) => (
                      <Fragment key={`${key}-${keyIndex}`}>
                        <hr />
                        <div className="flex flex-wrap items-center gap-2 rounded-md bg-background px-2 py-1 text-sm">
                          <span className="min-w-0 flex-1 truncate font-medium">{getFieldLabel(key)}</span>
                          <Button type="button" variant="outline" size="icon" onClick={() => moveKey(index, keyIndex, -1)} disabled={keyIndex === 0} aria-label="Move key up">
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="outline" size="icon" onClick={() => moveKey(index, keyIndex, 1)} disabled={keyIndex === keys.length - 1} aria-label="Move key down">
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeKey(index, key)} aria-label="Remove key">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <Select value={NO_KEY_VALUE} onValueChange={(value) => addKey(index, value)}>
                    <SelectTrigger><SelectValue placeholder="Add field key" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_KEY_VALUE}>Add optional field key</SelectItem>
                      {availableKeys.map((availableField) => (
                        <SelectItem key={getAvailableFieldKey(availableField)} value={getAvailableFieldKey(availableField)}>
                          {availableField.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="ghost" className="justify-start text-destructive hover:text-destructive xl:mt-7" onClick={() => removeField(index)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            );
          })}
          {activeFields.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">Add at least one field before saving.</div>
          )}
        </div>
      </Card>
    </div>
  );
}