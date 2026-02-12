import React from 'react';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import ReactFC from 'react-fusioncharts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.candy';

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const RankingsGraph = ({ rankings }) => {
  // Ensure we have data to display
  if (!rankings || rankings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <p className="text-zinc-500 font-medium">No ranking data available yet.</p>
      </div>
    );
  }

  // Sort rankings by score (descending) and take top 10 for the chart
  const sortedRankings = [...rankings]
    .sort((a, b) => b.score - b.rank) // Sort primarily by score
    .slice(0, 10); // Limit to top 10 for readability

  const chartData = sortedRankings.map(rank => ({
    label: rank.userName, // Use userName instead of studentName based on RankingTable prop
    value: rank.score,
    toolText: `<b>${rank.userName}</b><br>Rank: ${rank.rank}<br>Score: ${rank.score}`
  }));

  const chartConfigs = {
    type: 'column2d', // Better for comparing ranks/scores
    width: '100%',
    height: '450',
    dataFormat: 'json',
    dataSource: {
      chart: {
        caption: "Top Performers",
        subCaption: "Score Comparison (Top 10)",
        xAxisName: "Explorers",
        yAxisName: "Score",
        theme: "candy", // Pre-built dark theme

        // Customizing the dark theme look
        bgColor: "#000000",
        bgAlpha: "0", // Transparent to show parent bg if needed, or set to 100
        canvasBgAlpha: "0",

        // Fonts & Colors
        baseFont: "Inter",
        baseFontSize: "12",
        baseFontColor: "#9CA3AF", // gray-400
        captionFontColor: "#F3F4F6", // gray-100
        captionFontSize: "18",
        subCaptionFontColor: "#6B7280", // gray-500

        // Axis & Div Lines
        divLineColor: "#374151", // gray-700
        divLineAlpha: "50",
        showYAxisValues: "1",
        xAxisNameFontColor: "#9CA3AF",
        yAxisNameFontColor: "#9CA3AF",

        // Columns & Values
        paletteColors: "#3B82F6", // Blue primary color
        usePlotGradientColor: "1",
        plotGradientColor: "#8B5CF6", // Purple gradient
        plotFillAlpha: "90",
        plotBorderAlpha: "0",
        radius3D: "0",
        showValues: "1",
        valueFontColor: "#FFFFFF",
        placeValuesInside: "1",

        // Tooltip
        toolTipBgColor: "#111827", // gray-900
        toolTipBorderColor: "#4B5563", // gray-600
        toolTipColor: "#F3F4F6",
        toolTipBorderThickness: "1",

        // Hover Effects
        plotHoverEffect: "1",
      },
      data: chartData
    }
  };

  return (
    <div className="w-full p-4 bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-xl overflow-hidden">
      <ReactFC {...chartConfigs} />
    </div>
  );
};

export default RankingsGraph;
