#!/bin/sh

#echo $1
#echo $2
#echo $3

if test "${1#*-m}" != "$1"; then
	NUM=1
	while true; do
		echo $NUM
		NUM=$(($NUM+1))
		sleep 0.25
	done
else
	echo $1 | sed 's/.*\=//'
fi
