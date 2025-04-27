---
title: 2-Wheeled Smart Car Version 1
date: 2025-04-25T22:12:00
---
For years, I dreamed of building my own robot from scratch, but always found a reason to put it off: too busy, missing parts, or just not sure where to start. This spring, I decided to stop overthinking and actually build something—a simple 2-wheeled smart car. This post is about V1: my very first prototype, imperfections and all.

![V1](/img/uploads/v1.jpg "V1")

### Why Start With a 2-Wheeled Car?

I wanted a project that was basic and hands-on, but also adaptable enough for kids or adults to learn from. Two-wheeled robots are like the “hello world” of physical computing—you get to experiment with motors, sensors, wiring, and code, but you don’t need an engineering degree to get rolling (literally).

### The “Final” Parts List

I say “final” loosely, because I changed my mind about half a dozen times during the build. Here’s what I ended up using:

- RC 2WD Car Chassis Kit from Amazon (modified)
- ESP32 Microcontroller
- 3 x 18650 Batteries & Battery Holder
- Half Breadboard & Mini Breadboard
- 2 Metal Gear TT DC Motors
- L298N Motor Driver
- Mini 5V Buck Converter
- HC-SR04 Ultrasonic Sensor
- 2 x TCRT5000 IR Sensors
- Assorted wires, resistors, and hardware

### Building (and Troubleshooting) V1

Most of V1 was just me figuring things out as I went. My original plan was to use an Arduino, but I quickly realized that space was going to be a problem. After a late-night research spiral, I landed on the ESP32 microcontroller: it had built-in WiFi and Bluetooth, plus a tiny footprint. Or so I thought.

If you’ve never worked with one before, here’s a fun fact: the ESP32 will technically fit in a standard breadboard, but only just. The moment you press it in, it blocks access to almost all the pins on one side. To work around this, I paired a half breadboard with a mini breadboard. Space was so tight, I ended up wedging the mini breadboard directly underneath the ultrasonic sensor, which made rewiring awkward at best.

Programming the ESP32 turned out to be its own headache. Even after installing all the necessary board software, I couldn’t get the Arduino IDE to upload code. I tried uninstalling and reinstalling, rolling back to an older IDE, and even running a local isolated copy—nothing worked. Eventually, switching to PlatformIO in Visual Studio Code solved the problem.

### Lessons from V1

After all that tinkering, I realized this design was a little too complex and finicky for a beginner robotics class. The next version will be simpler, easier to assemble, and friendlier for folks just starting out. Still, V1 taught me a lot about problem-solving and adapting on the fly—and sometimes that’s the most valuable outcome.
