import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Filter } from 'lucide-react';
import { FilterState } from "@/hooks/useDataFilters";

interface FilterPanelProps {
  filters: FilterState;
  uniqueStates: string[];
  uniqueModels: string[];
  onDateRangeChange: (start: string, end: string) => void;
  onStateToggle: (state: string) => void;
  onModelToggle: (model: string) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
  recordCount: number;
  totalRecords: number;
}

export function FilterPanel({
  filters,
  uniqueStates,
  uniqueModels,
  onDateRangeChange,
  onStateToggle,
  onModelToggle,
  onClearFilters,
  isFiltered,
  recordCount,
  totalRecords,
}: FilterPanelProps) {
  return (
    <Card className="shadow-lg mb-8 border-l-4 border-l-red-600">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-red-600" />
            <CardTitle>Filtros Avançados</CardTitle>
          </div>
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Mostrando <span className="font-semibold text-gray-900">{recordCount}</span> de{' '}
          <span className="font-semibold text-gray-900">{totalRecords}</span> registros
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filtro de Data */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Intervalo de Data</Label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Data Inicial</label>
                <Input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) =>
                    onDateRangeChange(e.target.value, filters.dateRange?.end || '')
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Data Final</label>
                <Input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) =>
                    onDateRangeChange(filters.dateRange?.start || '', e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Filtro de Estados */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Estados ({filters.states.length})</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {uniqueStates.map((state) => (
                <div key={state} className="flex items-center space-x-2">
                  <Checkbox
                    id={`state-${state}`}
                    checked={filters.states.includes(state)}
                    onCheckedChange={() => onStateToggle(state)}
                  />
                  <label
                    htmlFor={`state-${state}`}
                    className="text-sm cursor-pointer text-gray-700"
                  >
                    {state}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtro de Modelos */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Modelos ({filters.models.length})</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
              {uniqueModels.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model}`}
                    checked={filters.models.includes(model)}
                    onCheckedChange={() => onModelToggle(model)}
                  />
                  <label
                    htmlFor={`model-${model}`}
                    className="text-sm cursor-pointer text-gray-700"
                  >
                    {model}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
