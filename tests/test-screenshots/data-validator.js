
// Data Validation Library for Vibelux
// Include this in all pages to prevent data integrity issues

const DataValidator = {
    // Validate and sanitize numeric values
    number(value, defaultValue = 0, min = null, max = null) {
        if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') {
            return defaultValue;
        }
        
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) {
            return defaultValue;
        }
        
        if (min !== null && num < min) return min;
        if (max !== null && num > max) return max;
        
        return num;
    },
    
    // Validate PPFD values (0-2000 μmol/m²/s typical range)
    ppfd(value) {
        return this.number(value, 800, 0, 2000);
    },
    
    // Validate wattage values
    watts(value) {
        return this.number(value, 0, 0, 10000);
    },
    
    // Validate percentage values (0-100)
    percentage(value) {
        return this.number(value, 0, 0, 100);
    },
    
    // Validate efficiency values (0-5 μmol/J typical range)
    efficiency(value) {
        return this.number(value, 2.7, 0, 5);
    },
    
    // Validate DLI values (0-100 mol/m²/day typical range)
    dli(value) {
        return this.number(value, 35, 0, 100);
    },
    
    // Calculate average safely
    average(values) {
        if (!Array.isArray(values) || values.length === 0) {
            return 0;
        }
        
        const validValues = values
            .map(v => this.number(v))
            .filter(v => isFinite(v));
        
        if (validValues.length === 0) return 0;
        
        return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    },
    
    // Format number for display
    format(value, decimals = 0, suffix = '') {
        const num = this.number(value);
        return num.toFixed(decimals) + suffix;
    },
    
    // Format currency
    currency(value) {
        const num = this.number(value);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(num);
    },
    
    // Validate and format room data
    validateRoom(room) {
        return {
            id: room.id || 'Unknown',
            fixtures: this.number(room.fixtures, 0, 0, 1000),
            area: this.number(room.area, 0, 0, 10000),
            ppfd: this.ppfd(room.ppfd),
            dli: this.dli(room.dli),
            watts: this.watts(room.watts)
        };
    }
};

// Example usage:
// const ppfd = DataValidator.ppfd(calculatedValue);
// const displayValue = DataValidator.format(ppfd, 0, ' μmol/m²/s');
