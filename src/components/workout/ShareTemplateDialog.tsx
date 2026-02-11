
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Send, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTemplateSharing } from "@/hooks/useTemplateSharing";
import type { WorkoutTemplate } from "@/store/useAppStore";
import { removeAccents } from "@/lib/utils";

interface ShareTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: WorkoutTemplate | null;
}

const ShareTemplateDialog = ({ open, onOpenChange, template }: ShareTemplateDialogProps) => {
    const { mutualFriends, loading, fetchMutualFriends, shareTemplate } = useTemplateSharing();
    const [searchQuery, setSearchQuery] = useState("");
    const [sharingId, setSharingId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchMutualFriends();
        }
    }, [open, fetchMutualFriends]);

    const filteredFriends = mutualFriends.filter(f => {
        const name = f.display_name || "Usuario";
        return removeAccents(name.toLowerCase()).includes(removeAccents(searchQuery.toLowerCase()));
    });

    const handleShare = async (friendId: string) => {
        if (!template) return;
        setSharingId(friendId);
        const success = await shareTemplate(friendId, template);
        if (success) {
            onOpenChange(false);
        }
        setSharingId(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-[380px] rounded-2xl p-0 flex flex-col overflow-hidden">
                <DialogHeader className="p-4 border-b border-border">
                    <DialogTitle className="font-display text-center">Compartir Plantilla</DialogTitle>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                        Solo puedes compartir con amigos mutuos
                    </p>
                </DialogHeader>

                <div className="p-4 bg-secondary/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar amigos..."
                            className="pl-9 bg-card border-none rounded-xl h-10"
                        />
                    </div>
                </div>

                <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1 no-scrollbar flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground">Buscando amigos...</p>
                        </div>
                    ) : filteredFriends.length > 0 ? (
                        filteredFriends.map((friend) => (
                            <div
                                key={friend.user_id}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt={friend.display_name} className="h-full w-full object-cover" />
                                        ) : (
                                            friend.display_name?.[0]?.toUpperCase() || "U"
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{friend.display_name || "Usuario"}</p>
                                        <p className="text-[10px] text-muted-foreground">Amigo mutuo</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="rounded-lg h-8 px-3"
                                    disabled={!!sharingId}
                                    onClick={() => handleShare(friend.user_id)}
                                >
                                    {sharingId === friend.user_id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-3 w-3 mr-1.5" />
                                            Enviar
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">No se encontraron amigos</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Asegúrate de que os sigáis mutuamente en la pestaña Social.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareTemplateDialog;
