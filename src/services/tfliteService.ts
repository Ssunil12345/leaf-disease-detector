import { PLANT_CLASSES } from "../data/pesticides";
import { LeafResult } from "../types";
import { PESTICIDE_DATA } from "../data/pesticides";

export class TFLiteService {
  static async runInference(imageSrc: string): Promise<LeafResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate model output
    const randomIndex = Math.floor(Math.random() * PLANT_CLASSES.length);
    const disease = PLANT_CLASSES[randomIndex];
    
    // Simulate confidence (sometimes low to test threshold)
    const confidence = 0.6 + Math.random() * 0.4; 

    const [plantName, ...diseaseParts] = disease.split(" ");
    const diseaseName = diseaseParts.join(" ") || "Healthy";

    return {
      plantName: plantName || "Unknown",
      diseaseName: diseaseName,
      confidence: confidence,
      pesticideSuggestions: PESTICIDE_DATA[disease] || ["Consult a local expert."],
      timestamp: Date.now(),
      image: imageSrc
    };
  }
}
