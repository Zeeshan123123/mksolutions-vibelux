# Fixture JSON Export - Yes, It's Possible! ✅

## Quick Answer
**Yes, VibeLux can export all fixture locations as a JSON file** with complete position data, specifications, and calculations.

## Available Export Methods

### 1. **From Design Advanced Page** 
Navigate to `/design-advanced` and click the Export button:
```javascript
// Exported JSON includes:
{
  "fixtures": [
    {
      "id": "fixture-1",
      "x": 10,        // X position in feet/meters
      "y": 15,        // Y position in feet/meters
      "rotation": 0,  // Rotation angle
      "model": {...}, // Complete fixture specifications
      "enabled": true
    }
  ]
}
```

### 2. **From Designer Export Tool**
The Export/Import tool provides multiple formats:
- **JSON** - Complete design with all fixture positions
- **CSV** - For spreadsheet import
- **BLE** - For Bluetooth control systems

### 3. **Via Cloud Save Manager**
Save your design and export from "My Designs" page

## What's Included in the Export

### Fixture Location Data:
- ✅ **X, Y coordinates** (exact position)
- ✅ **Z height** (mounting height)
- ✅ **Rotation angle**
- ✅ **Fixture model & specifications**
- ✅ **Power settings**
- ✅ **Dimming levels**
- ✅ **Enabled/disabled status**

### Additional Data:
- Room dimensions
- PPFD calculations
- Power consumption
- Uniformity metrics
- Coverage analysis
- Timestamp & metadata

## How to Export

1. **Create your design** in the lighting designer
2. **Click Export** button or use File menu
3. **Select JSON** as format
4. **Choose what to include**:
   - Fixtures ✅
   - Room data ✅
   - Calculations ✅
   - Metadata ✅
5. **Download** the JSON file

## Integration Examples

### Use in Python:
```python
import json
with open('vibelux_fixtures.json') as f:
    design = json.load(f)
    for fixture in design['fixtures']:
        print(f"Fixture at ({fixture['x']}, {fixture['y']})")
```

### Use in JavaScript:
```javascript
const design = JSON.parse(jsonData);
const positions = design.fixtures.map(f => ({x: f.x, y: f.y}));
```

### Import to BMS/Control Systems:
The JSON format is compatible with most building management and lighting control systems.

## API Access (Professional/Enterprise)

```bash
curl -X POST https://api.vibelux.ai/v1/designs/export \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"designId": "123", "format": "json"}'
```

## Availability by Plan

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| JSON Export | ✅ | ✅ | ✅ |
| Batch Export | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| Custom Formats | ❌ | ❌ | ✅ |

## Common Use Cases

1. **BMS Integration** - Import fixture locations into existing systems
2. **Custom Analysis** - Process in Excel, MATLAB, or Python
3. **Documentation** - Include in technical specifications
4. **Automation** - Feed to control systems
5. **Backup** - Archive design versions
6. **Collaboration** - Share with contractors

## Need Help?

- Try it now: [Design Advanced](/design-advanced)
- Documentation: [Export Guide](/docs/export-formats)
- Support: support@vibelux.ai