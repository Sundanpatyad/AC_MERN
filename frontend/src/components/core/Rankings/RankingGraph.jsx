import React from 'react';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import ReactFC from 'react-fusioncharts';
import FusionThemeCandy from 'fusioncharts/themes/fusioncharts.theme.candy';
import FusionThemeFusion from 'fusioncharts/themes/fusioncharts.theme.fusion';

ReactFC.fcRoot(FusionCharts, Charts, FusionThemeCandy, FusionThemeFusion);

const RankingsGraph = ({ rankings }) => {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    setIsDark(document.documentElement.classList.contains('dark'));
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  // Ensure we have data to display
  if (!rankings || rankings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface rounded-xl border border-line">
        <p className="text-muted font-medium">No ranking data available yet.</p>
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
        theme: isDark ? "candy" : "fusion", // Pre-built themes
        
        // Customizing the theme look
        bgColor: "transparent",
        bgAlpha: "0", // Transparent to show parent bg if needed, or set to 100
        canvasBgAlpha: "0",

        // Fonts & Colors
        baseFont: "Inter",
        baseFontSize: "12",
        baseFontColor: isDark ? "#9CA3AF" : "#4B5563",
        captionFontColor: isDark ? "#F3F4F6" : "#111827",
        captionFontSize: "18",
        subCaptionFontColor: isDark ? "#6B7280" : "#6B7280",

        // Axis & Div Lines
        divLineColor: isDark ? "#374151" : "#E5E7EB",
        divLineAlpha: "50",
        showYAxisValues: "1",
        xAxisNameFontColor: isDark ? "#9CA3AF" : "#4B5563",
        yAxisNameFontColor: isDark ? "#9CA3AF" : "#4B5563",

        // Columns & Values
        paletteColors: "#3B82F6", // Blue primary color
        usePlotGradientColor: "1",
        plotGradientColor: "#8B5CF6", // Purple gradient
        plotFillAlpha: "90",
        plotBorderAlpha: "0",
        radius3D: "0",
        showValues: "1",
        valueFontColor: isDark ? "#FFFFFF" : "#000000",
        placeValuesInside: "1",

        // Tooltip
        toolTipBgColor: isDark ? "#111827" : "#FFFFFF",
        toolTipBorderColor: isDark ? "#4B5563" : "#E5E7EB",
        toolTipColor: isDark ? "#F3F4F6" : "#111827",
        toolTipBorderThickness: "1",

        // Hover Effects
        plotHoverEffect: "1",
      },
      data: chartData
    }
  };

  return (
    <div className="w-full p-4 bg-surface backdrop-blur-sm rounded-xl border border-line shadow-xl overflow-hidden">
      <ReactFC {...chartConfigs} />
    </div>
  );
};

export default RankingsGraph;
