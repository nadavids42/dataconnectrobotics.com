---
title: 2-Wheeled Smart Car Version 1
date: 2025-04-25T22:12:00
---
For years, I’ve wanted to build my own robot from scratch, but I always seemed to find reasons to put it off: too busy, not enough parts, or just not sure where to start. This spring, I decided to stop overthinking it and actually build something—a simple 2-wheeled smart car. This is the story of V1: the very first prototype, all its imperfections included.

![Version 1](/img/uploads/v1.jpg "Version 1")

### Why Start With a 2-Wheeled Car?

I wanted something basic, hands-on, and adaptable enough for kids or adults to learn from. Two-wheeled robots are the “hello world” of physical computing: you get to learn about motors, sensors, wiring, and code, but you don’t need an engineering degree to get something rolling (literally).

### Final... Parts List

_&#32;"Final..." as the list was adapted several times throughout the build.&#32;_

- RC 2WD Car Chassis Kit from Amazon (Modified)
- ESP32 Microcontroller
- 3 x 18650 Batteries
- 18650 Battery Holder
- Half Breadboard
- Mini Breadboard
- 2 x Metal Gear TT DC Motors
- L298N Motor Driver
- Mini 5V Buck Converter
- HC-SR04 Ultrasonic Sensor
- 2 x TCRT500 IR Sensors
- Wires, Resistors and Hardware. 

Most of V1 was pure “figure it out as I go.” My first instinct was to use an Arduino for the brains of the smart car, but I quickly realized space was going to be tight. A bit of late-night research led me to the ESP32 microcontroller. It looked perfect: built-in WiFi, Bluetooth, and a super compact form factor. At least, that’s what I thought—until I started fitting everything together and discovered the ESP32 is small, but not exactly _easy_ to place. (Spoiler: the awkward size definitely came back to haunt me.)
