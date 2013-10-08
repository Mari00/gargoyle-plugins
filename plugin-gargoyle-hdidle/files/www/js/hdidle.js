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

 var hdidle=new Object(); //part of i18n
 
function saveChanges()
{
	var disk  = getSelectedValue("hdidle_disk");
	var enabled  = document.getElementById("hdidle_enabled").checked;
	var enabled_debug  = document.getElementById("hdidle_enabled_debug").checked;
	var time_unit  = getSelectedValue("hdidle_time_unit");
	var time_interval  = getSelectedValue("hdidle_time_interval");
	setControlsEnabled(false, true);
	
	var uci = uciOriginal.clone();
	
	var preCommands = [];
	var postCommands = [];
	
	if (enabled_debug == true)
		enabled_debug = 1;
	else
		enabled_debug = 0;		
	if (enabled == true)
		enabled = 1;
	else
		enabled = 0;
	if (disk != "")
		preCommands.push("uci set hd-idle.@hd-idle[0].disk='" + disk + "'");
	preCommands.push("uci set hd-idle.@hd-idle[0].enable_debug='" + enabled_debug + "'");
	preCommands.push("uci set hd-idle.@hd-idle[0].enabled='" + enabled + "'");
	preCommands.push("uci set hd-idle.@hd-idle[0].idle_time_unit='" + time_unit + "'");
	preCommands.push("uci set hd-idle.@hd-idle[0].idle_time_interval='" + time_interval + "'");
	preCommands.push("uci commit hd-idle");
	
	if(enabled == "1" && hdidle_disks_on.length < 1 && storageDrives.length > 0)
	{
		postCommands.push("/etc/init.d/hd-idle enable");
		postCommands.push("/etc/init.d/hd-idle start");
    }
	
	if(enabled == "1" && hdidle_disks_on.length >= 1 && storageDrives.length > 0)
	{
		postCommands.push("/etc/init.d/hd-idle restart");
    }
    
	if(enabled == "0")
    {
		postCommands.push("/etc/init.d/hd-idle stop");
    }
	
	var commands = preCommands.join("\n") + "\n" +  uci.getScriptCommands(uciOriginal) + "\n" + postCommands.join("\n") + "\n";

	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			uciOriginal = uci.clone();
			setControlsEnabled(true);
			window.location.href=window.location.href;
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function resetData()
{
	document.getElementById("hdidle_on").style.display = hdidle_disks_on.length >= 1 ? "block" : "none";
	document.getElementById("hdidle_off").style.display = hdidle_disks_on.length < 1 ? "block" : "none";

	document.getElementById("disks").style.display = storageDrives.length > 0 ? "block" : "none";
	document.getElementById("no_disks").style.display =  storageDrives.length == 0 ? "block" : "none";
	
	var tpSections = uciOriginal.getAllSectionsOfType("hd-idle", "hd-idle");
	
	var enabled = uciOriginal.get("hd-idle", tpSections[0], "enabled");
	
	if (enabled == 1)
		document.getElementById("hdidle_enabled").checked = true;
	else
		document.getElementById("hdidle_enabled").checked = false;
	
	var enabled_debug = uciOriginal.get("hd-idle", tpSections[0], "enable_debug");
	if (enabled_debug == 1)
		document.getElementById("hdidle_enabled_debug").checked = true;
	else
		document.getElementById("hdidle_enabled_debug").checked = false;
	
	var disk = uciOriginal.get("hd-idle", tpSections[0], "disk");
	disk = disk.replace("blkid | grep ", "").replace(" | cut -b 6-8", "");
	
	var time_unit = uciOriginal.get("hd-idle", tpSections[0], "idle_time_unit");
	setSelectedValue("hdidle_time_unit", time_unit);
	
	var time_interval = uciOriginal.get("hd-idle", tpSections[0], "idle_time_interval");
	setSelectedValue("hdidle_time_interval", time_interval);

	var driveIndex = 0;
	var disk_value = [];
	var disk_name = [];
	var disk_name_full = [];
	
	for(driveIndex=0; driveIndex < storageDrives.length; driveIndex++)
	{
		if (storageDrives[driveIndex][2] != 'TYPE=swap')
		{
			storageDrives[driveIndex][3] = storageDrives[driveIndex][1].replace("UUID=", "") + ' (' + storageDrives[driveIndex][0].replace('/dev/', "").substr(0,3) + ')';
			disk_name.push(storageDrives[driveIndex][0].replace('/dev/', "").substr(0,3));
			disk_name_full.push(storageDrives[driveIndex][3]);
				
			setAllowableSelections("hdidle_disk", disk_name, disk_name_full);
			setSelectedValue("hdidle_disk", disk);
		}	
	}
	
	var procesIndex = 0;
	
	if(hdidle_disks_on.length >= 1)
	{
		var columnNames = hdidle.ColNames;
		var hdidleTableProces = new Array();
		for(procesIndex=0; procesIndex < hdidle_disks_on.length; procesIndex++)
		{
			var lp = procesIndex+1;
			var time = hdidle_disks_on[procesIndex][2]/60;
			var disk_name_ps = '/dev/'+hdidle_disks_on[procesIndex][1];
			var pid = hdidle_disks_on[procesIndex][0];
			var button = createInput("button");
			button.className="default_button";
			button.value = hdidle.KillProc;
			button.onclick = killProces;
			hdidleTableProces.push([''+lp, time+' '+UI.minutes, disk_name_ps, pid, button]);
		}
		if (hdidleTableProces.length != 0)
		{
			var tableContainer = document.getElementById('hdidle_table_container');
			if(tableContainer.firstChild != null)
			{
				tableContainer.removeChild(tableContainer.firstChild);
			}	
			var hdidleTable = createTable(columnNames, hdidleTableProces, "hdidle_table", false, false);
			tableContainer.appendChild(hdidleTable);
		}
	}
}

function swapBlock()
{
	var diskS  = getSelectedValue("hdidle_disk");
		
	if (swap == diskS)
	{
		document.getElementById("hdidle_enabled").disabled = true;
		document.getElementById("swap_on_container").style.display = "block";
		document.getElementById("hdidle_enabled").checked = false;
	}
	else
	{
		document.getElementById("hdidle_enabled").disabled = false;
		document.getElementById("swap_on_container").style.display = "none";
	}
}

function killProces()
{
	if(confirm(hdidle.KillProcQ))
	{
		var pidKill=this.parentNode.parentNode.childNodes[3].firstChild.data;
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
