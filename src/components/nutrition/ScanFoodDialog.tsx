import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X, RefreshCw } from "lucide-react";
import { searchProductByBarcode } from "@/services/openFoodFacts";
import { FoodItem } from "@/data/foods";
import { toast } from "@/hooks/use-toast";

interface ScanFoodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFoodFound: (food: FoodItem) => void;
    onScanError: (barcode: string) => void;
}

export const ScanFoodDialog = ({ open, onOpenChange, onFoodFound, onScanError }: ScanFoodDialogProps) => {
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                startScanner();
            }, 300);
            return () => clearTimeout(timer);
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [open]);

    const startScanner = async () => {
        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode("reader");
            }

            const config = {
                fps: 20, // Increase FPS for smoother detection
                qrbox: { width: 280, height: 180 }, // Rectangle better for barcodes
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.CODE_128
                ]
            };

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanFailure
            );
            setScanning(true);
            setHasCamera(true);
        } catch (err) {
            console.error("Error starting scanner:", err);
            setScanning(false);
            setHasCamera(false);
            toast({
                title: "Error de cámara",
                description: "No se pudo acceder a la cámara trasera. Asegúrate de dar permisos.",
                variant: "destructive",
            });
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (e) {
                console.error("Error stopping scanner", e);
            }
        }
        setScanning(false);
    };

    const onScanSuccess = async (decodedText: string) => {
        if (loading) return;

        stopScanner();
        setLoading(true);

        try {
            const food = await searchProductByBarcode(decodedText);
            if (food) {
                onFoodFound(food);
                onOpenChange(false);
            } else {
                onScanError(decodedText);
                onOpenChange(false);
            }
        } catch (error) {
            console.error("Error processing scan:", error);
            toast({
                title: "Error",
                description: "No se pudo procesar el código de barras.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const onScanFailure = (error: any) => {
        // Ignore frequent scan errors as the camera searches for a code
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-border sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center font-display">Escanear código de barras</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-4 min-h-[350px]">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Buscando producto...</p>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square max-w-[300px]">
                            <div id="reader" className="w-full h-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-black/40 shadow-2xl" />
                            {!scanning && !hasCamera && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                                    <Camera className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-sm font-medium mb-4">No se pudo iniciar la cámara</p>
                                    <Button onClick={startScanner} variant="outline" className="gap-2 rounded-xl">
                                        <RefreshCw className="h-4 w-4" />
                                        Reintentar
                                    </Button>
                                </div>
                            )}
                            {scanning && (
                                <div className="absolute inset-0 pointer-events-none border-2 border-primary/50 rounded-2xl animate-pulse" />
                            )}
                        </div>
                    )}

                    <p className="mt-6 text-xs text-center text-muted-foreground px-4 leading-relaxed">
                        Apunta la cámara al código de barras. <br />
                        <span className="opacity-60 italic">Asegúrate de tener buena iluminación.</span>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
