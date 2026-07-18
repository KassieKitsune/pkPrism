# pkPrism
Loosely inspired by [Pluralchum](https://github.com/estroBiologist/pluralchum), pkPrism is a Vencord plugin that displays PluralKit members' names in color according to their profile settings.

# Installation
## Option A: Build Vencord from Source 
This option is recommended if you have a comfortable relationship to your system's terminal(command prompt) or have installed other Vencord userplugins before. Truth be told, we still recommend this method for everyone -- click details in each step for a complete breakdown if Vencord's instructions on this process are confusing.
<details>

#### Step 1. Follow the Instructions on [installing Vencord from source](https://docs.vencord.dev/installing/)
<details>

0. Open your terminal/commmand prompt. 
    -On Windows we reccomend command prompt(cmd) over Powershell 
        -if something goes wrong in this step anyways, follow these instructions with your command prompt open in Administrator Mode
1. Download and install [Git](https://git-scm.com/install/)<br>
2. Download and install [Node](https://nodejs.org/en/download/)<br>
3. Download and install [pnpm](https://pnpm.io/installation)<br>
    - you can do this by running ```npm install -g pnpm@latest-11``` in your terminal
4. Navigate to an easily accessible directory from within your terminal<br>
use the example commands bellow if you don't know where to navigate to.
    - **Windows** ```cd %USERPROFILE%\Documents``` 
    - **Linux** ```cd ~``` (You should already be in this directory)
    - **Mac** ```cd ~/Desktop```
5. Clone Vencord, install dependencies, and create userplugins folder
    1. run ```git clone https://github.com/Vendicated/Vencord```
    2. run ```cd Vencord```
    3. run ```pnpm install --frozen-lockfile```
    4. run ```mkdir src\userplugins```
6. install [pkapi.js](https://github.com/greys-tools/pkapi.js#installation)
    - you can do this by running ```pnpm install -g pkapi.js``` in your terminal

> If you used the suggested commands in substep 4, you should see a Vencord folder<br>
**Windows** In your Documents Folder<br>
**Linux** In your Home Directory<br>
**Mac** On your Desktop.<br>
Inside you should find a folder called src, inside that folder should be a folder called userplugins.

7.skip to step 3. **Keep your terminal open.**

</details>

#### Step 2. Install [pkapi.js](https://github.com/greys-tools/pkapi.js#installation)<br>
If you followed Step 1 correctly, you should be able to do this by simply copying & pasting this into your terminal. 
``` 
pnpm install -g pkapi.js
``` 
#### Step 3. Follow the Instructions on [installing custom Vencord plugins](https://docs.vencord.dev/installing/custom-plugins/)
<details>

1. Download this repository<br>You can either:

- Clone this repo (Recommended)
    - using the same terminal window from step 1, run:
    ```
    cd src/userplugins
    git clone https://github.com/KassieKitsune/pkPrism
    ```
***OR*** 
- Use your file manager:

    1. Download this project as a zip (the green code button next to the About section)
    2. Put the zip in the userplugins folder created in step 1
    3. Right click and extract the zip
        - This should create a new folder, if it does not, create one and drag the unzipped files into it
2. Build Vencord
   in the same terminal window from step 1,
   run the following command
   ```
   pnpm build
   ```
   This can take some time, wait for it to finish
4. Inject 
   run
   ```
   pnpm inject
   ```
   Select the default options when prompted. Discord should close when this is done. pkPrism should be available in the plugins menu when you open Discord again.

</details>
</details>

> **Updating pkPrism** If are here to update your existing pkPrism install, or have previously installed other userplugins, You only need to open your terminal in your existing Vencord folder and do step 3.

## Option B: using [Veskforge](https://github.com/Microck/veskforge)
This option is recommended if you have not yet gotten to know your terminal and are still working up the courage to ask it out. <details>
#### Step 1. Install [Node.js](https://nodejs.org/en/download/) & [Git](https://git-scm.com/)
- You should be able to download installers for each at the locations linked above.

#### Step 2. Install [Veskforge](https://github.com/Microck/veskforge/releases) & Install Missing Tools
- Open Veskforge and go to the build tab, if you followed step 1, you should be able to click the "Install Missing Tools" button without any errors.
- If you are not already using [Vesktop](https://vesktop.dev/) as your vencord client, download, install and open it before continuing

#### Step 3. Add this repo as a Source in Veskforge
- Paste ```https://github.com/KassieKitsune/pkPrism.git``` into the "Git Url" field when adding a git repository source to Veskforge

#### Step 4. Install [pkapi.js](https://github.com/greys-tools/pkapi.js#installation)
- Open a terminal/command prompt and run ```pnpm install -g pkapi.js``` in your terminal/command line. This should be the only console command necessary for this method. If it does not work, go back to step 1.

#### Step 5. Build & Install Vesktop in Veskforge
- If Vesktop is open, Veskforge should be able to detect it automatically, otherwise you may need o locate your vesktop install and input it manually. If something goes wrong here, go back to step 4.

> **_NOTE:_** <i>Vesktop essentially runs Vencord in a custom browser container. This has its own advantages (such as never needing to re-install Vencord) but it also has a few drawbacks. Most notably the way it handles voice and screenshare audio can prove problematic in some cases</i>s
</details>

> **Updating pkPrism** If are here to update your existing pkPrism install, You can do so by running and applying the build again in Veskforge. If that does not work, you may need to locate and delete the existing plugin folder within your Veskforge checkout location (which can be found in the "build" tab of Veskforge) OR open that folder in your terminal/command prompt and run `git pull`
___

### Features
#### Lightness Adjustment
Have your friends set colours that are... lets say, not to your liking? <br>Or maybe they just don't stand out well against your custom themes? <br>pkPrism lets you set a range for HSL lightness used for names.

<b>Without Adjustment<br>
![no adjustment](https://github.com/KassieKitsune/pkPrism/blob/master/images/Marian-0-lightness.png)<br>
With 50% minimum lightness<br>
![50% minimum lightness](https://github.com/KassieKitsune/pkPrism/blob/master/images/Marian-50-lightness.png)</b>

#### ID Color Assignment
Have your friends just... not set any colors? at all? that's a little disappointing...<br>
No worries, we've got just the thing.
Enable ID Colors in the plugin settings, and anybody who does not have a color set will be assigned one based on their Pluralkit member ID.

#### Rich Presence Fronter
Tired of people asking who's fronting? <br>Just turn on Rich Presence to broadcast it on your profile. <br>
Available in standard<br>
![StandardRPC](https://github.com/KassieKitsune/pkPrism/blob/master/images/Eve-rich-standard.png) <br>
Covert<br>
![CovertRPC](https://github.com/KassieKitsune/pkPrism/blob/master/images/Avy-rich-covert.png)<br>
Or even custom styles<br>
![CustomRPC](https://github.com/KassieKitsune/pkPrism/blob/master/images/JY-rich-custom.png)<br>

> **_A NOTE ON PRIVACY:_** *We know that not every system is out to everybody they know on Discord - or has any need to show fronters-. As such Rich Presence is off by default. Even when on, it abides by your Activity Privacy settings as configured in your regular Discord settings and would not show itself to anyone who would not otherwise be able to see what game you're playing or what song you're listening to*

> **_NOTE:_** pkPrism is still under development, and new features are on the way, check for updates as they come!
___

### Limitations & Known Issues
1. Member colours aren't updated when changed.
    - Click on any message belonging to that to update it manually. 
2. Incompatible with the official IrcColors plugin
    - Both plugins patch the info in the same fields in the same way. As of right now this will cause them to conflict with one another.(And tbh we referenced the source code of that plugin heavily
___

### Why isn't this an official plugin?
Similar plugins have been requested and submitted for the main Vencord fork at least three or four times by our count. Each time they were rejected on the basis of being too niche and their creators subsequently abandonned the projects.
<center>

## Testimonials
<details>
These are all real quotes and sentiments from various members of our system during the development of pkPrism<p>
    
><b>"This is how I find out that my daughter hasn't set a color for her pk profile at all"</b>
<br> 🍫 A Girl-Dad Dad-Girl<p>

><b>"It matches my hair!"</b>
<br> 🪙 A Daughter<p>

><b>"I set my name color to match the 'missing' color"</b>
<br> 👾 A Hacker from Punklorde<p>

><b>"Look, I'm just glad the chittering rodents have one less thing to complain about"</b>
<br> ⌬ An Enigmatic Alchemist<p>

> <b>"I smorpy"</b>
<br> this thing:<br>![this thing](https://media1.tenor.com/m/q1SAg75triUAAAAd/fei-ren-zai-fox.gif)<br> </center>
</details>
