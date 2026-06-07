/**
 *
 * @param {number} roofArea - Available roof space in square meters (m²)
 * @param {number} monthlyConsumption - Monthly electricity consumption in kWh
 * @param {number} panelWattage - Wattage of a single solar panel (e.g., 400 or 550)
 * @returns {object} Calculated system metrics and recommendation details
 */
const getRecommendation = (roofArea, monthlyConsumption, panelWattage = 400) => {
    
    const dailyEnergyNeed = monthlyConsumption / 30; // kWh/day

    const peakSunHours = 5.5; 

    let systemSizeKW = dailyEnergyNeed / peakSunHours;

    let recommendedPanels = Math.ceil((systemSizeKW * 1000) / panelWattage);

    const spacePerPanel = 1.7;
    let requiredRoofSpace = recommendedPanels * spacePerPanel;

    let estimatedCoverage = 100;
    let note = "Your roof area is fully sufficient to support this recommended solar layout.";


    if (requiredRoofSpace > roofArea) {
        recommendedPanels = Math.floor(roofArea / spacePerPanel);
        
        const maximumPossibleKW = (recommendedPanels * panelWattage) / 1000;
        const actualDailyGeneration = maximumPossibleKW * peakSunHours;
        
        systemSizeKW = maximumPossibleKW;
        estimatedCoverage = Math.round((actualDailyGeneration / dailyEnergyNeed) * 100);
        note = `Partial footprint constraint notice: Your roof space only has room for up to ${recommendedPanels} panels. This will cover approximately ${estimatedCoverage}% of your total energy bill requirements.`;
    }


    return {
        recommendedPanels,
        systemSizeKW: Number(systemSizeKW.toFixed(2)), 
        estimatedCoverage,
        note
    };
};

module.exports = { getRecommendation };