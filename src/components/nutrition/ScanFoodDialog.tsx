import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X } from "lucide-react";
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
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (open && !scannerRef.current) {
            // Small timeout to ensure DOM is ready
            const timer = setTimeout(() => {
                startScanner();
            }, 100);
            return () => clearTimeout(timer);
        } else if (!open && scannerRef.current) {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [open]);

    const startScanner = () => {
        try {
            setScanning(true);

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8]
            };

            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                config,
        /* verbose= */ false
            );

            scannerRef.current.render(onScanSuccess, onScanFailure);
        } catch (err) {
            console.error("Error starting scanner:", err);
            setScanning(false);
        }
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.clear();
            } catch (e) {
                console.error("Error clearing scanner", e);
            }
            scannerRef.current = null;
            setScanning(false);
        }
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

                <div className="flex flex-col items-center justify-center p-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Buscando producto...</p>
                        </div>
                    ) : (
                        <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-black/5" />
                    )}

                    <p className="mt-4 text-xs text-center text-muted-foreground">
                        Apunta la cámara al código de barras del producto.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
