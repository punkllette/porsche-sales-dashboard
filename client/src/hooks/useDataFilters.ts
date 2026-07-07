import { useState, useMemo } from 'react';

export interface FilterState {
  dateRange: { start: string; end: string } | null;
  states: string[];
  models: string[];
}

export function useDataFilters(data: any[]) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    states: [],
    models: [],
  });

  // Extrair valores únicos para dropdowns
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(data.map(item => item.EstadoSanitizado)))
      .filter(s => s && s !== 'INVÁLIDO')
      .sort();
  }, [data]);

  const uniqueModels = useMemo(() => {
    return Array.from(new Set(data.map(item => item.PorscheModelSanitized)))
      .sort();
  }, [data]);

  // Filtrar dados baseado nos filtros aplicados
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filtro de data
      if (filters.dateRange) {
        const itemDate = item.DataDaVendaSanitizada;
        if (itemDate === 'INVÁLIDO') return false;
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      // Filtro de estados
      if (filters.states.length > 0 && !filters.states.includes(item.EstadoSanitizado)) {
        return false;
      }

      // Filtro de modelos
      if (filters.models.length > 0 && !filters.models.includes(item.PorscheModelSanitized)) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const updateDateRange = (start: string, end: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: start && end ? { start, end } : null,
    }));
  };

  const toggleState = (state: string) => {
    setFilters(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state],
    }));
  };

  const toggleModel = (model: string) => {
    setFilters(prev => ({
      ...prev,
      models: prev.models.includes(model)
        ? prev.models.filter(m => m !== model)
        : [...prev.models, model],
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: null,
      states: [],
      models: [],
    });
  };

  const isFiltered = filters.dateRange !== null || filters.states.length > 0 || filters.models.length > 0;

  return {
    filters,
    filteredData,
    uniqueStates,
    uniqueModels,
    updateDateRange,
    toggleState,
    toggleModel,
    clearFilters,
    isFiltered,
  };
}
