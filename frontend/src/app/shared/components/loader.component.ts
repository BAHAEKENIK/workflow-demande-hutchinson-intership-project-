import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements AfterViewInit {
  @Output() completed = new EventEmitter<void>();

  ngAfterViewInit() {
    this.initParticles();
    this.initPercentCounter();
  }

  private initParticles(): void {
    const container = document.getElementById('particlesField');
    if (!container) return;
    for (let i = 0; i < 44; i++) {
      const particle = document.createElement('div');
      const isRed = Math.random() > 0.75;
      particle.className = 'dot' + (isRed ? ' dot--red' : '');
      const size = Math.random() * 3 + 0.8;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.bottom = '-15px';
      particle.style.animationDuration = Math.random() * 14 + 9 + 's';
      particle.style.animationDelay = Math.random() * 12 + 's';
      container.appendChild(particle);
    }
  }

  private initPercentCounter(): void {
    const percentSpan = document.getElementById('dynamicPercent');
    if (!percentSpan) return;
    let startTime: number | null = null;
    const delayMs = 2200;
    const durationMs = 2900;
    let completedEmitted = false;

    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTotal = timestamp - startTime;
      const activeElapsed = Math.max(0, elapsedTotal - delayMs);
      if (activeElapsed >= durationMs) {
        percentSpan.textContent = '100%';
        if (!completedEmitted) {
          completedEmitted = true;
          this.completed.emit();
        }
        return;
      }
      let t = activeElapsed / durationMs;
      let eased = 0;
      if (t < 0.12) eased = t / 0.12 * 0.12;
      else if (t < 0.3) eased = 0.12 + (t - 0.12) / 0.18 * 0.22;
      else if (t < 0.52) eased = 0.34 + (t - 0.3) / 0.22 * 0.24;
      else if (t < 0.74) eased = 0.58 + (t - 0.52) / 0.22 * 0.24;
      else if (t < 0.92) eased = 0.82 + (t - 0.74) / 0.18 * 0.14;
      else eased = 0.96 + (t - 0.92) / 0.08 * 0.04;
      const percentVal = Math.min(100, Math.floor(eased * 100));
      percentSpan.textContent = percentVal + '%';
      requestAnimationFrame(updateCounter);
    };
    requestAnimationFrame(updateCounter);
  }
}