
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MuscleData } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MuscleDistributionChartProps {
    data: MuscleData[];
}

const MuscleDistributionChart = ({ data }: MuscleDistributionChartProps) => {
    if (data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Distribución Muscular</CardTitle>
                    <CardDescription>Series efectivas por grupo muscular</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No hay datos suficientes
                </CardContent>
            </Card>
        );
    }

    // Filter out tiny values for cleaner chart, or keep top 5 + Others
    const chartData = data.filter(d => d.value > 0);

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle>Distribución Muscular</CardTitle>
                <CardDescription>Series efectivas por grupo muscular (Total)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full flex flex-col items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))',
                                    color: 'hsl(var(--foreground))'
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value: number) => [`${value} series`, 'Volumen']}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-wrap justify-center gap-2 mt-2 px-2">
                        {chartData.slice(0, 5).map((entry, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                                <span className="text-muted-foreground">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MuscleDistributionChart;
