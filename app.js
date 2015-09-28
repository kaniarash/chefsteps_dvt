/*
Description:

	JavaScript code for the mbed GAP example app.

Credits:

	ARM mbed [-_-]~

	http://mbed.org
*/

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);
};

/**
 * When low level initialization complete, this function is called.
 */
app.onDeviceReady = function()
{
	// report status
	app.showInfo('Tap Start to begin scanning');
};

/**
 * Called when Start button is pressed.
 */
app.onStartButton = function()
{
	// Call stop before you start, just in case something else is running.
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();

	// Only report devices once.
	evothings.easyble.reportDeviceOnce(true);

	// Start scanning.
	app.startScan();
	app.showInfo('Scanning...');
};

/**
 * Called when Stop button is pressed.
 */
app.onStopButton = function()
{
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	app.showInfo('Tap Start to begin scanning');
	$('#found-devices').empty();
};

/**
 * Print debug info to console and application UI.
 */
app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
	console.log(info);
};


//We only want to read one Device
app.deviceIsBluetoothWithBleId = function(device, bleId)
{
	return ((device != null) && (device.name != null) && (device.name == bleId));
};

/**
 * Scan all devices and display them.
 */
app.connect = function(user)
{
	var BLEId = document.getElementById('BLEId').value;

	app.showInfo('Trying to connect to "' + BLEId + '"');

	app.disconnect(user);

	function onScanSuccess(device)
	{
		function onConnectSuccess(device)
		{

			// Debug logging.
			console.log('Device Found!')
			console.log(device.name + ' : ' + device.address.toString().split(':').join(''))

			// Add found device to device list.
			// See documentation here for BLE device object fields:
			// http://evothings.com/doc/raw/plugins/com.evothings.ble/com.evothings.module_ble.html
			var Name = device.name;
			var HEXdata = app.getHexData(device.advertisementData.kCBAdvDataManufacturerData);
			document.getElementById('devicename').innerHTML = String(Name);
			document.getElementById('devicehex').innerHTML = String(Hexdata);

		};

		function onConnectFailure(errorCode)
		{
			// Show an error message to the user
			app.showInfo('Error ' + errorCode);
		}

		console.log('Found device: ' + device.name);

		// Connect if we have found a LightBlue Bean with the name from input (BLEId)
		var found= app.deviceIsBluetoothWithBleId(
			device,
			document.getElementById('BLEId').value);
		if (found)
		{
			// Update user interface
			app.showInfo('Found "' + device.name + '"');

			// Stop scanning
			evothings.easyble.stopScan();

			// Connect to our device
			app.showInfo('Identifying service for communication');
			device.connect(onConnectSuccess, onConnectFailure);
		}
	}

	function onScanFailure(errorCode)
	{
		// Show an error message to the user
		app.showInfo('Error: ' + errorCode);
		evothings.easyble.stopScan();
	}

	// Update the user interface
	app.showInfo('Scanning...');

	// Start scanning for devices
	evothings.easyble.startScan(onScanSuccess, onScanFailure);
};

// Something like this happens but with hex----------------------------------------------
// app.readTemperature = function()
// {
// 	function onDataReadSuccess(data)
// 	{
// 		var temperatureData = new Uint8Array(data);
// 		var temperature = temperatureData[0];
// 		console.log('Temperature read: ' + temperature + ' C');
// 		document.getElementById('temperature').innerHTML = temperature;
// 	}

// 	function onDataReadFailure(errorCode)
// 	{
// 		console.log('Failed to read temperature with error: ' + errorCode);
// 		app.disconnect();
// 	}

// 	app.readDataFromScratch(2, onDataReadSuccess, onDataReadFailure);
// };

/**
 * Convert hex to ASCII strings.
 */
app.hextostring = function(hex)
{
    // Do not parse undefined data.
    if (hex)
    {
    	var result = '';
    	$.each(('' + hex).match(/../g), function() {
    	    result += String.fromCharCode('0x' + this);
    	});
    	return result;
    }
    else
    {
    	return null;
    }
};

/**
 * Convert base64 to array to hex.
 */
app.getHexData = function(data)
{
	// Sanity check for null/undefined data.
	if (data)
	{
		return evothings.util.typedArrayToHexString(
			evothings.util.base64DecToArr(data));
	}
    else
    {
    	return null;
    }
};

// Initialize the app.
app.initialize();
