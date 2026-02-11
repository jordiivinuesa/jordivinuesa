import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface FollowListSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    type: "followers" | "following";
    fetchUsers: (userId: string) => Promise<any[]>;
    onUserClick: (userId: string) => void;
}

const FollowListSheet = ({
    open,
    onOpenChange,
    userId,
    type,
    fetchUsers,
    onUserClick,
}: FollowListSheetProps) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && userId) {
            setLoading(true);
            fetchUsers(userId).then((data) => {
                setUsers(data);
                setLoading(false);
            });
        }
    }, [open, userId, type, fetchUsers]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-[32px] p-0 overflow-hidden bg-card border-none">
                <SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
                    <SheetTitle className="font-display">
                        {type === "followers" ? "Seguidores" : "Siguiendo"}
                    </SheetTitle>
                </SheetHeader>

                <div className="overflow-y-auto h-full pb-20 no-scrollbar px-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-muted-foreground">
                                {type === "followers" ? "No tiene seguidores todavía" : "No sigue a nadie todavía"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {users.map((u) => {
                                const initial = (u.display_name || "U")[0].toUpperCase();
                                return (
                                    <button
                                        key={u.user_id}
                                        onClick={() => {
                                            onUserClick(u.user_id);
                                            onOpenChange(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors text-left"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                initial
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {u.display_name || "Usuario"}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default FollowListSheet;
