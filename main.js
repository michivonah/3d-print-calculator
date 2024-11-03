// add auto calculate on update
document.addEventListener('DOMContentLoaded', async function(){
    await loadPrinterModels();

    let fields = document.getElementsByClassName('input-field');
    for (const field of fields){
        if(localStorage.getItem(field.id)){
            field.value = localStorage.getItem(field.id);
            showResult();
        }
        field.addEventListener('keyup', showResult);
        field.addEventListener('change', saveValue);
    }

    document.getElementById("input-total-cost").addEventListener('click', copyToClipboard);
});

// load settings from json
async function loadSettings(path = "options.json"){
    try{
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const settings = await response.json();
        return settings;
    }
    catch(error){
        console.log(`Got error while trying to load the configuration data: ${error}`);
        return {"message":"error"};
    }
}

// calculate cost
async function calculateCost(){
    const settings = await loadSettings();
    const bufferFactor = settings.filamentBufferFactor; // add buffer on top of filament usage
    const filamentPrice = settings.filamentPrices["PLA"].spoolPrice; // price per 1kg spool
    const printerModel = document.getElementById("input-printer-model").value || other; // the selected printer model
    const hourlyMachineCost = settings.printerModels[printerModel].hourlyMachineCost; // the machine cost per hour (used for maintenance/repair/energy)

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

// load printers into select field
async function loadPrinterModels(){
    const settings = await loadSettings();
    const printerModels = settings.printerModels;
    const printerSelect = document.getElementById('input-printer-model');

    for (const [id, model] of Object.entries(printerModels)){
        const option = document.createElement('option');
        option.value = id;
        option.textContent = model.name;
        printerSelect.appendChild(option);
    }
}

// show cost from calculation
async function showResult(){
    const settings = await loadSettings();
    const currencyIcon = settings.currencyIcon; // the icon of your currency

    let resultField = document.getElementById("input-total-cost");
    resultField.value = `${await calculateCost()} ${currencyIcon}`;
}

// Save values to localStorage
async function saveValue(event){
    const field = event.target;
    localStorage.setItem(field.id, field.value);
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