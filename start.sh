#!/bin/sh

forever -l legbot.log -o misc.log -e error.log start legbot.js
