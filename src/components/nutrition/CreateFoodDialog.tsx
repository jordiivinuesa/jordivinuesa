import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FoodItem } from "@/data/foods";
import { Camera, Save, X, Loader2, ScanText } from "lucide-react";
import { useDbSync } from "@/hooks/useDbSync";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/hooks/use-toast";
import { createWorker } from "tesseract.js";

interface CreateFoodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialBarcode?: string;
    onFoodCreated?: (food: FoodItem) => void;
}

export const CreateFoodDialog = ({ open, onOpenChange, initialBarcode = "", onFoodCreated }: CreateFoodDialogProps) => {
    const { addCustomFood, removeCustomFood } = useAppStore();
    const { saveCustomFoodToDb } = useDbSync();
    const [photoMode, setPhotoMode] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const extractNutritionalData = (text: string) => {
        const normalize = (str: string) => str.toLowerCase().replace(/,/g, ".").replace(/\s+/g, " ");
        const textLower = normalize(text);

        const findValue = (keywords: string[]) => {
            for (const keyword of keywords) {
                // Regex looks for the keyword, followed by optional non-digit chars (like : or space), 
                // then captures a number (integer or decimal), 
                // and optionally followed by units like g, kj, kcal.
                const regex = new RegExp(`${keyword}[^0-9]*([0-9]+\\.?[0-9]*)`, "i");
                const match = textLower.match(regex);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return "";
        };

        return {
            calories: findValue(["valor energ", "energ", "calor", "kcal", "energy"]),
            protein: findValue(["prote", "prot"]),
            carbs: findValue(["hidratos", "carbohidratos", "carb", "h. de carbono"]),
            fat: findValue(["grasas", "grasa", "fat", "lipidos"]),
        };
    };

    const analyzeImage = async () => {
        if (!capturedImage) return;

        setIsAnalyzing(true);
        try {
            const worker = await createWorker("spa"); // Load Spanish language data
            const { data: { text } } = await worker.recognize(capturedImage);
            await worker.terminate();

            console.log("OCR Text:", text); // For debugging
            const extracted = extractNutritionalData(text);

            setFormData(prev => ({
                ...prev,
                calories: extracted.calories || prev.calories,
                protein: extracted.protein || prev.protein,
                carbs: extracted.carbs || prev.carbs,
                fat: extracted.fat || prev.fat,
            }));

            const foundCount = Object.values(extracted).filter(Boolean).length;
            if (foundCount > 0) {
                toast({ title: "Datos extraídos", description: `Se han detectado ${foundCount} valores nutricionales.` });
            } else {
                toast({ title: "Sin resultados", description: "No se pudieron detectar valores claros en la imagen." });
            }
        } catch (error) {
            console.error("OCR Error:", error);
            toast({ title: "Error", description: "Falló el análisis de la imagen.", variant: "destructive" });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const startCamera = async () => {
        try {
            setPhotoMode(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast({ title: "Error", description: "No se pudo acceder a la cámara", variant: "destructive" });
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                setCapturedImage(canvas.toDataURL("image/png"));
                stopCamera();
                setPhotoMode(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.calories || !formData.protein || !formData.carbs || !formData.fat) {
            toast({ title: "Faltan datos", description: "Por favor rellena todos los campos obligatorios", variant: "destructive" });
            return;
        }

        const newFood: FoodItem = {
            id: initialBarcode ? `off_${initialBarcode}` : crypto.randomUUID(),
            name: formData.brand ? `${formData.name} (${formData.brand})` : formData.name,
            category: "snacks", // Default
            calories: parseFloat(formData.calories),
            protein: parseFloat(formData.protein),
            carbs: parseFloat(formData.carbs),
            fat: parseFloat(formData.fat),
            fiber: 0
        };

        try {
            addCustomFood(newFood);
            await saveCustomFoodToDb(newFood);

            if (onFoodCreated) onFoodCreated(newFood);
            onOpenChange(false);

            // Reset form
            setFormData({ name: "", brand: "", calories: "", protein: "", carbs: "", fat: "" });
            setCapturedImage(null);
            toast({ title: "Guardado", description: "Alimento personalizado creado con éxito" });
        } catch (error: any) {
            if (error.message === "NAME_EXISTS") {
                toast({ title: "Error", description: "Ya existe un alimento con ese nombre. Por favor, elige otro nombre.", variant: "destructive" });
                // Revert local store add if db save failed
                removeCustomFood(newFood.id);
            } else {
                toast({ title: "Error", description: "Error al guardar el alimento.", variant: "destructive" });
                // Optional: revert here too if we want strict consistency
                removeCustomFood(newFood.id);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                stopCamera();
                setPhotoMode(false);
            }
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-md bg-card border-border sm:max-w-[500px] h-[90vh] sm:h-auto flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 pb-2 border-b border-border/50">
                    <DialogTitle className="font-display">Crear Alimento</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 gap-4 flex flex-col">

                    {/* Photo Reference Section */}
                    <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-xs font-semibold text-muted-foreground">FOTO DE TABLA NUTRICIONAL (REFERENCIA)</Label>
                            {capturedImage && (
                                <Button variant="ghost" size="sm" onClick={() => setCapturedImage(null)} className="h-6 w-6 p-0 text-muted-foreground">
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {photoMode ? (
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                <Button onClick={capturePhoto} className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full h-12 w-12 p-0 bg-white hover:bg-white/90">
                                    <div className="h-10 w-10 rounded-full border-2 border-black" />
                                </Button>
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        ) : capturedImage ? (
                            <div className="rounded-lg overflow-hidden bg-black aspect-video relative group">
                                <img src={capturedImage} alt="Referencia" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={analyzeImage}
                                        disabled={isAnalyzing}
                                        className="bg-white text-black hover:bg-white/90 font-medium"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Analizando...
                                            </>
                                        ) : (
                                            <>
                                                <ScanText className="mr-2 h-4 w-4" />
                                                Extraer Datos
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {/* Mobile friendly always visible button if needed, but group-hover is fine for now usually. 
                                    Actually for mobile touch, hover isn't great. Let's make it always visible or visible on tap. 
                                    Better yet, place it clearly below or as an overlay that is always there.
                                */}
                                <div className="absolute bottom-2 right-2 flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={analyzeImage}
                                        disabled={isAnalyzing}
                                        className="bg-primary text-primary-foreground shadow-lg h-8 px-3 text-xs"
                                    >
                                        {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <ScanText className="h-3 w-3 mr-1" />}
                                        {isAnalyzing ? "Analizando..." : "Extraer"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={startCamera} variant="outline" className="w-full gap-2 py-8 bg-background/50 border-dashed">
                                <Camera className="h-5 w-5 text-muted-foreground" />
                                <span className="text-muted-foreground">Tomar foto de referencia</span>
                            </Button>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Usa la foto para copiar los valores nutricionales más fácilmente.
                        </p>
                    </div>

                    <form id="create-food-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="name">Nombre del alimento</Label>
                                <Input
                                    id="name" name="name" placeholder="Ej: Galletas de avena"
                                    value={formData.name} onChange={handleChange} required
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="brand">Marca (Opcional)</Label>
                                <Input
                                    id="brand" name="brand" placeholder="Ej: Hacendado"
                                    value={formData.brand} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="calories">Calorías (kcal)</Label>
                                <Input
                                    id="calories" name="calories" type="number" placeholder="0"
                                    value={formData.calories} onChange={handleChange}
                                    min="0" max="9999" step="0.1" required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="protein">Proteínas (g)</Label>
                                <Input
                                    id="protein" name="protein" type="number" placeholder="0"
                                    value={formData.protein} onChange={handleChange}
                                    min="0" max="999" step="0.1" required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="carbs">Carbohidratos (g)</Label>
                                <Input
                                    id="carbs" name="carbs" type="number" placeholder="0"
                                    value={formData.carbs} onChange={handleChange}
                                    min="0" max="999" step="0.1" required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fat">Grasas (g)</Label>
                                <Input
                                    id="fat" name="fat" type="number" placeholder="0"
                                    value={formData.fat} onChange={handleChange}
                                    min="0" max="999" step="0.1" required
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Introduce valores por cada 100g de producto</p>
                    </form>
                </div>

                <DialogFooter className="p-4 border-t border-border/50">
                    <Button type="submit" form="create-food-form" className="w-full gap-2 text-white font-semibold shadow-lg shadow-primary/20">
                        <Save className="h-4 w-4" />
                        Guardar Alimento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
