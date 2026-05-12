---
title: Enable browser access to keyboard firmware on Linux
date: 2026-05-10
description: "today iain learned: How to enable browser access to a keyboard's QMK firmware on Linux, via the USB HID interface and udev rules"
tags:
  - terminal
  - linux
  - keyboard
  - browser
  - hardware
hideTOC: false
draft: false
aliases:
---
Recently my [Keychron V5](https://www.keychron.com/collections/keychron-v-series-keyboard/products/keychron-v5-qmk-custom-mechanical-keyboard) keyboard suddenly reset all the key mappings for no particular reason, which was strange, but thankfully my mappings are not too elaborate and I could still function enough to get to the web app I usually use for configuring it.

I use the [VIA app](https://www.usevia.app/), and normally it's as simple as visiting the site and connecting to my keyboard via the [USB HID interface](https://en.wikipedia.org/wiki/USB_human_interface_device_class):

![[attachments/via-app-connection-attempt.png|VIA app keyboard connection attempt]]

Viewing the errors in the VIA app I was greeted with the following:

![[attachments/via-app-errors.png|VIA app errors]]

A bit of searching around and I was highlighted to the Chromium device log, which you can access with a URL like this in your browser (may be slightly different depending on which browser you use):

`chrome://device-log` OR `helium://device-log` OR `brave://device-log`

There I could see some errors related to permissions to this device:

![[attachments/helium-device-log.png|Helium device log]]

Here's one entry in more detail:

```txt title="helium://device-log"
HID Event [20:57:04] Failed to open '/dev/hidraw4': FILE_ERROR_ACCESS_DENIED
HID Event [20:57:04] Access denied opening device read-write, trying read-only.
```

A quick, once off solution would be to change the permissions to that device, but they will reset if the keyboard is unplugged or computer is restarted:

```sh
sudo chmod 766 /dev/hidraw4
```

A more permanent solution is to add a `udev` rule. This page on the [QMK firmware docs](https://docs.qmk.fm/faq_debug#hid-listen-can-t-recognize-device) explains the required rule, but the first step is to find the device ID with `lsusb`:

```sh
$ lsusb | grep Keychron
Bus 006 Device 004: ID 1234:5678 Keychron Keychron V5
```

Here the vendor ID and product ID are the parts before and after the colon, respectively: e.g. `1234:5678`.

Then I launch Neovim with `sudo` and add the new `udev` rule file:

```sh
sudo nvim /etc/udev/rules.d/70-hid-listen.rules
```

With the following content, based on the IDs obtained above:

```txt title="/etc/udev/rules.d/70-hid-listen.rules"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="1234", ATTRS{idProduct}=="5678", TAG+="uaccess", RUN{builtin}+="uaccess"
```

And lastly, reload the `udev` rules and trigger a change:

```sh
sudo udevadm control --reload-rules
sudo udevadm trigger
```

And then I can connect my keyboard and the VIA app will run happily!

![[attachments/via-app-mascot.png|VIA app smiling mascot]]
