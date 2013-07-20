/*
 *     Copyright (c) 2013 Saski
 *
 *     This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation; either version 2 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program; if not, write to the Free Software
 *     Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 *     MA 02110-1301, USA.
 */
var toggleReload = false;
var updateInProgress;
var devUpdater = null;

function updateDevTable()
{
	if(!updateInProgress)
	{
		var commands;
		if (gpiousbpower==0)
		{
			commands="echo 0;usbreset";
		}
		else
		{
			commands="cat /sys/class/gpio/gpio"+gpiousbpower+"/value;usbreset";
		}
		var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
		var stateChangeFunction = function(req)
		{
			if(req.readyState == 4)
			{
				var devLines = req.responseText.split(/[\n\r]+/);
				var devDataTable = new Array();
				var devIndex;

				setElementEnabled(document.getElementById("usb_on_button"), devLines[0]=="0", false);
				setElementEnabled(document.getElementById("usb_off_button"), devLines[0]=="1", false);

				for(devIndex=6; devLines[devIndex].match(/^Success/) == null; devIndex++)
				{
					var lp = devIndex-5;
					var button = createInput("button");
					button.className="default_button";
					button.value = "Resetuj";
					button.onclick = resetUSB;
					var name = devLines[devIndex].substr(30);
					var id = devLines[devIndex].substr(21,9);
					devDataTable.push([''+lp, name, id, button]);
				}

				var columnNames = ['Lp.', 'Nazwa', 'VID/PID', ''];
				var devTable = createTable(columnNames, devDataTable, "usbreset_table", false, false, true);
				var tableContainer = document.getElementById('usbreset_table_container');
				if(tableContainer.firstChild != null)
				{
					tableContainer.removeChild(tableContainer.firstChild);
				}
				tableContainer.appendChild(devTable)
				updateInProgress = false;
			}
		}
		 runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
	}
}

function reloadPage()
{
	if(toggleReload)
	{
		//IE calls onload even when page isn't loaded -- it just times out and calls it anyway
		//We can test if it's loaded for real by looking at the (IE only) readyState property
		//For Browsers NOT designed by dysfunctional cretins whose mothers were a pack of sewer-dwelling, shit-eating rodents,
		//well, for THOSE browsers, readyState (and therefore reloadState) should be null 
		var reloadState = document.getElementById("reboot_test").readyState;
		if( typeof(reloadState) == "undefined" || reloadState == null || reloadState == "complete")
		{
			toggleReload = false;
			document.getElementById("reboot_test").src = "";
			window.location.href = window.location.href;
		}
	}
}

function resetUSB()
{
		var id=this.parentNode.parentNode.childNodes[2].firstChild.data;
		var cmd = [ "usbreset " + id ];
		execute(cmd);
}

function execute(cmd,reload)
{
	var commands = cmd.join("\n");
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	setControlsEnabled(false, true, "Proszę czekać...");

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			window.location.href=window.location.href;
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function resetData()
{
		document.getElementById("usbpower").style.display = gpiousbpower==0?"none":"block";
		
		updateDevTable();
		if(devUpdater != null)
		{
			clearInterval(devUpdater);
		}
		devUpdater = setInterval("updateDevTable()", 10000); //check for updates every 10 seconds
}

function USBPower(value)
{
	if (value == 0)
	{
		if(!confirm("Wyłącznie zasilania USB może być niebezpieczne jeżeli używany jest modem 3G lub nośnik pamięci USB. Kontynuować?"))
		{ return; }
	}

	if (gpiousbpower2 > 0)
	{
		execute(["echo " + value +" > /sys/class/gpio/gpio"+gpiousbpower+"/value","echo " + value +" > /sys/class/gpio/gpio"+gpiousbpower2+"/value"]);
	}
	else
	{
		execute(["echo " + value +" > /sys/class/gpio/gpio"+gpiousbpower+"/value"]);
	}
}
