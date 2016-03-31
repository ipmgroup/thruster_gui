#!/bin/sh

#echo $1
#echo $2
#echo $3

if test "${2#*-m}" != "$2"; then
	NUM=1
	while true; do
		echo $NUM
		NUM=$(($NUM+1))
		sleep 0.25
	done
else
	echo $2 | sed 's/.*\=//'
fi
