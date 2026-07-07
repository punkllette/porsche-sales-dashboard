import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardData from '@/data/dashboard.json';
import { TrendingUp, DollarSign, Package, Truck, CreditCard, X, Filter } from 'lucide-react';

export default function Dashboard() {
  const { metrics, topModels, stateDistribution, paymentMethods, deliveryStatus, priceByModel, recentSales } = dashboardData;

  // Estado dos filtros
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  // Extrair valores únicos
  const allData = recentSales as any[];
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(allData.map(item => item.EstadoSanitizado)))
      .filter(s => s && s !== 'INVÁLIDO')
      .sort();
  }, []);

  const uniqueModels = useMemo(() => {
    return Array.from(new Set(allData.map(item => item.PorscheModelSanitized)))
      .sort();
  }, []);

  // Filtrar dados
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      if (dateStart && item.DataDaVendaSanitizada < dateStart) return false;
      if (dateEnd && item.DataDaVendaSanitizada > dateEnd) return false;
      if (selectedStates.length > 0 && !selectedStates.includes(item.EstadoSanitizado)) return false;
      if (selectedModels.length > 0 && !selectedModels.includes(item.PorscheModelSanitized)) return false;
      return true;
    });
  }, [dateStart, dateEnd, selectedStates, selectedModels]);

  // Recalcular métricas com filtros
  const filteredMetrics = useMemo(() => {
    const filtered = filteredData;
    const totalSales = filtered.reduce((sum, item) => sum + (item.Preço_de_vendaSanitizado || 0), 0);
    const avgPrice = filtered.length > 0 ? totalSales / filtered.length : 0;
    const delivered = filtered.filter(item => item.Status_de_entrega_higienizado === 'Entregue').length;
    const deliveryRate = filtered.length > 0 ? (delivered / filtered.length) * 100 : 0;

    return {
      totalSales,
      averagePrice: avgPrice,
      totalRecords: filtered.length,
      deliveredCount: delivered,
      deliveryRate,
    };
  }, [filteredData]);

  // Gráficos baseados em dados filtrados
  const topModelsData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.PorscheModelSanitized] = (counts[item.PorscheModelSanitized] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([model, count]) => ({ name: model, value: count }));
  }, [filteredData]);

  const stateData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.EstadoSanitizado] = (counts[item.EstadoSanitizado] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ name: state, value: count }));
  }, [filteredData]);

  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.Método_de_pagamentoSanitizado] = (counts[item.Método_de_pagamentoSanitizado] || 0) + 1;
    });
    return Object.entries(counts).map(([method, count]) => ({ name: method, value: count }));
  }, [filteredData]);

  const deliveryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      counts[item.Status_de_entrega_higienizado] = (counts[item.Status_de_entrega_higienizado] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ name: status, value: count }));
  }, [filteredData]);

  const priceData = useMemo(() => {
    const priceMap: Record<string, number[]> = {};
    filteredData.forEach(item => {
      if (!priceMap[item.PorscheModelSanitized]) {
        priceMap[item.PorscheModelSanitized] = [];
      }
      priceMap[item.PorscheModelSanitized].push(item.Preço_de_vendaSanitizado);
    });
    return Object.entries(priceMap)
      .map(([model, prices]) => ({
        name: model,
        price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 10);
  }, [filteredData]);

  const COLORS = ['#dc2626', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#991b1b', '#7f1d1d', '#450a0a'];

  const isFiltered = dateStart || dateEnd || selectedStates.length > 0 || selectedModels.length > 0;

  const clearFilters = () => {
    setDateStart('');
    setDateEnd('');
    setSelectedStates([]);
    setSelectedModels([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      {/* Header */}
      <div className="mb-8 border-l-4 border-red-600 pl-6">
        <h1 className="text-4xl font-bold text-white mb-2">Porsche Sales Insights</h1>
        <p className="text-gray-400">Real-time analytics dashboard powered by cleaned, sanitized data</p>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg mb-8 border-l-4 border-l-red-600 bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-600" />
              <CardTitle className="text-white">Filtros Avançados</CardTitle>
            </div>
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Mostrando <span className="font-semibold text-red-500">{filteredData.length}</span> de{' '}
            <span className="font-semibold text-gray-300">{allData.length}</span> registros
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtro de Data */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-300">Intervalo de Data</Label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Data Inicial</label>
                  <Input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Data Final</label>
                  <Input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="mt-1 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Estados */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-300">Estados ({selectedStates.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800">
                {uniqueStates.map((state) => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox
                      id={`state-${state}`}
                      checked={selectedStates.includes(state)}
                      onCheckedChange={() => {
                        setSelectedStates(prev =>
                          prev.includes(state)
                            ? prev.filter(s => s !== state)
                            : [...prev, state]
                        );
                      }}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor={`state-${state}`}
                      className="text-sm cursor-pointer text-gray-300"
                    >
                      {state}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtro de Modelos */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-300">Modelos ({selectedModels.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800">
                {uniqueModels.map((model) => (
                  <div key={model} className="flex items-center space-x-2">
                    <Checkbox
                      id={`model-${model}`}
                      checked={selectedModels.includes(model)}
                      onCheckedChange={() => {
                        setSelectedModels(prev =>
                          prev.includes(model)
                            ? prev.filter(m => m !== model)
                            : [...prev, model]
                        );
                      }}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor={`model-${model}`}
                      className="text-sm cursor-pointer text-gray-300"
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Sales */}
        <Card className="border-t-4 border-t-red-600 shadow-lg hover:shadow-xl transition-shadow bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${(filteredMetrics.totalSales / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-gray-500 mt-1">{filteredMetrics.totalRecords} records</p>
          </CardContent>
        </Card>

        {/* Average Price */}
        <Card className="border-t-4 border-t-red-500 shadow-lg hover:shadow-xl transition-shadow bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Avg Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${(filteredMetrics.averagePrice / 1000).toFixed(0)}K</div>
            <p className="text-xs text-gray-500 mt-1">Per vehicle</p>
          </CardContent>
        </Card>

        {/* Total Records */}
        <Card className="border-t-4 border-t-red-400 shadow-lg hover:shadow-xl transition-shadow bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-red-400" />
              Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{filteredMetrics.totalRecords}</div>
            <p className="text-xs text-gray-500 mt-1">Sanitized entries</p>
          </CardContent>
        </Card>

        {/* Delivery Rate */}
        <Card className="border-t-4 border-t-red-300 shadow-lg hover:shadow-xl transition-shadow bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-300" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{filteredMetrics.deliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">{filteredMetrics.deliveredCount} vehicles</p>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-t-4 border-t-red-200 shadow-lg hover:shadow-xl transition-shadow bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-200" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paymentData.length}</div>
            <p className="text-xs text-gray-500 mt-1">Methods used</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Models */}
        <Card className="shadow-lg bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Top Models</CardTitle>
            <CardDescription className="text-gray-400">Most popular Porsche models sold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topModelsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: '#a0a0a0' }} />
                <YAxis tick={{ fontSize: 12, fill: '#a0a0a0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #dc2626', color: '#f5f5f5' }} />
                <Bar dataKey="value" fill="#dc2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Price by Model */}
        <Card className="shadow-lg bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Average Price by Model</CardTitle>
            <CardDescription className="text-gray-400">USD pricing across models</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: '#a0a0a0' }} />
                <YAxis tick={{ fontSize: 12, fill: '#a0a0a0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #dc2626', color: '#f5f5f5' }} />
                <Line type="monotone" dataKey="price" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Delivery Status */}
        <Card className="shadow-lg bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Delivery Status</CardTitle>
            <CardDescription className="text-gray-400">Current order fulfillment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deliveryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #dc2626', color: '#f5f5f5' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="shadow-lg bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods</CardTitle>
            <CardDescription className="text-gray-400">Customer payment preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #dc2626', color: '#f5f5f5' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="shadow-lg mb-8 bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Sales by State (Top 10)</CardTitle>
          <CardDescription className="text-gray-400">Geographic distribution of Porsche sales</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#a0a0a0' }} />
              <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12, fill: '#a0a0a0' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #dc2626', color: '#f5f5f5' }} />
              <Bar dataKey="value" fill="#dc2626" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Sales Table */}
      <Card className="shadow-lg bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Sales</CardTitle>
          <CardDescription className="text-gray-400">Latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Model</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">State</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(-10).map((sale: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4 text-gray-100">{sale.sale_id}</td>
                    <td className="py-3 px-4 text-gray-400">{sale.DataDaVendaSanitizada}</td>
                    <td className="py-3 px-4 text-gray-400">{sale.nome_do_cliente}</td>
                    <td className="py-3 px-4 font-medium text-gray-100">{sale.PorscheModelSanitized}</td>
                    <td className="py-3 px-4 text-gray-100">${sale.Preço_de_vendaSanitizado?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 px-4 text-gray-400">{sale.EstadoSanitizado}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sale.Status_de_entrega_higienizado === 'Entregue' 
                          ? 'bg-red-900 text-red-200' 
                          : sale.Status_de_entrega_higienizado === 'Em trânsito'
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-gray-600 text-gray-200'
                      }`}>
                        {sale.Status_de_entrega_higienizado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        <p>Data sourced from cleaned and sanitized Porsche sales records • Last updated today</p>
      </div>
    </div>
  );
}
