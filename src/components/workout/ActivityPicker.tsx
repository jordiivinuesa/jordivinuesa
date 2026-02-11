import { useState } from "react";
import { Search } from "lucide-react";
import { activities, activityCategoryLabels, type ActivityCategory } from "@/data/activities";
import { Input } from "@/components/ui/input";
import { removeAccents } from "@/lib/utils";

interface ActivityPickerProps {
    onSelect: (activityId: string, activityName: string) => void;
}

const ActivityPicker = ({ onSelect }: ActivityPickerProps) => {
    const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>("deporte");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredActivities = activities.filter((activity) => {
        const matchesCategory = activity.category === selectedCategory;
        const matchesSearch = searchQuery
            ? removeAccents(activity.name.toLowerCase()).includes(removeAccents(searchQuery.toLowerCase()))
            : true;
        return matchesCategory && matchesSearch;
    });

    const categories: ActivityCategory[] = ["deporte", "clase_dirigida"];

    return (
        <div className="flex flex-col">
            {/* Category Tabs */}
            <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            }`}
                    >
                        {activityCategoryLabels[category]}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar actividad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl"
                    />
                </div>
            </div>

            {/* Activities Grid */}
            <div className="overflow-y-auto p-4 no-scrollbar" style={{ maxHeight: '400px' }}>
                <div className="grid grid-cols-2 gap-3">
                    {filteredActivities.map((activity) => (
                        <button
                            key={activity.id}
                            onClick={() => onSelect(activity.id, activity.name)}
                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all active:scale-95 border border-border"
                        >
                            <span className="text-3xl">{activity.icon}</span>
                            <span className="text-sm font-medium text-center">{activity.name}</span>
                            <span className="text-xs text-muted-foreground text-center line-clamp-2">
                                {activity.description}
                            </span>
                        </button>
                    ))}
                </div>

                {filteredActivities.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        No se encontraron actividades
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityPicker;
