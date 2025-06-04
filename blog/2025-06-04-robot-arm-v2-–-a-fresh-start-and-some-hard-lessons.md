---
title: Robot Arm V2 – A Fresh Start (and Some Hard Lessons)
date: 2025-06-03T23:25:00
---
Now, I know what you're thinking... **What happened to V1?**

Well, let’s just say **V1 looked great in FreeCAD** but didn’t survive the harsh reality of assembly. I designed a fully enclosed “shoulder box” without any way to actually complete the build—or worse, to service it later. I realized halfway through that if something went wrong inside, it would be like performing surgery through a mail slot.

That wasn’t the only issue. I also learned (the hard way) that **heat set inserts really do need the proper tool**. You _can_ try to improvise with a soldering iron tip, but if you value your sanity and your prints, do yourself a favor and get the real thing. On top of that, my FreeCAD file had turned into a messy tangle of copied bodies, broken references, and ghost sketches. It was time to nuke the whole thing and start over.

---

## Enter V2: Smarter, Cleaner, and (Hopefully) Functional

V2 hasn't exactly been smooth sailing either, but at least it's been forward motion.

I had my first run-in with a **tangled filament spool**, which led to one of my printers happily “printing” nothing but air for over 13 hours. That was a special kind of heartbreak. And then one of my printers needed its first repair—an overnight print for my wife turned into spaghetti due to a **broken Bowden tube** on my second machine. PLA was spooling into open air, never reaching the hot end. The good news? Replacement parts were cheap, and now I’ve got enough tubing and fittings for a couple more mishaps.

---

## Design Updates

V2’s base borrows from the V1 footprint—a 200x200x25mm tray—but adds **internal supports for steel BBs** to act as ballast. I’ve loaded in 1kg so far, but there’s still plenty of room, and I may bump it up to 2kg for extra stability during movement.

From there, **V2 opens up.** Instead of a closed boxy shoulder enclosure, the new design features **vertical posts supporting a lazy Susan bearing**, which will carry the weight and structure of the rotating upper arm.

![V2_Base](/img/uploads/PXL_20250604_032359579.PORTRAIT.jpg "V2_Base")

---

## The Current Struggle: The Dreaded Coupler

Right now, my biggest hurdle is the **servo coupler**—the piece that connects the servo horn to the inner ring of the lazy Susan. In theory, this should be straightforward: align the holes on the servo horn with the holes on the bearing, insert screws, done.

In practice? I’ve printed **four versions so far**, and each one has been just slightly _off_. Despite the sketches matching my real-world measurements down to the millimeter, the printed result never quite lines up. I've adjusted dimensions, changed constraints, even hand-drawn the measurements with pencil and ruler. My latest revision has slightly **oversized holes** to introduce some tolerance, and it’s currently on the printer. Fingers crossed.

---

## What’s Next?

If this next coupler fits, it’ll be time to **power up the servos and test shoulder rotation**. I haven’t wired up anything yet, but once I’ve confirmed mechanical function, I’ll start testing motion using the PCA9685 board and a Raspberry Pi controller.

V2 is shaping up to be everything V1 wasn’t—**modular, repairable, and testable**. And most importantly, it’s an actual real-world object, not just a CAD fantasy.

---

## Parts List (So Far)

| Component | Details |
| --- | --- |
| Base + Lid | 3D printed, 200mm x 200mm x 25mm tray with support posts |
| Steel BBs | 1kg so far, planning to add more |
| Lazy Susan Bearing | 120mm diameter (4-hole inner and outer rings) |
| MG996R Servos (x2 so far) | Standard torque servos, powering shoulder and (eventually) elbow |
| Servo Horns | Circular, metal, made for MG996R |
| Coupler (WIP) | Custom-designed to connect servo horn to lazy Susan inner ring |
| FreeCAD | For all CAD design (and many rebuilds) |
| Ender 3 3D Printers (x2) | Both operational—after some Bowden tube drama |
| Heat Set Inserts | M3 and M5, installed with proper soldering iron tool |
| M3 & M5 Screws + Washers | Used for all structural and servo mounting connections |
| Raspberry Pi 5 | Will be used for control logic + servo signal via PCA9685 |
| PCA9685 Servo Driver | PWM controller for managing multiple servos with external power |
| 6V Power Supply | For powering the servos independently from the Pi |

---

**More to come soon!** Once the shoulder is moving, it’s full steam ahead on the elbow joint.
