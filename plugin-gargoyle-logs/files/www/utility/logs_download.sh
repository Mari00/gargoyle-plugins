#!/usr/bin/haserl
<?
#      Copyright (c) 2013 Saski
#      v1.4b
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

type=$(uci get system.@system[0].log_type -q)
if [ "$type" = "file" ]; then
	path=$GET_plik
else
	logread > /tmp/logi.txt;
	path="/tmp/logi.txt";
fi	
if [ ! -e "$path"] ; then
	echo "Content-type: text/plain"
	echo ""
	echo "Blad: Plik nie istnieje."
else
	cd "$path" >/dev/null 2>&1
	echo "Content-type: application/octet-stream"
	echo "Content-Disposition: attachment; filename=$path"
	echo ""
	cat $path
	if [ "$type" != "file" ]; then
		rm /tmp/logi.txt >/dev/null 2>&1
	fi	
fi
?>

