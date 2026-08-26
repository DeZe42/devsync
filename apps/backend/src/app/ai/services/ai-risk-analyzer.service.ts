import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class AiRiskAnalyzerService implements OnModuleInit {
  private readonly logger = new Logger(AiRiskAnalyzerService.name);

  // Az AI "agya": 4 bemenetünk van, mindegyikhez tartozik egy súlyzó (weight)
  private weights: number[] = [Math.random(), Math.random(), Math.random(), Math.random()];
  // A torzítás (bias), ami segít a modellnek finomhangolni az eredményt
  private bias: number = Math.random();
  // Milyen gyorsan tanuljon a modell? (Learning rate)
  private readonly learningRate = 0.5; 

  onModuleInit() {
    this.logger.log('Natív TypeScript AI Kockázatelemző inicializálása...');
    this.trainModel();

    // --- AZONNALI TESZT ---
    const testResult1 = this.analyzePrRisk(900, 100, 15, 0.8);
    this.logger.log(`[TESZT 1] Hatalmas PR, problémás szerző -> Kockázat: ${(testResult1 * 100).toFixed(2)}%`);

    const testResult2 = this.analyzePrRisk(10, 5, 2, 0.0);
    this.logger.log(`[TESZT 2] Apró PR, megbízható szerző -> Kockázat: ${(testResult2 * 100).toFixed(2)}%`);
  }

  // Sigmoid aktivációs függvény: Bármilyen számot 0 és 1 közé szorít
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private trainModel() {
    // A mock adataink: Bemenet [Hozzáadott, Törölt, Fájlok, Hibaarány] -> Kimenet: Kockázat
    const trainingData = [
      { input: [0.01, 0.01, 0.01, 0.0], output: 0.05 }, // Kicsi PR, jó szerző -> 5%
      { input: [0.9, 0.1, 0.5, 0.8], output: 0.95 },    // Nagy PR, rossz szerző -> 95%
      { input: [0.5, 0.5, 0.2, 0.1], output: 0.3 },     // Közepes PR, jó szerző -> 30%
      { input: [0.1, 0.9, 0.1, 0.5], output: 0.4 },     // Törlések, átlagos szerző -> 40%
    ];

    // 5000-szer végigmegyünk a gyakorló adatokon (Epochs)
    for (let epoch = 0; epoch < 5000; epoch++) {
      for (const item of trainingData) {
        
        // 1. LÉPÉS: Predikció (Előrehaladás / Forward pass)
        let sum = this.bias;
        for (let i = 0; i < 4; i++) {
          sum += item.input[i] * this.weights[i];
        }
        const prediction = this.sigmoid(sum);

        // 2. LÉPÉS: Mekkorát tévedtünk? (Hiba kiszámítása)
        const error = item.output - prediction;

        // 3. LÉPÉS: Tanulás (Visszaterjesztés / Backpropagation)
        // A sigmoid deriváltja segítségével megmondjuk, merre és mennyit módosítsuk a súlyokat
        const gradient = error * prediction * (1 - prediction);

        for (let i = 0; i < 4; i++) {
          this.weights[i] += this.learningRate * gradient * item.input[i];
        }
        this.bias += this.learningRate * gradient;
      }
    }
    
    this.logger.log('AI modell betanítása befejeződött (Natív TS).');
  }

  public analyzePrRisk(addedLines: number, deletedLines: number, filesCount: number, authorErrorRate: number): number {
    // A valós adatokat be kell szorítanunk 0 és 1 közé, ahogy a tanításnál is tettük
    const normalizedInput = [
      Math.min(addedLines / 1000, 1),
      Math.min(deletedLines / 1000, 1),
      Math.min(filesCount / 50, 1),
      Math.min(authorErrorRate, 1)
    ];

    // Az éles predikció: Bemenetek felszorzása a megtanult súlyokkal, majd Sigmoid aktiváció
    let sum = this.bias;
    for (let i = 0; i < 4; i++) {
      sum += normalizedInput[i] * this.weights[i];
    }

    return this.sigmoid(sum);
  }
}