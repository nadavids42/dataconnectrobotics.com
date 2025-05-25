---
title: Robot Arm V1 - Design and Build Begins
date: 2025-05-24T21:54:00
---
It’s been a little while since I’ve posted an update — mostly because I’ve been busy fixing up the first of my 3D printers and getting it tuned for serious work. After some firmware wrangling, Z-offset drama, and a few failed prints, I finally have it dialed in and ready to go.

Now the printer’s been running non-stop for over 13 hours, cranking out the base for my first full robotic arm — and I’m officially in _build mode_.

![Base Printing](/img/uploads/base_printing.jpg "Base Printing")

This project is built around a **PCA9685 PWM controller**, **MG996R servos**, and a **Raspberry Pi** as the brains. Power comes from a **bench power supply** set to 6V, which has replaced my original plan of using multiple buck converters. That change really simplified the wiring and freed up space inside the build.

So far, I’ve modeled the **base and the lid of the base** in FreeCAD using a single parametric tree structure, and I’m currently working on the **first servo enclosure**. It’s been a fun challenge figuring out how to make everything modular, printable, and clean. For the gripper, I’ve purchased a pre-made STL file that should suit my needs — but I’ll design one from scratch if it turns out to be too small or not quite right.

### Components so far:

- 4 × MG996R servos
- 1 × MG90S for lighter articulation
- PCA9685 servo controller
- Raspberry Pi (for brains)
- 30V/10A bench power supply (currently set to 6V)
- Ender 3 3D printer — putting in serious overtime

Once the base is done printing, I’ll move on to finishing the servo enclosure and start test fitting all the components. Still debating whether to mount the PCA9685 inside the base or create a dedicated housing for it that attaches to the lid — both layouts have pros and cons. Either way, it's exciting to finally see the pieces coming together.

Stay tuned for more photos, test movements, and some shaky servo dance moves.
