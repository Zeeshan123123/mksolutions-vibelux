# VibeLux Energy Savings Flowchart - Conversion Instructions

You now have two versions of the energy savings revenue share flowchart:

## Files Created:
1. **energy-savings-flowchart.html** - Interactive HTML version with Mermaid diagram
2. **energy-savings-diagram.svg** - Static SVG version
3. **convert-flowchart.py** - Python script for HTML conversion
4. **convert-svg-to-formats.py** - Python script for SVG conversion

## Quick Conversion Methods:

### Method 1: Browser Screenshot (Easiest)
1. Open `energy-savings-flowchart.html` in Chrome/Safari/Firefox
2. Press `Cmd+Shift+S` (Mac) to take a full page screenshot
3. Save as JPG or PNG

### Method 2: Browser Print to PDF
1. Open `energy-savings-flowchart.html` in your browser
2. Press `Cmd+P` (Mac) or `Ctrl+P` (PC)
3. Select "Save as PDF"
4. Choose landscape orientation for best results

### Method 3: Python Scripts (Automated)
```bash
# Install dependencies
pip install playwright pillow cairosvg

# For HTML version (requires playwright setup)
python convert-flowchart.py

# For SVG version (simpler)
python convert-svg-to-formats.py
```

### Method 4: Online Converters
- For SVG to JPG/PDF: https://convertio.co/svg-jpg/
- For HTML to PDF: https://www.web2pdfconvert.com/

### Method 5: Mac Preview App
1. Open the SVG file in Preview
2. File → Export
3. Choose JPG or PDF format

## What the Flowchart Shows:

The diagram illustrates VibeLux's energy savings revenue share model:

1. **Customer Journey**: From signup to monthly savings
2. **70/30 Split**: Customer keeps 70% of verified savings
3. **Key Processes**:
   - OAuth utility connection
   - AI-powered baseline analysis
   - Real-time monitoring (15-min intervals)
   - IPMVP-verified savings calculation
   - Automated revenue sharing
4. **Benefits**:
   - Customer: Lower bills, no upfront cost
   - VibeLux: Performance-based recurring revenue
5. **Metrics**: 20-35% average savings, $0 upfront cost

The flowchart clearly demonstrates the win-win nature of the revenue share model, where VibeLux only profits when customers save money.