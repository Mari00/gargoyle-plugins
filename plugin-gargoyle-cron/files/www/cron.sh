#!/usr/bin/haserl
<?
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
	gargoyle_header_footer -h -s "connection" -p "cron" -c "internal.css" -j "table.js cron.js"
?>


<form>
	<fieldset id="task">
	<legend class="sectionheader">Zadania crontab</legend>
			<div id="task_table_container" class='indent'></div>
		</div>
	</fieldset>
	<fieldset id="no_task" style="display:none;">
		<legend class="sectionheader">Zadania crontab</legend>
		<em><span class="nocolumn">Brak zadan w crontab.</span></em>
	</fieldset>
	<div id="bottom_button_container">
			<input type='button' value='Zapisz zmiany' id="save_button" class="bottom_button" onclick='saveChanges()' />
			<input type='button' value='Anuluj' id="reset_button" class="bottom_button" onclick='resetData()' />
	</div>
	<span id="update_container" >Proszê czekaæ na wprowadzenie zmian...</span>
</form>


<script>
<!--
	resetData();
//-->
</script>


<?
	gargoyle_header_footer -f -s "connection" -p "cron"
?>
