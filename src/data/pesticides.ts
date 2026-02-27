import { PesticideData } from "../types";

export const PESTICIDE_DATA: PesticideData = {
  "Tomato Late Blight": [
    "Apply copper-based fungicides.",
    "Remove and destroy infected leaves.",
    "Improve air circulation around plants."
  ],
  "Apple Scab": [
    "Use sulfur or copper sprays.",
    "Rake and burn fallen leaves in autumn.",
    "Prune trees to improve sunlight penetration."
  ],
  "Potato Early Blight": [
    "Use chlorothalonil or mancozeb fungicides.",
    "Rotate crops every 3 years.",
    "Avoid overhead watering."
  ],
  "Grape Black Rot": [
    "Apply myclobutanil fungicides.",
    "Prune and remove mummified berries.",
    "Ensure vines are well-spaced for airflow."
  ],
  "Healthy": [
    "No pesticide needed.",
    "Maintain regular watering and fertilization.",
    "Monitor for early signs of pests."
  ]
};

export const PLANT_CLASSES = [
  "Tomato Late Blight",
  "Apple Scab",
  "Potato Early Blight",
  "Grape Black Rot",
  "Healthy"
];
