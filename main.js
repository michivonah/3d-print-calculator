// add auto calculate on update
document.addEventListener('DOMContentLoaded', function(){
    let fields = document.getElementsByClassName('input-field');
    for (const field of fields){
        field.addEventListener('change', showResult);
    }

    document.getElementById("input-total-cost").addEventListener('click', copyToClipboard);
});

// calculate cost
function calculateCost(){
    const bufferFactor = 1.1; // add buffer on top of filament usage
    const filamentPrice = 20; // price per 1kg spool
    const hourlyMachineCost = 0.15; // the machine cost per hour (used for maintenance/repair/energy)

    const printerModel = document.getElementById("input-printer-model").value;

    const filamentUsage = parseFloat(document.getElementById("input-total-filament-usage").value || 0); // used filament in grams
    const printDuration = parseFloat(document.getElementById("input-print-duration").value || 0); // print duration in minutes
    const materialCost = parseFloat(document.getElementById("input-material-cost").value || 0); // additional material costs
    const shippingCost = parseFloat(document.getElementById("input-shipping").value || 0); // additional packaging & shipping cost
    const laborTime = parseFloat(document.getElementById("input-labor-time").value || 0); // the time used in labor
    const hourlyWage = parseFloat(document.getElementById("input-hourly-wage").value || 0); // the hourly wage used for the labor time
    const profitMargin = parseFloat(document.getElementById("input-profit-margin").value || 0); // your profit margin
    const profitMarginFactor = (profitMargin / 100) + 1; // profit margin as decimal number

    // calculate & round the result
    const result = ((((filamentUsage * bufferFactor) * (filamentPrice / 1000)) + ((printDuration / 60) * hourlyMachineCost) + materialCost + shippingCost + ((laborTime / 60) * hourlyWage)) * profitMarginFactor);
    const round = Math.round(result * 100) / 100;
    return round;
}

// show cost from calculation
function showResult(){
    const currencyIcon = "CHF"; // the icon of your currency

    let resultField = document.getElementById("input-total-cost");
    resultField.value = `${calculateCost()} ${currencyIcon}`;
}

// Copy to clipboard
function copyToClipboard(event){
    const text = event.target.value;
    const copyNotice = document.getElementById("copy-notice");

    try{
        navigator.clipboard.writeText(text);
        copyNotice.classList.add("visible");
        setTimeout(() => copyNotice.classList.remove("visible"), 2000);
    }
    catch(error){
        console.log(`Got error while trying to copy to clipboard: ${error}`);
    }
}