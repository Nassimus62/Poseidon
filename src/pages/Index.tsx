import React, { useState } from "react";
import { FileUpload } from "@/components/poseidon/FileUpload";
import { AnalysisControls } from "@/components/poseidon/AnalysisControls";
import { DataVisualization } from "@/components/poseidon/DataVisualization";
import { EventTimeline } from "@/components/poseidon/EventTimeline";
import { ExportControls } from "@/components/poseidon/ExportControls";
import { PoseidonAnalysisEngine } from "@/components/poseidon/AnalysisEngine";
import {
  FileData,
  ProcessedData,
  DetectedEvent,
  AnalysisConfig,
} from "@/types/poseidon";
import { Waves, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(
    null
  );
  const [events, setEvents] = useState<DetectedEvent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [config, setConfig] = useState<AnalysisConfig>({
    tideRemovalMethod: "lowpass",
    extremeThreshold: 30,
    confidenceThreshold: "Medium",
  });

  const { toast } = useToast();

  const handleFileLoaded = (data: FileData) => {
    setFileData(data);
    setProcessedData(null);
    setEvents([]);

    toast({
      title: "File Loaded Successfully",
      description: `${data.filename} loaded with ${data.data.length} data points`,
    });
  };

  const runAnalysis = async () => {
    if (!fileData?.data) return;

    setIsAnalyzing(true);

    try {
      const engine = new PoseidonAnalysisEngine(fileData.data, config);
      const results = await engine.runFullAnalysis();

      setProcessedData(results.processedData);
      setEvents(results.events);

      toast({
        title: "Analysis Complete",
        description: `Detected ${results.events.length} events in the data`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description:
          "An error occurred during analysis. Please check your data and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen wave-pattern">
      {/* Header */}
      <header className="ocean-gradient text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Waves className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Poseidon</h1>
              <p className="text-primary-foreground/90">
                Advanced Oceanographic Analysis Tool
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <FileUpload onFileLoaded={handleFileLoaded} />
            <AnalysisControls
              config={config}
              onConfigChange={setConfig}
              onRunAnalysis={runAnalysis}
              isAnalyzing={isAnalyzing}
              hasData={!!fileData}
            />
            <ExportControls
              fileData={fileData}
              processedData={processedData}
              events={events}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            <DataVisualization
              data={processedData}
              events={events}
              showOriginal={true}
              showDetrended={true}
              showResiduals={true}
            />
            <EventTimeline events={events} />
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Created by "Mechat Nassim"</span>
          </div>
          <p className="text-sm">
            Poseidon uses spectral analysis, envelope detection, and machine
            learning techniques to identify tidal phases, storm surges, seiches,
            and wave patterns in sea-level data.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
