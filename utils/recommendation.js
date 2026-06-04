/**
 * Solar Recommendation Engine Engine
 * @param {number} roofArea - Available roof space in square meters (m²)
 * @param {number} monthlyConsumption - Monthly electricity consumption in kWh
 * @param {number} panelWattage - Wattage of a single solar panel (e.g., 400 or 550)
 * @returns {object} Calculated system metrics and recommendation details
 */
const getRecommendation = (roofArea, monthlyConsumption, panelWattage = 400) => {
    // 1. Daily energy need = monthly bill consumption / 30 days
    const dailyEnergyNeed = monthlyConsumption / 30; // kWh/day

    // 2. Average peak sun hours in Egypt is a constant ≈ 5.5 hours/day
    const PEAK_SUN_HOURS = 5.5;

    // 3. System size needed in kW = daily requirement / peak sunshine hours
    // We add a 1.25 multiplier factor to account for natural energy loss (inverter heat, wiring resistance)
    const systemSizeKW = (dailyEnergyNeed / PEAK_SUN_HOURS) * 1.25;

    // 4. Calculate exact number of panels needed to generate that kW system size
    // Formula: (System size in kW * 1000 to get Watts) / individual panel wattage
    let recommendedPanels = Math.ceil((systemSizeKW * 1000) / panelWattage);

    // 5. Roof space threshold check: Each standard residential panel requires roughly 1.7 m² of clearance
    const spacePerPanel = 1.7;
    const requiredRoofSpace = recommendedPanels * spacePerPanel;

    let estimatedCoverage = 100;
    let note = "Your roof area is fully sufficient to support this recommended solar configuration layout.";

    // If the required panels don't fit on their roof, downscale the system size to match their space limits
    if (requiredRoofSpace > roofArea) {
        recommendedPanels = Math.floor(roofArea / spacePerPanel);
        
        // Recalculate what the downscaled panel layout can actually cover
        const maximumPossibleKW = (recommendedPanels * panelWattage) / 1000;
        const actualDailyGeneration = maximumPossibleKW * PEAK_SUN_HOURS;
        
        estimatedCoverage = Math.round((actualDailyGeneration / dailyEnergyNeed) * 100);
        note = `Partial footprint constraint notice: Your roof space only has room for up to ${recommendedPanels} panels. This will cover approximately ${estimatedCoverage}% of your total energy bill requirements.`;
    }

    // Return the clean structural data bundle to pass back to the browser screens
    return {
        recommendedPanels,
        systemSizeKW: Number(systemSizeKW.toFixed(2)), // Limit decimal places to look professional
        estimatedCoverage,
        note
    };
};

module.exports = { getRecommendation };