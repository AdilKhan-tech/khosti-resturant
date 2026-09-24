'use client'
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function InflationChart() {
  const series = [{
    name: 'Inflation',
    data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.9, 8.4, 7.8, 6.5, 2.2]
  }];

  const options = {
    chart: { height: 350, type: 'bar' },
    plotOptions: { bar: { borderRadius: 10, dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      formatter: (val) => val + "%",
      offsetY: -20,
      style: { fontSize: '12px', colors: ["#304758"] }
    },
    xaxis: {
      categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      position: 'top',
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { labels: { show: false } }
  };

  return <Chart options={options} series={series} type="bar" height={350} />;
}
