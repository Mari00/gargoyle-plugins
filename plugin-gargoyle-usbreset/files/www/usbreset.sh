#!/usr/bin/haserl
<%
#      Copyright (c) 2013 Obsy
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
	gargoyle_header_footer -h -s "system" -p "usbreset" -c "internal.css" -j "table.js usbreset.js" -z "usbreset.js"
%>

<script>
<!--
<%
	gpiousbpower=0;
	gpiousbpower2=0;
	if [ -e /tmp/sysinfo/board_name ]; then
		board=$(cat /tmp/sysinfo/board_name)
		case "$board" in
			"tl-wr703n")	gpiousbpower=8;;
			"tl-mr3020")	gpiousbpower=8;;
			"tl-mr11u")	gpiousbpower=8;;
			"tl-mr3040")	gpiousbpower=18;;
			"tl-mr3220")	gpiousbpower=6;;
			"tl-mr3420")	gpiousbpower=6;;
			"tl-wdr3500")	gpiousbpower=12;;
			"tl-wdr4300")	gpiousbpower=21; gpiousbpower2=22;;
		esac
	fi
	echo "var gpiousbpower=$gpiousbpower;"
	echo "var gpiousbpower2=$gpiousbpower2;"
%>
//-->
</script>

<form>
	<fieldset id="usbreset">
	<legend class="sectionheader"><%~ usbreset.Devs %></legend>
		<div class='indent'>
			<div id="usbreset_table_container"></div>
		</div>
	</fieldset>
</form>

<fieldset id="usbpower" style="display:none;">
	<legend class="sectionheader"><%~ Power %></legend>
	<div>
		<span class='rightcolumnonly'>
			<input type='button' class='default_button' id='usb_on_button' value='<%~ On %>' onclick='USBPower("1")'/>
			<input type='button' class='default_button' id='usb_off_button' value='<%~ Off %>' onclick='USBPower("0")'/>
		</span>
	</div>
</fieldset>

<script>
<!--
	resetData();
//-->
</script>

<%
	gargoyle_header_footer -f -s "system" -p "usbreset"
%>
