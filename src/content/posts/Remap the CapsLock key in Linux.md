---
title: Remap the CapsLock key in Linux
description: "today iain learned: Remap the CapsLock key in Linux"
date: 2025-12-17
tags:
  - linux
  - CLI
  - dotfiles
---
Today (or recently) I found out that the awesome Wez Furlong (creator of WezTerm) also made this great key remapping tool for Linux called [evremap](https://github.com/wez/evremap).

I wanted to remap my CapsLock key to get this working on an old Macbook Air I've recently installed Arch Linux on, so that tapping it would map to `Esc`, and holding it would be `Super + Ctrl + Shift + Alt`, just like I have on my mechanical keyboard that I use on my other computers.

Following the [instructions from the repo](https://github.com/wez/evremap/blob/master/README.md#configuration), I created a basic config file:

`~/.config/evremap/evremap.toml`

```toml
# https://github.com/wez/evremap
# The name of the device to remap.
# Run `sudo evremap list-devices` to see the devices available
# on your system.
device_name = "Apple Inc. Apple Internal Keyboard / Trackpad"
phys = "usb-0000:00:14.0-5/input1"

# If you have multiple devices with the same name, you can optionally
# specify the `phys` value that is printed by the `list-devices` subcommand
# phys = "usb-0000:07:00.3-2.1.1/input0"

# Configure CAPSLOCK as a Dual Role key.
# Holding it produces LEFTCTRL, ALT, SHIFT and META/SUPER
# AKA Hyper, but tapping it will produce ESC.
# Both `tap` and `hold` can expand to multiple output keys.
[[dual_role]]
input = "KEY_CAPSLOCK"
hold = ["KEY_LEFTCTRL", "KEY_LEFTALT", "KEY_LEFTSHIFT", "KEY_LEFTMETA"]
tap = ["KEY_ESC"]

```

Then created a service, again, following the [instructions for running as a service](https://github.com/wez/evremap/blob/master/README.md#systemd) but tweaking because it somehow needed the full paths to things:

`~/.config/evremap/evremap.service`

```service
[Service]
WorkingDirectory=/
# For reasons I don't care to troubleshoot, Fedora 31 won't let me start this
# unless I use `bash -c` around it.  Putting the command line in directly
# yields a 203 permission denied error with no logs about what it didn't like.
ExecStart=bash -c "sudo /usr/bin/evremap remap /home/iain/.config/evremap/evremap.toml -d 0"
Restart=always

[Install]
WantedBy=multi-user.target
```

And created a bash script in the config directory to copy the service, enable it and run it:

`~/.config/evremap/setup_evremap.sh`

```bash
#!/bin/bash

sudo cp evremap.service /usr/lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable evremap.service
sudo systemctl start evremap.service
```

It's also helpful to run `sudo systemctl status evremap.service` to confirm it's running as expected.
