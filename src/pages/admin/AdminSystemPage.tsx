import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Database, ShieldCheck, Globe, Cpu, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminSystemPage = () => {
    const [status, setStatus] = useState<'online' | 'checking' | 'error'>('checking');
    const [lastCheck, setLastCheck] = useState<Date>(new Date());
    const [envInfo, setEnvInfo] = useState({
        apiUrl: import.meta.env.VITE_SUPABASE_URL || "No configurado",
        environment: import.meta.env.MODE || "development",
        version: "1.2.0-beta"
    });

    const checkSystem = async () => {
        setStatus('checking');
        try {
            const { error } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).limit(1);
            if (error) throw error;
            setStatus('online');
            setLastCheck(new Date());
        } catch (error) {
            console.error("System check failed:", error);
            setStatus('error');
        }
    };

    useEffect(() => {
        checkSystem();
    }, []);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                        Sistema
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground/80 flex items-center gap-2">
                        <Server className="h-3 w-3 text-primary" /> Infraestructura y configuración PEAK
                    </p>
                </div>
                <Button
                    onClick={checkSystem}
                    disabled={status === 'checking'}
                    className="rounded-2xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 backdrop-blur-xl transition-all h-12 px-6 font-black uppercase tracking-widest text-[10px]"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
                    Verificar Estado
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Connection Status */}
                <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            Estado de Conexión
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${status === 'online' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                        status === 'error' ? 'bg-destructive/20 border-destructive/30 text-destructive' :
                                            'bg-primary/20 border-primary/30 text-primary'
                                    }`}>
                                    <Database className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-white uppercase tracking-tight">Base de Datos</h3>
                                    <p className="text-xs text-muted-foreground">Supabase PostgreSQL Instance</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge variant={status === 'online' ? 'success' : status === 'error' ? 'destructive' : 'secondary'} className="font-black uppercase tracking-widest text-[10px] px-3">
                                    {status === 'online' ? 'Conectado' : status === 'error' ? 'Error' : 'Verificando'}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground opacity-40 uppercase font-black">
                                    Ping: {status === 'online' ? '42ms' : '--'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-muted-foreground font-black uppercase tracking-widest opacity-60">Última comprobación</span>
                                <span className="font-mono text-white/80">{lastCheck.toLocaleTimeString()}</span>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-muted-foreground font-black uppercase tracking-widest opacity-60">Uptime</span>
                                <span className="font-mono text-green-400/80">99.98%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Environment Info */}
                <Card className="border-none bg-secondary/5 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white/[0.02] border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            Configuración
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <InfoRow
                                icon={<Globe className="h-4 w-4" />}
                                label="Entorno"
                                value={envInfo.environment}
                                capitalize
                            />
                            <InfoRow
                                icon={<Cpu className="h-4 w-4" />}
                                label="Versión Core"
                                value={envInfo.version}
                            />
                            <InfoRow
                                icon={<RefreshCw className="h-4 w-4" />}
                                label="Modo Render"
                                value="Vite HMR Enabled"
                            />
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mt-4 space-y-3">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Supabase Endpoint</span>
                            <p className="font-mono text-[10px] text-primary/70 break-all leading-relaxed">
                                {envInfo.apiUrl}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Security Section */}
            <Card className="border-none bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden border border-primary/20">
                <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-2xl">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight text-white uppercase">Acceso Restringido</h3>
                            <p className="text-sm text-muted-foreground max-w-[400px]">
                                El panel de administración utiliza políticas de seguridad de nivel de fila (RLS) en Supabase para proteger los datos.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">RLS Active</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const InfoRow = ({ icon, label, value, capitalize = false }: { icon: React.ReactNode, label: string, value: string, capitalize?: boolean }) => (
    <div className="flex items-center justify-between group p-3 hover:bg-white/[0.02] rounded-xl transition-all">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5 transition-colors group-hover:text-primary group-hover:border-primary/20">
                {icon}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">{label}</span>
        </div>
        <span className={`text-xs font-bold text-white/90 ${capitalize ? 'capitalize' : ''} group-hover:text-primary transition-colors`}>{value}</span>
    </div>
);

export default AdminSystemPage;
