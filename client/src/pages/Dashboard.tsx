import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownToLine, CalendarDays, CarFront, ChevronLeft, ChevronRight, DollarSign, Filter, MapPin, RotateCcw, Search, Truck } from "lucide-react";
import dashboardData from "@/data/dashboard.json";

type Sale = {
  sale_id: number;
  DataDaVendaSanitizada: string;
  nome_do_cliente: string;
  PorscheModelSanitized: string;
  Preço_de_vendaSanitizado: number;
  EstadoSanitizado: string;
  Status_de_entrega_higienizado: string;
  Método_de_pagamentoSanitizado?: string;
};

const sales = dashboardData.recentSales as Sale[];
const chartColors = ["#d71920", "#f16b70", "#f49a9d", "#c9a96e", "#8a8f98", "#e5c8c9", "#6f2528", "#b8bcc2"];
const panelClass = "rounded-2xl border border-white/10 bg-[#151719] shadow-[0_16px_50px_rgba(0,0,0,0.22)]";
const inputClass = "w-full rounded-lg border border-white/10 bg-[#101214] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-500";
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Data inválida";
  return dateFormat.format(new Date(`${value}T00:00:00Z`));
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof DollarSign }) {
  return (
    <article className={`${panelClass} relative overflow-hidden p-5`}>
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-red-700 via-red-500 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </div>
        <span className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-red-400"><Icon size={18} aria-hidden="true" /></span>
      </div>
    </article>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className={`${panelClass} min-w-0 p-5`}>
      <div className="mb-4">
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [state, setState] = useState("");
  const [model, setModel] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const states = useMemo(() => Array.from(new Set(sales.map((sale) => sale.EstadoSanitizado).filter((item) => item && item !== "INVÁLIDO"))).sort(), []);
  const models = useMemo(() => Array.from(new Set(sales.map((sale) => sale.PorscheModelSanitized).filter(Boolean))).sort(), []);

  const filteredSales = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return sales.filter((sale) => {
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(sale.DataDaVendaSanitizada);
      if (startDate && (!validDate || sale.DataDaVendaSanitizada < startDate)) return false;
      if (endDate && (!validDate || sale.DataDaVendaSanitizada > endDate)) return false;
      if (state && sale.EstadoSanitizado !== state) return false;
      if (model && sale.PorscheModelSanitized !== model) return false;
      if (normalizedQuery) {
        const haystack = `${sale.sale_id} ${sale.nome_do_cliente} ${sale.PorscheModelSanitized} ${sale.EstadoSanitizado} ${sale.Status_de_entrega_higienizado}`.toLocaleLowerCase("pt-BR");
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [startDate, endDate, state, model, query]);

  const metrics = useMemo(() => {
    const revenue = filteredSales.reduce((sum, sale) => sum + (Number(sale.Preço_de_vendaSanitizado) || 0), 0);
    const delivered = filteredSales.filter((sale) => sale.Status_de_entrega_higienizado === "Entregue").length;
    return {
      revenue,
      average: filteredSales.length ? revenue / filteredSales.length : 0,
      count: filteredSales.length,
      delivered,
      deliveryRate: filteredSales.length ? (delivered / filteredSales.length) * 100 : 0,
    };
  }, [filteredSales]);

  const modelChart = useMemo(() => {
    const counts = new Map<string, number>();
    filteredSales.forEach((sale) => counts.set(sale.PorscheModelSanitized, (counts.get(sale.PorscheModelSanitized) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, vendas]) => ({ name, vendas })).sort((a, b) => b.vendas - a.vendas).slice(0, 6);
  }, [filteredSales]);

  const stateChart = useMemo(() => {
    const counts = new Map<string, number>();
    filteredSales.filter((sale) => sale.EstadoSanitizado && sale.EstadoSanitizado !== "INVÁLIDO").forEach((sale) => counts.set(sale.EstadoSanitizado, (counts.get(sale.EstadoSanitizado) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, vendas]) => ({ name, vendas })).sort((a, b) => b.vendas - a.vendas).slice(0, 8);
  }, [filteredSales]);

  const deliveryChart = useMemo(() => {
    const counts = new Map<string, number>();
    filteredSales.forEach((sale) => counts.set(sale.Status_de_entrega_higienizado || "Sem status", (counts.get(sale.Status_de_entrega_higienizado || "Sem status") ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const priceChart = useMemo(() => {
    const buckets = new Map<string, number[]>();
    filteredSales.forEach((sale) => buckets.set(sale.PorscheModelSanitized, [...(buckets.get(sale.PorscheModelSanitized) ?? []), Number(sale.Preço_de_vendaSanitizado) || 0]));
    return Array.from(buckets.entries()).map(([name, prices]) => ({ name, preço: prices.reduce((a: number, b: number) => a + b, 0) / prices.length })).sort((a, b) => b.preço - a.preço).slice(0, 8);
  }, [filteredSales]);

  const sortedSales = useMemo(() => [...filteredSales].sort((a, b) => b.sale_id - a.sale_id), [filteredSales]);
  const pageCount = Math.max(1, Math.ceil(sortedSales.length / pageSize));
  const visibleSales = sortedSales.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = Boolean(startDate || endDate || state || model || query);

  const resetFilters = () => {
    setStartDate(""); setEndDate(""); setState(""); setModel(""); setQuery(""); setPage(1);
  };

  const downloadCsv = () => {
    const headers = ["ID", "Data", "Cliente", "Modelo", "Preço USD", "Estado", "Entrega", "Pagamento"];
    const rows = filteredSales.map((sale) => [sale.sale_id, sale.DataDaVendaSanitizada, sale.nome_do_cliente, sale.PorscheModelSanitized, sale.Preço_de_vendaSanitizado, sale.EstadoSanitizado, sale.Status_de_entrega_higienizado, sale.Método_de_pagamentoSanitizado ?? ""]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "porsche-sales-filtrado.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#0b0d0f] px-4 py-6 text-gray-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div className="border-l-2 border-red-600 pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">Sales intelligence · USD</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Porsche Sales Insights</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">Visão interativa das vendas por modelo, região, valor e status de entrega.</p>
          </div>
          <button onClick={downloadCsv} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400">
            <ArrowDownToLine size={16} aria-hidden="true" /> Exportar CSV
          </button>
        </header>

        <section className={`${panelClass} mb-6 p-5`} aria-labelledby="filters-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Filter size={17} className="text-red-400" /><h2 id="filters-title" className="font-semibold text-white">Filtros</h2><span className="text-xs text-gray-500">{filteredSales.length} de {sales.length} registros</span></div>
            {hasFilters && <button onClick={resetFilters} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white"><RotateCcw size={14} /> Limpar filtros</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs text-gray-400">Data inicial<input aria-label="Data inicial" type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPage(1); }} className={`${inputClass} mt-1.5`} /></label>
            <label className="text-xs text-gray-400">Data final<input aria-label="Data final" type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setPage(1); }} className={`${inputClass} mt-1.5`} /></label>
            <label className="text-xs text-gray-400">Estado<select aria-label="Filtrar por estado" value={state} onChange={(event) => { setState(event.target.value); setPage(1); }} className={`${inputClass} mt-1.5`}><option value="">Todos os estados</option>{states.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-xs text-gray-400">Modelo<select aria-label="Filtrar por modelo" value={model} onChange={(event) => { setModel(event.target.value); setPage(1); }} className={`${inputClass} mt-1.5`}><option value="">Todos os modelos</option>{models.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-xs text-gray-400">Busca livre<span className="relative mt-1.5 block"><Search size={15} className="absolute left-3 top-3 text-gray-500" /><input aria-label="Buscar vendas" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cliente, ID, modelo…" className={`${inputClass} pl-9`} /></span></label>
          </div>
        </section>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores de vendas">
          <MetricCard label="Vendas totais" value={compactCurrency.format(metrics.revenue)} detail={`${metrics.count} registros no filtro`} icon={DollarSign} />
          <MetricCard label="Ticket médio" value={currency.format(metrics.average)} detail="Valor médio por veículo" icon={CarFront} />
          <MetricCard label="Veículos entregues" value={`${metrics.delivered}`} detail={`${metrics.deliveryRate.toFixed(1)}% dos registros filtrados`} icon={Truck} />
          <MetricCard label="Estados com vendas" value={`${new Set(filteredSales.map((sale) => sale.EstadoSanitizado).filter((item) => item && item !== "INVÁLIDO")).size}`} detail="Estados presentes no resultado" icon={MapPin} />
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-2" aria-label="Gráficos de vendas">
          <ChartPanel title="Modelos mais vendidos" subtitle="Quantidade de registros por modelo (top 6)">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={modelChart} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={55} /><YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#17191b", border: "1px solid #3f4144", borderRadius: 10 }} /><Bar dataKey="vendas" name="Vendas" fill="#d71920" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Preço médio por modelo" subtitle="Preço médio em dólares (top 8 modelos)">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={priceChart} margin={{ top: 8, right: 10, left: 4, bottom: 8 }}><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} /><YAxis tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={48} /><Tooltip formatter={(value) => currency.format(Number(value))} contentStyle={{ background: "#17191b", border: "1px solid #3f4144", borderRadius: 10 }} /><Line type="monotone" dataKey="preço" name="Preço médio" stroke="#e04b51" strokeWidth={2.5} dot={{ fill: "#e04b51", r: 3 }} /></LineChart></ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Status de entrega" subtitle="Distribuição dos pedidos filtrados">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deliveryChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>{deliveryChart.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ background: "#17191b", border: "1px solid #3f4144", borderRadius: 10 }} /><Legend verticalAlign="bottom" height={40} wrapperStyle={{ color: "#a1a1aa", fontSize: 11 }} /></PieChart></ResponsiveContainer>
          </ChartPanel>
          <ChartPanel title="Vendas por estado" subtitle="Estados com maior número de registros (top 8)">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={stateChart} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}><CartesianGrid stroke="#ffffff12" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={44} tick={{ fill: "#d1d5db", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#17191b", border: "1px solid #3f4144", borderRadius: 10 }} /><Bar dataKey="vendas" name="Vendas" fill="#d71920" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer>
          </ChartPanel>
        </section>

        <section className={`${panelClass} overflow-hidden`} aria-labelledby="sales-table-title">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 p-5">
            <div><h2 id="sales-table-title" className="font-semibold text-white">Registros de vendas</h2><p className="mt-1 text-xs text-gray-500">Ordenados do ID mais recente para o mais antigo</p></div>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500"><CalendarDays size={14} /> {filteredSales.length} resultados</span>
          </div>
          {visibleSales.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-white/[0.025] text-[11px] uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-3 font-medium">ID</th><th className="px-5 py-3 font-medium">Data</th><th className="px-5 py-3 font-medium">Cliente</th><th className="px-5 py-3 font-medium">Modelo</th><th className="px-5 py-3 font-medium">Preço (USD)</th><th className="px-5 py-3 font-medium">Estado</th><th className="px-5 py-3 font-medium">Entrega</th></tr></thead><tbody className="divide-y divide-white/[0.06]">{visibleSales.map((sale) => <tr key={sale.sale_id} className="transition hover:bg-white/[0.025]"><td className="px-5 py-3.5 text-gray-500">#{sale.sale_id}</td><td className="px-5 py-3.5 whitespace-nowrap text-gray-400">{formatDate(sale.DataDaVendaSanitizada)}</td><td className="px-5 py-3.5 text-gray-300">{sale.nome_do_cliente || "—"}</td><td className="px-5 py-3.5 font-medium text-white">{sale.PorscheModelSanitized || "—"}</td><td className="px-5 py-3.5 whitespace-nowrap font-medium text-gray-200">{currency.format(Number(sale.Preço_de_vendaSanitizado) || 0)}</td><td className="px-5 py-3.5 text-gray-400">{sale.EstadoSanitizado || "—"}</td><td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${sale.Status_de_entrega_higienizado === "Entregue" ? "bg-emerald-500/10 text-emerald-300" : sale.Status_de_entrega_higienizado === "Cancelado" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>{sale.Status_de_entrega_higienizado || "Sem status"}</span></td></tr>)}</tbody></table></div> : <div className="p-12 text-center text-sm text-gray-500">Nenhuma venda encontrada com esses filtros.</div>}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-xs text-gray-500"><span>Página {page} de {pageCount}</span><div className="flex gap-2"><button aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-white/10 p-2 text-gray-300 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button><button aria-label="Próxima página" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-white/10 p-2 text-gray-300 enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button></div></div>
        </section>

        <footer className="mt-6 flex flex-col gap-1 border-t border-white/10 pt-5 text-xs text-gray-600 sm:flex-row sm:justify-between"><span>Porsche Sales Insights · Painel demonstrativo</span><span>Valores em USD · {sales.length} registros carregados localmente</span></footer>
      </div>
    </main>
  );
}
