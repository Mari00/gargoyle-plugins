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
	gargoyle_header_footer -h -s "system" -p "hdidle" -c "internal.css" -j "table.js hdidle.js" -z "hdidle.js" hd-idle config
%>

<script>
<!--
<%
	echo "var storageDrives = [];"
	blkid | cut -b 1-9,11- | egrep "/dev/sd?" | sed -e 's/LABEL.*UUID=//g' | sed 's/"*//g' | awk '{ print "storageDrives.push([\""$1"\",\""$2"\",\""$3"\"]);" }' 
	echo "var hdidle_disks_on = [];"
	ps | grep hd-idle | cut -b 1-6,44- | awk '{if ( $4 == "-i") {print "hdidle_disks_on.push([\""$1"\",\""$3"\",\""$5"\"]);"} }' 
	swap=$(blkid | egrep "swap" | cut -b 6-8)
	echo "swap=\"$swap\";"

%>
//-->
</script>

<form>
	<fieldset id="disks">
		<legend class="sectionheader"><%~ hdidle.Set %></legend>
		<div id="hdidle_enabled_container" class="leftcolumn">
			<input type='checkbox' id='hdidle_enabled' />
			<label for='hdidle_enabled' id='hdidle_enabled_label'><%~ HdId %></label>
		</div>
		<div id="hdidle_enabled_debug_container" class="leftcolumn">
			<input type='checkbox' id='hdidle_enabled_debug' />
			<label for='hdidle_enabled_debug' id='hdidle_enable_debug_label'><%~ Debug %></label>
		</div>
		<div id="hdidle_disk_container">
			<label class='leftcolumn' for='hdidle_disk' id='hdidle_disk_label'><%~ Disk %> :</label>
			<select class='rightcolumn' id="hdidle_disk" onchange="swapBlock();"></select>
		</div>
		<div id="swap_on_container" class="rightcolumnonly">
			<span class='rightcolumn' id="swap_on"><em><%~ Swap %></em></span>
		</div>
		<div id="hdidle_time_unit_container">
			<label class='leftcolumn' for='hdidle_time_unit' id='hdidle_time_unit_label'><%~ TimeU %> :</label>
			<select class='rightcolumn' id="hdidle_time_unit">
				<option value="minutes"><%~ Min %></option>
			</select>
		</div>
		<div id="hdidle_time_interval_container">
			<label class='leftcolumn' for='hdidle_time_interval' id='hdidle_time_interval_label'><%~ TimeI %> :</label>
			<select class='rightcolumn' id="hdidle_time_interval">
				<option value="2">2</option>
				<option value="5">5</option>
				<option value="10">10</option>
				<option value="15">15</option>
				<option value="20">20</option>
				<option value="25">25</option>
				<option value="30">30</option>
			</select>
		</div>
	</fieldset>
	<fieldset id="no_disks" style="display:none;">
		<legend class="sectionheader"><%~ Set %></legend>
		<em><span class="nocolumn"><%~ NoDisk %></span></em>
	</fieldset>
	
	<fieldset id="disks">
	<legend class="sectionheader"><%~ HdId %></legend>
		<div id="hdidle_on_off_container">
			<label class='leftcolumn' for='hdidle' id='hdidle_label'><%~ HdIdIs %> :</label>
				<span class="rightcolumn"style="color:#27c650; display:none;" id="hdidle_on"><%~ On %></span>
				<span class="rightcolumn" style="color:red; display:none;" id="hdidle_off"><%~ Off %></span>
		</div>
		<div class='indent'>
			<div id="hdidle_table_container"></div>
		</div>
	</fieldset>

	<div id="bottom_button_container">
		<input type='button' value='<%~ SaveChanges %>' id="save_button" class="bottom_button" onclick='saveChanges()' />
		<input type='button' value='<%~ Reset %>' id="reset_button" class="bottom_button" onclick='resetData()'/>
	</div>
</form>

<script>
<!--
	resetData();
	swapBlock();
//-->
</script>

<%
	gargoyle_header_footer -f -s "system" -p "hdidle"
%>
