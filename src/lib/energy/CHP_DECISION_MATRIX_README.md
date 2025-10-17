# CHP & Lighting Decision Matrix Documentation

## Overview

The Enhanced CHP & Lighting Decision Matrix is a comprehensive tool for optimizing combined heat and power (CHP) operations alongside greenhouse lighting systems. It enables users to make smart economic decisions by analyzing multiple scenarios with different electricity pricing, CO2 values, and operational strategies.

## Key Features

### 1. **Configurable Electricity Pricing**
- **Time-of-Use (TOU) Rates**: Separate peak, mid-peak, and off-peak pricing
- **Feed-in Tariff**: Configure the price you receive for selling electricity back to the grid
- **Net Metering**: Support for net metering arrangements
- **Export Limits**: Set maximum power export constraints
- **Demand Charges**: Include demand charge calculations

### 2. **CO2 Economics**
- **Liquid CO2 Pricing**: Cost of purchasing CO2 from suppliers
- **CHP CO2 Production**: Calculate value of CO2 produced by cogeneration
- **Yield Value**: Quantify the crop yield improvement from CO2 enrichment
- **Plant Uptake**: Model actual CO2 consumption by plants
- **Purity Considerations**: Account for CO2 quality from different sources

### 3. **Smart Lighting Optimization**
The system optimizes lighting decisions based on:
- Current electricity prices (avoiding peak hours when profitable)
- Available CHP power (prioritizing "free" electricity)
- DLI targets (ensuring crop requirements are met)
- Zone priorities (critical zones get power first)

### 4. **Multi-Scenario Analysis**
Compare multiple scenarios simultaneously:
- Different pricing structures
- Various operational strategies
- Alternative CO2 sources
- Equipment configurations

## How It Works

### Decision Logic

The system makes hourly decisions for 24 hours based on:

1. **CHP Operation Decision**
   ```
   Should CHP run? = (Benefits > Costs)
   
   Benefits = Electricity Value + Heat Recovery + CO2 Value + Feed-in Revenue
   Costs = Fuel Cost + Maintenance
   ```

2. **Lighting Optimization**
   - Uses CHP power first (free after fuel costs)
   - Reduces non-critical lighting during expensive grid periods
   - Ensures minimum DLI targets are met
   - Respects photoperiod requirements

3. **CO2 Management**
   - Prefers CHP-produced CO2 (already paid for via fuel)
   - Calculates if purchased CO2 is worth the yield improvement
   - Only enriches during light periods (photosynthesis active)

### Operational Strategies

**Maximize Profit**
- Aggressive feed-in during high-price periods
- Minimal operation during low-margin conditions
- Requires >15% profit margin to run

**Minimize Cost**
- Focus on avoiding expensive grid purchases
- Run CHP whenever cheaper than grid
- Less emphasis on feed-in revenue

**Maximize Yield**
- Prioritizes CO2 production for plant growth
- Maintains optimal growing conditions
- Accepts lower economic margins

**Balanced Approach**
- Considers all factors equally
- 10% margin threshold
- Flexible operation based on conditions

## Configuration Guide

### Setting Up Electricity Pricing

```javascript
electricityPricing: {
  peakPrice: 0.42,        // $/kWh - Typically 4 PM - 9 PM
  midPeakPrice: 0.28,     // $/kWh - Shoulder periods
  offPeakPrice: 0.15,     // $/kWh - Night and early morning
  feedInTariff: 0.38,     // $/kWh - What you're paid for exports
  netMeteringEnabled: true,
  exportLimit: 300,       // kW - Maximum export capacity
  demandCharge: 15,       // $/kW - Monthly peak demand charge
}
```

**Tips:**
- Set feed-in tariff based on your utility contract or market rates
- Export limits may be set by utility or transformer capacity
- Peak prices often 2-3x off-peak rates

### Configuring CO2 Economics

```javascript
co2Economics: {
  liquidCO2Price: 0.12,    // $/kg - From gas suppliers
  chpCO2Production: 95,    // kg/hour - Based on fuel consumption
  targetPPM: 1000,         // Target CO2 concentration
  plantUptakeRate: 50,     // kg/hour - Depends on crop and light
  yieldIncrease: 15,       // % yield improvement from CO2
  cropValuePerKg: 8.50,    // $/kg - Market price of crop
}
```

**Calculation Example:**
- CO2 from CHP: 95 kg/hr × $0.12/kg = $11.40/hr equivalent value
- Yield improvement: 15% of 50 kg/m²/year × $8.50/kg = $63.75/m²/year
- Daily value per 1000 m²: $174.66

### Understanding the Results

**Daily Summary Metrics:**
- **Net Profit**: Total revenue minus all costs
- **CHP Runtime**: Hours of operation (target: 16-20 hrs)
- **Grid Export**: kWh sold to grid (maximize during high prices)
- **Average DLI**: Light delivered to plants (mol/m²/day)

**Hourly Schedule Visualization:**
- Green bars: CHP running
- Red line: Grid electricity price
- Height: Power generation/consumption

**Sensitivity Analysis:**
Shows how 10% changes in key parameters affect daily profit:
- Positive impact: Parameter increase improves profit
- Negative impact: Parameter increase reduces profit
- Break-even point: Value where profit becomes zero

## Best Practices

### 1. **Accurate Data Input**
- Use actual utility rate schedules
- Verify CO2 prices with suppliers
- Measure actual CHP performance

### 2. **Scenario Planning**
Create scenarios for:
- Summer vs. winter pricing
- Different natural gas prices
- Future electricity rate changes
- Carbon credit opportunities

### 3. **Optimization Tips**

**For Maximum Profit:**
- Run CHP during mid-peak and peak hours
- Export power when feed-in > retail price
- Minimize purchased CO2
- Front-load lighting in off-peak hours

**For Reliability:**
- Maintain minimum 2-hour run/stop times
- Consider maintenance windows
- Plan for demand response events

**For Sustainability:**
- Track total CO2 emissions
- Calculate renewable energy percentage
- Monitor overall system efficiency

### 4. **Implementation Strategy**

**Phase 1: Analysis**
- Run multiple scenarios
- Identify optimal operating windows
- Calculate ROI for different strategies

**Phase 2: Testing**
- Implement schedule for one week
- Monitor actual vs. predicted performance
- Adjust parameters based on results

**Phase 3: Automation**
- Program control system with optimal schedule
- Set up real-time price feeds
- Implement override conditions

## Advanced Features

### Weather Integration
Future versions will include:
- Temperature-based heat demand
- Solar radiation impact on lighting needs
- Humidity effects on plant transpiration

### Machine Learning
Planned enhancements:
- Historical performance analysis
- Predictive maintenance scheduling
- Adaptive parameter tuning

### Grid Services
Additional revenue opportunities:
- Frequency regulation
- Demand response programs
- Virtual power plant participation

## Troubleshooting

**CHP Never Runs**
- Check if gas price is too high relative to electricity
- Verify CO2 value is included
- Ensure heat recovery value is calculated

**Excessive Grid Import**
- Increase CHP capacity factor
- Review lighting schedule vs. CHP availability
- Check export limitations

**Low Profitability**
- Compare feed-in tariff to retail rates
- Optimize CO2 utilization
- Review maintenance costs

## Example Calculations

### Scenario: High Feed-in Tariff
```
Inputs:
- CHP: 500 kW output, 150 m³/hr gas @ $0.035/m³
- Lighting: 300 kW load, 12-hour photoperiod
- Grid: $0.42/kWh peak, $0.38/kWh feed-in
- CO2: 95 kg/hr production, $0.12/kg purchase price

Daily Analysis:
- CHP runs 18 hours (all peak/mid-peak periods)
- Electricity generated: 500 kW × 18 hr = 9,000 kWh
- Lighting consumption: 300 kW × 12 hr = 3,600 kWh
- Grid export: 5,400 kWh × $0.38 = $2,052 revenue
- Gas cost: 150 m³/hr × 18 hr × $0.035 = $94.50
- CO2 value: 95 kg/hr × 18 hr × $0.12 = $205.20
- Net daily profit: $2,052 + $205.20 - $94.50 = $2,162.70
```

### ROI Calculation
```
Investment: $500,000 CHP system
Annual profit: $2,162.70 × 250 days = $540,675
Simple payback: 11.1 months
IRR: >85%
```

## Conclusion

The CHP & Lighting Decision Matrix enables greenhouse operators to:
- Maximize revenue from electricity markets
- Optimize CO2 utilization
- Reduce operating costs
- Make data-driven decisions
- Plan for different market conditions

By properly configuring the tool with your specific electricity rates, CO2 costs, and operational constraints, you can identify the optimal strategy for your facility and potentially save thousands of dollars per month while maintaining or improving crop yields.