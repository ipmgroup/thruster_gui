#!/bin/sh

NUM=1

while true; do
	echo $NUM
	NUM=$(($NUM+1))
	sleep 0.25
done
