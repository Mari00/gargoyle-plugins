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
	
	createCommands = [ "touch /etc/crontabs/root", "rm /etc/crontabs/root" ];
	taskTableData = new Array();
	for (rowIndex in tableData)
	{
		rowData = tableData[rowIndex];
		createCommands.push("echo \"" + rowData[0].replace(/"/g,"\\\"") + "\" >> /etc/crontabs/root");
	}
	var commands = createCommands.join("\n");
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	setControlsEnabled(false, true, "Proszę czekać...");
        
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

function addNewTask()
{
	var task_script  = document.getElementById("add_task_script").value;
	if(task_script == "")
	{
		alert("Brak skryptu do wykonania.");
		return;
	}
	else
	{
		minute = getSelectValue("add_task_minute", "add_task_minute2");
		hour = getSelectValue("add_task_hour", "add_task_hour2");
		day = getSelectValue("add_task_day", "add_task_day2");
		month = getSelectValue("add_task_month", false);
		dayweek = getSelectValue("add_task_dayweek", false);
		if (minute == '*' && hour.length > 0)
			minute = 1;
		values = new Array();
		values.push(minute + ' ' + hour+ ' ' + day+ ' ' + month+ ' ' + dayweek+ ' ' + task_script);
		//values.push(createEditButton());
		task_table = document.getElementById('task_table_container').firstChild;
		addTableRow(task_table, values, true, false, false);
	}
}

function createEditButton()
{
	var editButton = createInput("button");
	editButton.value = "Edycja";
	editButton.className="default_button";
	//editButton.onclick = editStatic;
	return editButton;
}

function getSelectValue(select_id, checkbox_id)
{
	tab = new Array
	var index = 0
	var select=document.getElementById(select_id);
	if (checkbox_id == false)
		doc = false;
	else
		doc = document.getElementById(checkbox_id).checked
	if(doc == true)
	{
		if (select.value != '')
			tab[index] = '*/'+select.value;
		else
			tab[index] = '*';
	}
	else
	{
		for (var i = 0; i < select.options.length; i++) 
		{
			if(select.options[i].selected ==true)
			{
				tab[index++] = select.options[i].value;
			}
		}
	}
	if (tab.length > 0)
		return tab.join();
	else
		return '*';
}
		
function resetData()
{
	var commands="cat /etc/crontabs/root 2>/dev/null";
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
				name = taskLines[taskIndex];
				taskDataTable.push([name]);
				//createEditButton();
			}
			//var columnNames = ['',''];
			var columnNames = [''];
			var taskTable = createTable(columnNames, taskDataTable, "usbreset_table", true, false);
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
	
	var minute = gen(0, 60)
	setsAllowableSelections("add_task_minute", minute, minute);
	var hour = gen(0, 23)
	setsAllowableSelections("add_task_hour", hour, hour);
	var day = gen(1, 31)
	setsAllowableSelections("add_task_day", day, day);
	var month = gen(1, 12)
	var month_name = new Array("Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień");
	setsAllowableSelections("add_task_month", month, month_name);
	var dayweek = gen(0, 6)
	var dayweek_name = new Array("Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota");
	setsAllowableSelections("add_task_dayweek", dayweek, dayweek_name);
}


function setsAllowableSelections(selectId, allowableValues, allowableNames, controlDocument)
{
	if(controlDocument == null) { controlDocument = document; }
	var selectElement = controlDocument.getElementById(selectId);
	if(allowableNames != null && allowableValues != null && selectElement != null)
	{
		var doReplace = true;
	    if(allowableValues.length == selectElement.options.length)
	    {
            doReplace = false;
            for(optionIndex = 0; optionIndex < selectElement.options.length && (!doReplace); optionIndex++)
            {
				doReplace = doReplace || (selectElement.options[optionIndex].text != allowableNames[optionIndex]) || (selectElement.options[optionIndex].value != allowableValues[optionIndex]) ;
            }
        }
	    if(doReplace)
	    {
	        currentSelection=getSelectedValue(selectId, controlDocument);
            removeAllOptionsFromSelectElement(selectElement);
            for(addIndex=0; addIndex < allowableValues.length; addIndex++)
	        {
                addOptionToSelectElement(selectId, allowableNames[addIndex], allowableValues[addIndex], null, controlDocument);
            }
			// setSelectedValue(selectId, currentSelection, controlDocument); //restore original settings if still valid
		}
	}
}

function gen(min, max)
{
	tab = new Array
	var index = 0
	for(var lp=min; lp<=max; lp++)
	{	
		tab[index++] = lp;
	}
	return tab;
}


