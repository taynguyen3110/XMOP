import React from 'react';
import ReactApexChart from 'react-apexcharts';

const LineGraph = ({ data }) => {
  const series = [{
    name: "Average Value",
    data: data.map(metric => metric.Average)
  }];

  const options = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: true
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    title: {
      text: 'Average Value Trend',
      align: 'left'
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      },
    },
    xaxis: {
      categories: data.map(metric => new Date(metric.Timestamp).toLocaleString())
    }
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default LineGraph;
