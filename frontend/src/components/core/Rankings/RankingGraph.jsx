import React from 'react';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const RankingsGraph = ({ rankings }) => {
  if (!rankings || rankings.length < 2) {
    return (
      <div className="text-center text-gray-400 font-medium text-lg p-4">
        Not enough data to display a graph. At least two rankings are required.
      </div>
    );
  }

  const chartData = rankings.map(rank => ({
    label: rank.studentName,
    value: rank.score
  }));

  const chartConfigs = {
    type: 'doughnut3d', // Updated to 3D Donut chart
    width: '100%',
    height: '400',
    dataFormat: 'json',
    dataSource: {
      chart: {
        caption: 'Student Rankings',
        subCaption: 'Distribution of Scores',
        numberPrefix: '',
        theme: 'fusion',
        bgColor: '#000000',
        bgAlpha: '100',
        canvasBgColor: '#1F2937',
        canvasBgAlpha: '100',
        baseFontColor: '#E5E7EB',
        captionFontColor: '#F9FAFB',
        subCaptionFontColor: '#D1D5DB',
        xAxisNameFontColor: '#D1D5DB',
        yAxisNameFontColor: '#D1D5DB',
        toolTipBgColor: '#111827',
        toolTipColor: '#F9FAFB',
        showLegend: '1',
        legendBgColor: '#1F2937',
        legendBorderAlpha: '0',
        legendShadow: '0',
        legendItemFontColor: '#E5E7EB',
        legendCaptionFontColor: '#F9FAFB',
        paletteColors: '#3B82F6',
        showValues: '1',
        valueFontColor: '#D1D5DB',
        showBorder: '0',
        doughnutRadius: '50%', // Adjust the radius to control the thickness of the donut
        plotToolText: '<b>$label</b>: $value', // Tooltip format
      },
      data: chartData
    }
  };

  return <ReactFC {...chartConfigs} />;
};

export default RankingsGraph;
