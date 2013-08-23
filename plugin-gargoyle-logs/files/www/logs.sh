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
	gargoyle_header_footer -h -s "system" -p "logs" -c "internal.css" -j "table.js logs.js" -i -n system config
?>

<script>
<!--
<?
	echo "var storageDrives = [];"
	blkid | cut -b 1-9,11- | egrep "/dev/sd?" | sed -e 's/LABEL.*UUID=//g' | sed 's/"*//g' | awk '{ if ( $3 != "TYPE=swap") {print "storageDrives.push([\""$1"\",\""$2"\",\""$3"\"]);"} }' 
	echo "var log_on = [];"
	ps | grep syslogd | cut -b 1-6,33-39,45- 2>/dev/null | awk '{if ( $2 == "syslogd") {print "log_on.push([\""$1"\",\""$2"\",\""$3"\"]);"} }' 
	if [ -e "$(uci get system.@system[0].log_file -q)" ]; then
		echo "var log_file = [];"
		du -h $(uci get system.@system[0].log_file -q)* | awk '{ {print "log_file.push([\""$1"\",\""$2"\"]);"} }' 
	fi
?>
//-->
</script>

<form>
	<fieldset id="log_set">
		<legend class="sectionheader">Logi - Ustawienia</legend>
		<div id="log_type_container">
			<label class='leftcolumn' for='log_type' id='log_type_label'>Zapis logów do:</label>
			<select class='rightcolumn' id="log_type" onchange="hideLogsPath();">
				<option value="file">Pliku</option>
				<option value="circular">Pamięci</option>
			</select>
		</div>
		<div id="log_disk_container">
			<label class='leftcolumn' for='log_disk' id='log_disk_label'>Napęd:</label>
			<select class='rightcolumn' id="log_disk"></select>
		</div>
		<div id="log_file_container">
			<label class='leftcolumn' for='log_file' id='log_file_label'>Plik logów:</label>
			<input class='rightcolumn' type='text' id='log_file' size='40' />
		</div>
		<div id="log_size_container">
			<label class='leftcolumn' for='log_size' id='log_size_label'>Rozmiar plików (w kB):</label>
			<input class='rightcolumn' type='text' id='log_size' onkeyup="proofreadNumeric(this)" size='4' maxlength='4'/>
		</div>
		<div id="log_kernel_level_container">
			<label class='leftcolumn' for='log_kernel_level' id='log_kernel_level_label'>Poziom logów (kernel):</label>
			<select class='rightcolumn' id="log_kernel_level">
				<option value="0">0 - Awaryjny komunikat systemowy</option>
				<option value="1">1 - Alarm</option>
				<option value="2">2 - Krytyczny komunikat</option>
				<option value="3">3 - Błąd</option>
				<option value="4">4 - Ostrzeżenie</option>
				<option value="5">5 - Uwaga </option>
				<option value="6">6 - Informacja</option>
				<option value="7">7 - Wykrycie błędu programu</option>
			</select>
		</div>
		<div id="log_cron_level_container">
			<label class='leftcolumn' for='log_cron_level' id='log_cron_level_label'>Poziom logów (cron):</label>
			<select class='rightcolumn' id="log_cron_level">
				<option value="5">Wykrycie błędu programu</option>
				<option value="8">Normalny</option>
				<option value="9">Ostrzeżenie</option>
			</select>
		</div>
		<div id="log_ip_container">
			<span class='leftcolumn'>
				<label for='log_ip' id='log_ip_label'>IP serwera logów:</label>
			</span>
			<span class='rightcolumn'>
				<input type='checkbox' id='use_log_ip_port' onchange="unlockLogsServ();" />&nbsp;&nbsp;
				<input type='text' id='log_ip' size='20' onkeyup='proofreadIp(this)' maxlength='15' />
			</span>
		<div id="log_port_container">
		<div>
			<label class='leftcolumn' for='log_port' id='log_port_label'>Port serwera logów:</label>
			<input class='rightcolumn' type='text' id='log_port' size='5' onkeyup='proofreadNumericRange(this,1,65535)' maxlength='5' />
		</div>
		<div id="bottom_button_container">
			<input type='button' value='Zapisz zmiany' id="save_button" class="bottom_button" onclick='saveChanges()' />
			<input type='button' value='Anuluj' id="reset_button" class="bottom_button" onclick='resetData()' />
		</div>
	</fieldset>
	<fieldset id="log">
	<legend class="sectionheader">Logi</legend>
		<div id="log_on_off_container">
			<label class='wideleftcolumn' for='log' id='log_label'>Zapisywanie logów jest teraz:</label>
				<span class="rightcolumn"style="color:#27c650; display:none;" id="log_on">Uruchomione</span>
				<span class="rightcolumn" style="color:red; display:none;" id="log_off">Wyłączone</span>
		</div>
		<div id="log_table_container" class='indent'></div>
	</fieldset>
	<fieldset id="no_log" style="display:none;">
		<legend class="sectionheader">Logi</legend>
		<em><span class="nocolumn">Zmieniono ustawienia należy wykonać <a href="reboot.sh">restart</a> urządzenia.</span></em>
	</fieldset>
	<fieldset id="lastlog">
	<legend class="sectionheader">Ostatnie logi</legend>
		<div id="log_line_container">
			<label class='leftcolumn' for='logs_line' id='logs_line_label'>Ilość linii:</label>
			<select class='rightcolumn' id="logs_line" onchange="updateLogsTable(); saveLine();">
				<option value="26">25</option>
				<option value="51">50</option>
				<option value="76">75</option>
				<option value="101">100</option>
			</select>
		</div>
		<div id="lastlog_table_container" class='indent'></div>
	</fieldset>
</form>

<iframe id="reboot_test" onload="reloadPage()" style="display:none" ></iframe>

<script>
<!--
	resetData();
	hideLogsPath();
	unlockLogsServ();
//-->
</script>

<?
	gargoyle_header_footer -f -s "system" -p "logs"
?>
