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

 function saveChanges()
{
	taskTable = document.getElementById('task_table_container').firstChild;	
	tableData = getTableDataArray(taskTable, true, false);
	
	createCommands = [ "touch /tmp/root", "rm /tmp/root" ];
	taskTableData = new Array();
	for (rowIndex in tableData)
	{
		rowData = tableData[rowIndex];
		createCommands.push("echo \"" + rowData[0].replace(/"/g,"\\\"") + "\" >> /tmp/root");
	}
	var commands = createCommands.join("\n");
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	setControlsEnabled(false, true, "Proszê czekaæ...");
        
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
 
function resetData()
{
	{
		var commands="cat /tmp/root 2>/dev/null";
        var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
		var stateChangeFunction = function(req)
        {
			if(req.readyState == 4)
            {
				var taskLines = req.responseText.split(/[\n\r]+/);
				var taskDataTable = new Array();
				var taskIndex;
				document.getElementById("task").style.display = taskLines[0].match(/^Success/) == null ? "block" : "none";
				document.getElementById("no_task").style.display = taskLines[0].match(/^Success/) == null ? "none" : "block";
				for(taskIndex=0; taskLines[taskIndex].match(/^Success/) == null; taskIndex++)
				{
					var name = taskLines[taskIndex];

					taskDataTable.push([''+name,]);	
				}
				
				var columnNames = [''];
				var taskTable = createTable(columnNames, taskDataTable, "usbreset_table", true, true);
				var tableContainer = document.getElementById('task_table_container');
				if(tableContainer.firstChild != null)
				{
					tableContainer.removeChild(tableContainer.firstChild);
				}	
				tableContainer.appendChild(taskTable)
				updateInProgress = false;
			}
		}
		 runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);	
	}
}
