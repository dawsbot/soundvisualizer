#!/bin/bash

if [ -f ~/reboot_on_fail ]; then
	echo 'failure, rebooting'
	reboot
else
	echo 'reboot file nor present'
fi
