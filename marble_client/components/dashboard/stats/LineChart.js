'use client'
import dynamic from "next/dynamic";
import React from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ProductTrendsChart() {
  const options = {
    chart: { height: 350, type: 'line', zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'straight' },
    title: { text: 'Product Trends by Month', align: 'left' },
    grid: {
      row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 }
    },
    xaxis: {
      categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
    }
  };

  const series = [
    {
      name: "Desktops",
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    }
  ];

  return <Chart options={options} series={series} type="line" height={350} />;
}
