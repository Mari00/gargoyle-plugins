#!/usr/bin/haserl
<%
#      Copyright (c) 2013 Saski
#
#      This program is free software; you can redistribute it and/or modify
#      it under the terms of the GNU General Public License as published by
#      the Free Software Foundation; either version 2 of the License, or
#      (at your option) any later version.
#
#      This program is distributed in the hope that it will be useful,
#      but WITHOUT ANY WARRANTY; without even the implied warranty of
#      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#      GNU General Public License for more details.
#
#      You should have received a copy of the GNU General Public License
#      along with this program; if not, write to the Free Software
#      Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#      MA 02110-1301, USA.

	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "system" -p "cron" -c "internal.css" -j "table.js cron.js" -z "cron.js"
%>
<form>
	<fieldset id="task">
	<legend class="sectionheader"><%~ cron.Tasks %></legend>
			<div id="task_table_container" class='indent'></div>
	</fieldset>
	<fieldset id="no_task" style="display:none;">
		<legend class="sectionheader"><%~ Tasks %></legend>
		<em><span class="nocolumn"><%~ NoTasks %></span></em>
	</fieldset>
	<fieldset id="add_task">
	<legend class="sectionheader"><%~ AddTasks %></legend>
		<div id="add_task_minute_container">
			<label class='leftcolumn' for='add_task_minute' id='add_task_minute_label'><%~ Minute %>:</label>
			<select class='rightcolumn' name="add_task_minute[]"  id="add_task_minute" size=7 style="width:90px;" multiple></select>
		</div>
		<div id="add_task_minute2_container" class="rightcolumnonly">
			<input type='checkbox' id='add_task_minute2' />
			<span class='rightcolumn' id="add_task_minute2"><%~ EvMinute %></span>
		</div>
		<div id="add_task_hour_container">
			<label class='leftcolumn' for='add_task_hour' id='add_task_hour_label'><%~ Hour %>:</label>
			<select class='rightcolumn' name="add_task_hour[]" id="add_task_hour" size=7 style="width:90px;" multiple></select>
		</div>
		<div id="add_task_hour2_container" class="rightcolumnonly">
			<input type='checkbox' id='add_task_hour2' />
			<span class='rightcolumn' id="add_task_hour2"><%~ EvHour %></span>
		</div>
		<div id="add_task_day_container">
			<label class='leftcolumn' for='add_task_day' id='add_task_day_label'><%~ Day %>:</label>
			<select class='rightcolumn' name="add_task_day[]" id="add_task_day" size=7 style="width:90px;" multiple></select>
		</div>
		<div id="add_task_day2_container" class="rightcolumnonly">
			<input type='checkbox' id='add_task_day2' />
			<span class='rightcolumn' id="add_task_day2"><%~ EvDay %></span>
		</div>
		<div id="add_task_month_container">
			<label class='leftcolumn' for='add_task_month' id='add_task_month_label'><%~ Month %>:</label>
			<select class='rightcolumn' name="add_task_month[]" id="add_task_month" size=7 style="width:90px;" multiple></select>
		</div>
		<div id="add_task_dayweek_container">
			<label class='leftcolumn' for='add_task_dayweek' id='add_task_dayweek_label'><%~ DayWeek %>:</label>
			<select class='rightcolumn' name="add_task_dayweek[]" id="add_task_dayweek" size=7 style="width:90px;" multiple></select>
		</div>
		<div id="add_task_script_container">
			<label class='leftcolumn' for='add_task_script' id='add_task_script_label'><%~ TaskScript %>:</label>
			<input class='rightcolumn' type='text' id='add_task_script' size='40' />
			<input type='button' class='default_button' id='add_new_task_button' value='<%~ Add %>' onclick='addNewTask()' />
		</div>
	</fieldset>
	<div id="bottom_button_container">
			<input type='button' value='<%~ SaveChanges %>' id='save_button' class='bottom_button' onclick='saveChanges()' />
			<input type='button' value='<%~ Reset %>' id='reset_button' class='bottom_button' onclick='resetData()' />
	</div>
</form>

<script>
<!--
	resetData();
//-->
</script>

<%
	gargoyle_header_footer -f -s "system" -p "cron"
%>
