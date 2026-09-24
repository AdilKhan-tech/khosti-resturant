"use client";
import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

export default function Piechart({ items = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const chartItems = useMemo(
    () => (
      items.length
        ? items
        : [
          { label: "Completed", value: 60, color: "#007bff", className: "chart-legend-dot-completed" },
          { label: "New Orders", value: 30, color: "#28a745", className: "chart-legend-dot-order" },
          { label: "Pending", value: 10, color: "#dc3545", className: "chart-legend-dot-pending" },
        ]
    ),
    [items],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: chartItems.map((item) => item.label),
        datasets: [
          {
            data: chartItems.map((item) => item.value),
            backgroundColor: chartItems.map((item) => item.color),
            borderWidth: 0
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [chartItems]);

  return (
    <div className="piechart-container d-flex flex-column align-items-center">
      <div className="piechart-canvas-wrap">
        <canvas ref={canvasRef}></canvas>
      </div>
      <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
        {chartItems.map(({ label, className, color }) => (
          <div key={label} className="d-flex align-items-center gap-2">
            <div className={`chart-legend-dot ${className || ""}`} style={{ backgroundColor: color }} />
            <span className="text-dark fs-14">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}