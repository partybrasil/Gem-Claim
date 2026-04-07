function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function rankFromScore(score) {
  if (score >= 96) {
    return 'S';
  }

  if (score >= 88) {
    return 'A';
  }

  if (score >= 75) {
    return 'B';
  }

  if (score >= 60) {
    return 'C';
  }

  return 'D';
}

function scoreLowerIsBetter(value, excellent, good, acceptable) {
  if (value <= excellent) {
    return 100;
  }

  if (value <= good) {
    return clampScore(100 - ((value - excellent) / (good - excellent)) * 12);
  }

  if (value <= acceptable) {
    return clampScore(88 - ((value - good) / (acceptable - good)) * 18);
  }

  return clampScore(70 - ((value - acceptable) / acceptable) * 50);
}

function scoreHigherIsBetter(value, excellent, good, acceptable) {
  if (value >= excellent) {
    return 100;
  }

  if (value >= good) {
    return clampScore(88 + ((value - good) / (excellent - good)) * 12);
  }

  if (value >= acceptable) {
    return clampScore(70 + ((value - acceptable) / (good - acceptable)) * 18);
  }

  return clampScore((value / acceptable) * 70);
}

function formatMs(value) {
  return `${Math.round(value)} ms`;
}

function formatSeconds(value) {
  return `${value.toFixed(2)} s`;
}

function getNavigationMetrics() {
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const paintEntries = performance.getEntriesByType('paint');
  const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint');
  const firstContentfulPaint = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

  if (!navigationEntry) {
    return {
      loadTimeMs: 0,
      domContentLoadedMs: 0,
      firstPaintMs: firstPaint?.startTime ?? 0,
      firstContentfulPaintMs: firstContentfulPaint?.startTime ?? 0
    };
  }

  return {
    loadTimeMs: navigationEntry.loadEventEnd || navigationEntry.duration,
    domContentLoadedMs: navigationEntry.domContentLoadedEventEnd,
    firstPaintMs: firstPaint?.startTime ?? 0,
    firstContentfulPaintMs: firstContentfulPaint?.startTime ?? 0
  };
}

export function sampleFrameRate(sampleMs = 1800) {
  return new Promise((resolve) => {
    let frameCount = 0;
    let previousTime = performance.now();
    let totalFrameTime = 0;
    let worstFrameTime = 0;
    const startedAt = previousTime;

    function step(now) {
      const delta = now - previousTime;
      previousTime = now;

      if (frameCount > 0) {
        totalFrameTime += delta;
        worstFrameTime = Math.max(worstFrameTime, delta);
      }

      frameCount += 1;

      if (now - startedAt >= sampleMs) {
        const elapsed = now - startedAt;
        const averageFrameTime = frameCount > 1 ? totalFrameTime / (frameCount - 1) : 0;
        const fps = elapsed > 0 ? (frameCount / elapsed) * 1000 : 0;

        resolve({
          fps,
          sampleMs: elapsed,
          averageFrameTime,
          worstFrameTime
        });
        return;
      }

      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  });
}

function getMemoryMetrics() {
  if (!performance.memory) {
    return null;
  }

  const usedHeapMb = performance.memory.usedJSHeapSize / 1024 / 1024;
  const totalHeapMb = performance.memory.totalJSHeapSize / 1024 / 1024;

  return {
    usedHeapMb,
    totalHeapMb
  };
}

export async function runPerformanceAudit({ refreshBenchmark }) {
  const navigation = getNavigationMetrics();
  const frameRate = await sampleFrameRate();
  const refreshResult = await refreshBenchmark();
  const memory = getMemoryMetrics();

  const metrics = [
    {
      id: 'load-time',
      label: 'Carga inicial',
      value: navigation.loadTimeMs,
      displayValue: formatSeconds(navigation.loadTimeMs / 1000),
      score: scoreLowerIsBetter(navigation.loadTimeMs, 1400, 2200, 3200),
      detail: 'Tiempo total desde la navegación hasta el final del evento load.'
    },
    {
      id: 'first-contentful-paint',
      label: 'First Contentful Paint',
      value: navigation.firstContentfulPaintMs,
      displayValue: navigation.firstContentfulPaintMs ? formatMs(navigation.firstContentfulPaintMs) : 'No disponible',
      score: navigation.firstContentfulPaintMs
        ? scoreLowerIsBetter(navigation.firstContentfulPaintMs, 900, 1500, 2200)
        : 65,
      detail: 'Primer momento real en que el navegador pintó contenido visible.'
    },
    {
      id: 'dom-content-loaded',
      label: 'DOM Ready',
      value: navigation.domContentLoadedMs,
      displayValue: formatMs(navigation.domContentLoadedMs),
      score: scoreLowerIsBetter(navigation.domContentLoadedMs, 900, 1500, 2400),
      detail: 'Tiempo hasta que la estructura principal quedó lista para interacción.'
    },
    {
      id: 'refresh-reactor',
      label: 'Refresh Reactor',
      value: refreshResult.durationMs,
      displayValue: formatMs(refreshResult.durationMs),
      score: scoreLowerIsBetter(refreshResult.durationMs, 500, 1000, 1800),
      detail: 'Benchmark real del refresh del feed ejecutado en el momento del test.'
    },
    {
      id: 'fps-monitor',
      label: 'HUD Frame Rate',
      value: frameRate.fps,
      displayValue: `${Math.round(frameRate.fps)} FPS`,
      score: scoreHigherIsBetter(frameRate.fps, 58, 48, 36),
      detail: `Muestreo real de ${Math.round(frameRate.sampleMs)} ms usando requestAnimationFrame.`
    },
    {
      id: 'frame-consistency',
      label: 'Frame Consistency',
      value: frameRate.worstFrameTime,
      displayValue: formatMs(frameRate.worstFrameTime),
      score: scoreLowerIsBetter(frameRate.worstFrameTime, 24, 40, 60),
      detail: 'Peor frame detectado durante la muestra; ayuda a encontrar microtirones.'
    }
  ];

  if (memory) {
    metrics.push({
      id: 'js-heap',
      label: 'JS Heap',
      value: memory.usedHeapMb,
      displayValue: `${memory.usedHeapMb.toFixed(1)} / ${memory.totalHeapMb.toFixed(1)} MB`,
      score: scoreLowerIsBetter(memory.usedHeapMb, 80, 140, 220),
      detail: 'Uso actual de memoria JavaScript reportado por el navegador.'
    });
  }

  const averageScore = clampScore(
    metrics.reduce((total, metric) => total + metric.score, 0) / metrics.length
  );

  return {
    score: averageScore,
    rank: rankFromScore(averageScore),
    completedAt: new Date().toISOString(),
    metrics,
    summary: {
      averageFps: frameRate.fps,
      averageFrameTime: frameRate.averageFrameTime,
      refreshCount: refreshResult.count,
      refreshSource: refreshResult.source
    }
  };
}
