# Kermite Firmware Developer's Documentation

This document summarizes the information needed to create custom firmware for individual keyboards.

## Custom Firmware Overview

When using Kermite with a DIY keyboard, standard firmware is provided for the functions required for a commonly designed keyboard. Standard firmware allows users to edit pin assigns and other configuration values from Kermite's GUI and inject the configuration values into pre-built binaries without any user-side build.

Custom firmware can be implemented for special functions that cannot be achieved with the standard firmware functions, or for keyboard-specific customized processing.

The source code for custom firmware is maintained in the Kermite repository. This is to ensure that all custom firmware is rebuilt and updated when the basic specifications of Kermite's firmware or RawHID communication specifications are changed. Please note that if the basic specifications of the firmware are changed, it must be re-built and updated.

## Folder Structure
<pre>
src
├─ modules
└─ projects
    ├─ __stencils
    ├─ keyboard1
    ├─ keyboard2
    ├─ dev
    │ ├─ keyboard3
    │ ├─ keyboard4
    ├── standard
    │   ├── rp
    │   └── rp_split
    ├─ study
    │ ├─ keyboard5
    │ └─ keyboard6
    └─ ...
</pre>
Under `src` of `Kermite/firmware`, the folder structure is as follows.
* Under `modules`, commonly used keyboard functions are provided.
* Under `projects`, implementations of each keyboard are placed.
  * Official implementations by kit developers are placed directly under `projects`.
  * `projects/__stencils` contains template code for use by each project.
  * `projects/standard` contains the implementation for standard firmware.
  * `projects/dev` contains projects for debugging, excluded from CI builds.
  * `projects/study` contains experimental code for module development.

If you want to add a new keyboard project, please create a folder under `projects` with the keyboard name and place code and configuration files there.

## Keyboard project folder structure

The firmware implementation of each keyboard is called a project. A project consists of the following files.

<pre>
  keyboard1
  ├─ variation1
  │ ├─ config.h
  │ └─ rules.mk
  ├─ default.layout.json
  ├─ default.profile.json
  └─ project.json
</pre>

You can specify any name for keyboard1, variation1, profile1, etc.
keyboard1 is the project name. A project can have multiple firmware implementations, which we call variations.

| filename | description |
| :--- | :--- |
| config.h | Defines the values to be referenced in the firmware. |
| rules.mk | Called from the parent Makefile at build time. |
| *.layout.json | Defines the key layout and the outline of the keyboard. |
| project.json | Describes project-specific information. |

(*) JSON for layouts and presets can be created using utility software.

## Firmware ID
Each project has an alphanumeric 6-digit, non-overlapping ID. This ID is stored in the microcontroller's ROM and is used by the utility software to determine the type of the keyboard when it is detected. If you want to create a new project, please use the following generator to get it.

https://kermite-org.github.io/KermiteResourceStore/generator



## Branch Configuration, Repository Configuration
The common firmware modules and utility software are implemented in the `master` and `develop` branches.

Apart from this, there is a `variants` branch for each keyboard firmware application. The source code of the firmware merged into the `variants` branch is built by CI (github actions), and the built binary is stored in the
<a href="https://github.com/kermite-org/KermiteResourceStore" mce_href="https://github.com/kermite-org/KermiteResourceStore">KermiteResourceStore</a>
Kermite utility software retrieves the latest firmware for each keyboard from this repository at runtime. Kermite utility software will fetch the latest firmware and layout definitions for each keyboard from this repository at runtime. (Actually, to avoid overloading the github server, this repository is pulled from the web server that publishes the contents.)

If you have new keyboard support, please create a PR for the `variants` branch, and the target firmware will be available from the utility software when the PR is merged into the `variants` branch.

## Repository Operation Policy

The following is tentative.

- Only the author (or co-developer) of the keyboard can add firmware.
- Firmware for keyboards that have not been released as a kit, or keyboards that you have personally made, should be placed under `projects/proto`.
- Firmware ID should be the value obtained by the generator.
- Kermite is under MIT license, so GPL code cannot be imported.
