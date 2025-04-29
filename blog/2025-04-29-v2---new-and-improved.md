---
title: V2 - New and Improved
date: 2025-04-28T21:47:00
---
## Project Summary

![V2 Head On](/img/uploads/head_on.jpg "V2 Head On")

I had just gotten a new chassis before we left for April vacation, so I was eager to start building shortly after we got home. From the start, I knew V2 was going to be a cleaner, more refined design — but I was surprised by how quickly it came together.

My ultimate goal with this build was to make it simple enough for use in a robotics class. To work toward that, I swapped out the ESP32 and 18650 batteries for an Arduino Uno and standard AA batteries, aiming for easier setup and fewer potential issues.

Other than those key changes, the overall parts list stayed very similar to V1.
I don't think we're quite ready for the classroom yet — but we're getting closer. Here's how the build went, and why I made certain choices.

## Parts List

- RC 2WD Car Chassis Kit from Amazon (modified)
- Arduino Uno Microcontroller
- 6 x AA Batteries and Battery Holder
- Half Breadboard
- 2 x Metal Gear TT DC Motors
- L298N Motor Driver
- Mini 5V Buck Converter
- HC-SR04 Ultrasonic Sensor
- 2 x TCRT5000 IR Sensors
- Assorted wires, resistors, and hardware

## Build Log

![L298N Positioning](/img/uploads/positioning.jpg "L298N Positioning")

Since I'm still sourcing parts mainly from Amazon, the chassis needed a little modification before I could properly attach all the components.
I drilled holes in the chassis for the L298N motor driver, and also drilled into the battery holder to mount it securely. I chose to mount everything on standoffs to create cleaner space for wiring and airflow.

![Mounted L298N & Battery Holder](/img/uploads/mounted.jpg "Mounted L298N & Battery Holder")

I positioned the battery holder and motor driver together on the same half of the chassis, with the L298N motor driver mounted on the underside.
This setup allowed me to tuck the main power wires neatly over the back edge of the car and connect them directly to the motor driver.

Next, I mounted the upgraded all-metal TT DC motors. I opted for these right away since V1 was eventually upgraded to them (after the original plastic motors struggled with weight and performance).
The small cost for the upgrade is absolutely worth it for the durability and torque.

![TT DC Motors](/img/uploads/PXL_20250425_193744418.jpg "TT DC Motors")

On the front half of the chassis, I mounted the Arduino Uno and added the sensors.
I made a few sensor positioning changes from V1:

- I moved the IR sensors out to the chassis's outermost holes.
- I mounted the ultrasonic sensor _underneath_ the front edge instead of on top.

The idea behind the new ultrasonic sensor placement was to catch lower obstacles that V1 sometimes missed.

![Arduino Uno](/img/uploads/Arduino_Uno.jpg "Arduino Uno")

Wiring everything went much cleaner this time around, though **wire management** is still a challenge on these small robots.
To save space, I mounted a half breadboard directly onto the top of the battery holder using adhesive tape.

Thanks to the Uno's ability to tolerate 5V directly (unlike the more sensitive ESP32), I didn't need to route sensor wiring through the breadboard — only power step-down and distribution were needed there.

![V2 Side View](/img/uploads/side_view.jpg "V2 Side View")

## Lessons Learned & Next Steps

While this build only took a few hours from start to finish, it's still not quite simple enough for a classroom model yet.
There’s still an extra layer of complexity I want to remove to make it even easier for beginners.

One major improvement would be designing a **custom 3D-printed chassis** — something purpose-built for this type of car, with pre-aligned, pre-sized mounting holes. No more drilling or workarounds.
I'm hoping to have a 3D printer in place by this summer to start prototyping.

Finally, while the hardware build has improved, the **software side** still needs work.
Right now, the robot’s driving and obstacle detection aren’t as consistent as I'd like — which could be due to both hardware calibration _and_ code tuning.

In a future post, we’ll dive deeper into the software side — refining both the logic and calibration that really bring these robots to life!
