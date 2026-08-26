import { Component, ElementRef, OnInit, ViewChild, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Regisztráljuk a Chart.js elemeit (vonaldiagramhoz, stb.)
Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-72">
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class LineChartComponent implements OnInit {
  // Input jelként megkapja az adatokat a szülőtől (Signal-barát!)
  data = input<number[]>([]);
  labels = input<string[]>([]);

  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | undefined;

  ngOnInit() {
    this.createChart();
  }

  constructor() {
    // Reaktivitás: Ha változnak az adatok (Signal), a Chart automatikusan frissül!
    effect(() => {
      const currentData = this.data();
      const currentLabels = this.labels();
      
      if (this.chart) {
        this.chart.data.labels = currentLabels;
        this.chart.data.datasets[0].data = currentData;
        this.chart.update();
      }
    });
  }

  private createChart() {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.labels(),
        datasets: [{
          label: 'AI Kockázat (%)',
          data: this.data(),
          fill: true,
          tension: 0.4,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' }
        }
      }
    });
  }
}