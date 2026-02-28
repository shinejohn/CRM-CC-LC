import { DataCard } from "@/components/shared";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const data = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 5000 },
    { name: 'Mar', value: 4500 },
    { name: 'Apr', value: 6780 },
    { name: 'May', value: 5890 },
    { name: 'Jun', value: 8390 },
    { name: 'Jul', value: 10490 },
];

export function DataReportPanel({ title }: { title: string }) {
    return (
        <DataCard title={title}>
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--nexus-brand-primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--nexus-brand-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--nexus-divider)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--nexus-text-tertiary)', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--nexus-text-tertiary)', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--nexus-card-bg)', borderColor: 'var(--nexus-card-border)', borderRadius: '8px', color: 'var(--nexus-text-primary)' }}
                            itemStyle={{ color: 'var(--nexus-brand-primary)' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                        />
                        <Area type="monotone" dataKey="value" stroke="var(--nexus-brand-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </DataCard>
    );
}
