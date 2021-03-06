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
var logs=new Object(); //part of i18n

var toggleReload = false;
var updateInProgress;
var logsUpdater = null;

function updateLogsTable()
{
    if(!updateInProgress)
	{
		var systemSections = uciOriginal.getAllSectionsOfType("system", "system");
		var path = uciOriginal.get("system", systemSections[0], "log_file");
		var type = uciOriginal.get("system", systemSections[0], "log_type");
		updateInProgress = true;
		var logsLine = getSelectedValue("logs_line");	
		if (type == "file")
			var commands="cat "+path+" 2>/dev/null | tail -n "+logsLine;
		if (type == "circular" || type == "" || type == null)
			var commands="logread 2>/dev/null | tail -n "+logsLine;
        var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
		var stateChangeFunction = function(req)
        {
			if(req.readyState == 4)
            {
				var logsLines = req.responseText.split(/[\n\r]+/);
				var logsDataTable = new Array();
				var logsIndex;
				var monthNames = { "Jan" : UI.EMonths[0], "Feb" : UI.EMonths[1], "Mar" : UI.EMonths[2], "Apr" : UI.EMonths[3], "May" : UI.EMonths[4], "Jun" : UI.EMonths[5], "Jul" : UI.EMonths[6], "Aug" : UI.EMonths[7], "Sep" : UI.EMonths[8], "Oct" : UI.EMonths[9], "Nov" : UI.EMonths[10], "Dec" : UI.EMonths[11] };
				document.getElementById("log").style.display = logsLines[0].match(/^Success/) == null ? "block" : "none";
				document.getElementById("no_log").style.display = logsLines[0].match(/^Success/) == null ? "none" : "block";
				document.getElementById("lastlog").style.display =  logsLines[0].match(/^Success/) == null ? "block" : "none";
				for(logsIndex=1; logsLines[logsIndex].match(/^Success/) == null; logsIndex++)
				{
					var month = logsLines[logsIndex].substr(0,3);
					var month = monthNames[month];
					var day = logsLines[logsIndex].substr(3,3);
					var hour = logsLines[logsIndex].substr(7,8);
					var desc = logsLines[logsIndex].substr(16);
					logsDataTable.push(['\n'+logsIndex+'\n\n', month, day, hour, desc]);	
				}
				var columnNames = logs.ColNamesLast;
				var logsTable = createTable(columnNames, logsDataTable, "lastlog_table", false, false, true);
				var tableContainer = document.getElementById('lastlog_table_container');
				if(tableContainer.firstChild != null)
				{
					tableContainer.removeChild(tableContainer.firstChild);
				}	
				tableContainer.appendChild(logsTable)
				updateInProgress = false;
			}
		}
		 runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);	
	}
}
function reboot()
{
	setControlsEnabled(false, true, logs.Reb);
	
	var commands = "\nsh /usr/lib/gargoyle/reboot.sh\n";
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4){}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);

	//test for router coming back up
	currentProtocol = location.href.match(/^https:/) ? "https" : "http";
	testLocation = currentProtocol + "://" + window.location.host + "/utility/reboot_test.sh";
	testReboot = function()
	{
		toggleReload = true;
		setTimeout( "testReboot()", 5*1000);  //try again after 5 seconds
		document.getElementById("reboot_test").src = testLocation; 
	}
	setTimeout( "testReboot()", 25*1000);  //start testing after 15 seconds
	setTimeout( "reloadPage()", 240*1000); //after 4 minutes, try to reload anyway
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

function saveChanges()
{
	var type  = getSelectedValue("log_type");
	var disk  = getSelectedValue("log_disk");
	var file  = "/" + document.getElementById("log_file").value;
	file = file.replace("//", "/");
	var size  = document.getElementById("log_size").value;
	var ip  = document.getElementById("log_ip").value;
	var port  = document.getElementById("log_port").value;
	var conloglevel = getSelectedValue("log_kernel_level");
	var cronloglevel = getSelectedValue("log_cron_level");
	var uci = uciOriginal.clone();
	var preCommands = [];
	var postCommands = [];
		
	preCommands.push("uci set system.@system[0].log_type=" + type + "");
	if(storageDrives.length > 0 && type == 'file')
	preCommands.push("uci set system.@system[0].log_file=/tmp/usb_mount/" + disk + "" + file + "");
	if(type == 'circular')
	preCommands.push("uci del system.@system[0].log_file");
	preCommands.push("uci set system.@system[0].log_size=" + size + "");
	preCommands.push("uci set system.@system[0].conloglevel=" + conloglevel + "");
	preCommands.push("uci set system.@system[0].cronloglevel=" + cronloglevel + "");
	if(document.getElementById("use_log_ip_port").checked == true)
	{
		if(port == "")
			port = 514;
		preCommands.push("uci set system.@system[0].log_ip=" + ip + "");
		preCommands.push("uci set system.@system[0].log_port=" + port + "");
	}
	else
	{
		preCommands.push("uci del system.@system[0].log_ip");
		preCommands.push("uci del system.@system[0].log_port");
	}
	preCommands.push("uci commit system");
	
	var commands = preCommands.join("\n") + "\n" +  uci.getScriptCommands(uciOriginal) + "\n" + postCommands.join("\n") + "\n";
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			uciOriginal = uci.clone();;
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
	if(confirm(logs.RebCon))
	{
		reboot();
	}
	else
	{
		setControlsEnabled(true);
		window.location.href=window.location.href;
	}
}

function hideLogsPath()
{
var type  = getSelectedValue("log_type");	
document.getElementById("log_file_container").style.display = type == "file" && storageDrives.length > 0? "block" : "none";
document.getElementById("log_disk_container").style.display = type == "file" && storageDrives.length > 0? "block" : "none";
}

function unlockLogsServ()
{
	if(document.getElementById("use_log_ip_port").checked == true)
	{
		document.getElementById("log_ip").disabled = false;
		document.getElementById("log_port").disabled = false;
	}
	else
	{
		document.getElementById("log_ip").disabled = true;
		document.getElementById("log_port").disabled = true;
	}

}

function showLogs()
{
	row = this.parentNode.parentNode;
	index = row.childNodes[3].firstChild.id;
	if(typeof(viewLogWindow) != "undefined")
	{
		//opera keeps object around after
		//window is closed, so we need to deal
		//with error condition
		try
		{
			viewLogWindow.close();
		}
		catch(e){}
	}
	try
	{
		xCoor = window.screenX + 225;
		yCoor = window.screenY+ 225;
	}
	catch(e)
	{
		xCoor = window.left + 225;
		yCoor = window.top + 125;
	}
	viewLogWindow = window.open("utility/logs_view.sh?plik=" + index, "Logi", "scrollbars=1,width=800,height=600,left=" + xCoor + ",top=" + yCoor );
}

function downloadLogs()
{
	row = this.parentNode.parentNode;
	index = row.childNodes[3].firstChild.id;
	window.location="/utility/logs_download.sh?plik=" + index
}
function delLogs()
{
	var systemSections = uciOriginal.getAllSectionsOfType("system", "system");
	var file = uciOriginal.get("system", systemSections[0], "log_file");
	row = this.parentNode.parentNode;
	index = row.childNodes[3].firstChild.id;
	if(confirm(logs.LogDel+": "+file+index+"?"))
	{
		var cmd = [ "rm " + file+index ];
		execute(cmd);
	}
}

function killProces()
{
	var pidKill = log_on[0][0];
	if(confirm(logs.KillProc+": "+pidKill+"?"))
	{
		var cmd = [ "kill -9 " + pidKill ];
		execute(cmd);
	}
}

function execute(cmd)
{
	var commands = cmd.join("\n");
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	setControlsEnabled(false, true, UI.Wait);
        
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
	if(log_on.length >= 1)
	{
		updateLogsTable();
		if(logsUpdater != null)
		{
			clearInterval(logsUpdater);
		}
		logsUpdater = setInterval("updateLogsTable()", 10000); //check for updates every 10 seconds
	}
	var systemSections = uciOriginal.getAllSectionsOfType("system", "system");
	var type = uciOriginal.get("system", systemSections[0], "log_type");
	document.getElementById("log_on").style.display = log_on.length >= 1 ? "block" : "none";
	document.getElementById("log_off").style.display = log_on.length < 1 ? "block" : "none";
	document.getElementById("log_disk").style.display = storageDrives.length > 0 ? "block" : "none";
	document.getElementById("log_file_container").style.display = storageDrives.length > 0 ? "block" : "none";

	var systemSections = uciOriginal.getAllSectionsOfType("system", "system");
	var type = uciOriginal.get("system", systemSections[0], "log_type");
	if(storageDrives.length > 0 && type == null)
		setSelectedValue("log_type", "file");
	if(storageDrives.length == 0)
	{
		setSelectedValue("log_type", "circular");
		document.getElementById("log_type").setAttribute("disabled","disabled");
	}
	if(type == "" || type == null || type == "circular")
	{
		setSelectedValue("log_type", "circular");
	}
	else
		setSelectedValue("log_type", type);	
	
	var file = uciOriginal.get("system", systemSections[0], "log_file");

	if(file != "" || file != null)
	{
		var re = new RegExp("^[a-z A-Z 0-9 -]+\/", "g");
		document.getElementById("log_file").value = file.replace("/tmp/usb_mount/", "").replace(re, "");
	}
	var size = uciOriginal.get("system", systemSections[0], "log_size");
	if(size == "" || size == null)
		document.getElementById("log_size").value = 16;
	else
		document.getElementById("log_size").value = size;
		
	var ip = uciOriginal.get("system", systemSections[0], "log_ip");
	document.getElementById("log_ip").value = ip;
	
	var port = uciOriginal.get("system", systemSections[0], "log_port");
		document.getElementById("log_port").value = port;
		
	if(ip != "" && port != "")
		document.getElementById("use_log_ip_port").checked = true;
	
	var conloglevel = uciOriginal.get("system", systemSections[0], "conloglevel");
	if(conloglevel == "" || conloglevel == null)
		setSelectedValue("log_kernel_level", 7);
	else
		setSelectedValue("log_kernel_level", conloglevel);
	
	var cronloglevel = uciOriginal.get("system", systemSections[0], "cronloglevel");
	if(cronloglevel == "" || cronloglevel == null)
		setSelectedValue("log_cron_level", 5);
	else
		setSelectedValue("log_cron_level", cronloglevel);
	
	if (log_on[0][2] == "" || type == "" || type == null || type == "circular")
		log_file = 'c';
	if(log_on.length >= 1 && typeof log_file != "undefined")
	{
		var log_fileTableProces = new Array();
		for(lp=0; lp < log_file.length; lp++)
		{
			if (lp == 1) 
				var file0 = ".0"; 
			else 
				var file0 = "";
			if (log_on[0][2] == "" || type == "" || type == null || type == "circular")
			{
				var columnNames = logs.ColNamesC;
				var logT = logs.InCirc;
			}
			else
			{
				var columnNames = logs.ColNamesF;
				var re = new RegExp("^[a-z A-Z 0-9 -]+\/", "g");
				var logT = log_file[lp][1];
				var logT = logT.replace("/tmp/usb_mount/", "").replace(re, "");
			}
			var file_size = log_file[lp][0];
			var button1 = createInput("button");
			button1.className="default_button";
			button1.value = logs.KillProc;
			button1.onclick = killProces;
			var button2 = createInput("button");
			button2.className="default_button";
			button2.value = logs.Show;
			button2.onclick = showLogs;
			button2.id = file0;
			var button3 = createInput("button");
			button3.className="default_button";
			button3.value = UI.DNow;
			button3.onclick = downloadLogs;
			button3.id = file0;
			if (log_on[0][2] != "" && type == "file")
			{
				var button4 = createInput("button");
				button4.className="default_button";
				button4.value = logs.DelLog;
				button4.onclick = delLogs;
				log_fileTableProces.push([logT, file_size, button1, button2, button3, button4]);
			}
			else
			log_fileTableProces.push([logT, button1, button2, button3]);
		}		
		if (log_fileTableProces.length != 0)
		{
			var tableContainer = document.getElementById('log_table_container');
			if(tableContainer.firstChild != null)
			{
				tableContainer.removeChild(tableContainer.firstChild);
			}	
			var logsTable = createTable(columnNames, log_fileTableProces, "log_table", false, false);
			tableContainer.appendChild(logsTable);
		}
	}

	var driveIndex = 0;
	var disk_value = [];
	var disk_name = [];
	var disk_name_full = [];
	for(driveIndex=0; driveIndex < storageDrives.length; driveIndex++)
	{
		storageDrives[driveIndex][1] = storageDrives[driveIndex][1].replace("UUID=", "");
		storageDrives[driveIndex][2] = storageDrives[driveIndex][1].replace("UUID=", "") + ' (' + storageDrives[driveIndex][0].replace('/dev/', "").substr(0,3) + ')';
		disk_name.push(storageDrives[driveIndex][1]);
		disk_name_full.push(storageDrives[driveIndex][2]);
	}
	
	if(storageDrives.length > 0)
	{
		var re = new RegExp("\/+[a-zA-Z0-9\/.]*", "g");
		var disk = file.replace("/tmp/usb_mount/", "").replace(re, "");
		
		setAllowableSelections("log_disk", disk_name, disk_name_full);
		setSelectedValue("log_disk", disk);
	}
}
