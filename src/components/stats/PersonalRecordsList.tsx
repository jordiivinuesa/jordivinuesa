
import { PRData } from '@/hooks/useStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PersonalRecordsListProps {
    data: PRData[];
}

const PersonalRecordsList = ({ data }: PersonalRecordsListProps) => {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Récords Personales (PRs)
                </CardTitle>
                <CardDescription>Tus mejores levantamientos estimados (1RM)</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                        <Trophy className="h-8 w-8 mb-2 opacity-20" />
                        <p>Aún no hay récords registrados</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.map((pr, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-sm">{pr.exerciseName}</span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="text-primary font-medium">{pr.weight}kg × {pr.reps}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(parseISO(pr.date), 'd MMM yyyy', { locale: es })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">1RM Est.</span>
                                    <span className="text-lg font-bold font-display text-foreground">{Math.round(pr.estimated1RM)} kg</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PersonalRecordsList;
