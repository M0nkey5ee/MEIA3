//Your bladder variables
let yourbladder = 500;
let yourtummy = 200;
let yourtumavg = yourtummy;
let holdself = 0;
const holdpeethresh = 3; //Chance you'll still pee yourself even though you're holding your dick.

let yourbladurge = 500; // Level where you feel the first urge
let yourbladneed = yourbladurge * 2; // Level where you continuously needs to go
let yourblademer = yourbladurge * 3; // Level where it becomes an emergency
let yourbladlose = yourbladurge * 3 + 150; // Level where you lose control
let yourbladcumlose = yourbladurge * 4; // Level where you lose it as you cum
let yourbladsexlose = yourbladurge * 5; // Level where you can't control it during sex

let ymaxtummy = 500; // Drink capacity of stomach
const ymaxbeer = 1000; // Beer capacity of stomach

let yourcustomurge = 500;
let yminurge = 375; //Bladder never decays below this

//  The following are used to keep track of what you drank and when you last went
// Might be used later on.
let ylastpeetime = 0;  // When did you last go?
let ytimeheld = 0; // for stats

let ydrankcocktails = 0;
let ydranksodas = 0;
let ydrankwaters = 0;
let ydrankbeers;

let ydrankbeer = 0; //Did you drink beer? changes capacities and rates.

//Initializes the bladder values for you
function initYUrge(urge){
    yminurge = urge * minperc/100;
    updateyoururge(urge);
}

function updateyoururge(newurge) {
    if (newurge < yminurge) newurge = yminurge;
    newurge = Math.round(newurge);
    yourbladurge = newurge;
    yourbladneed = newurge * 2;
    yourblademer = newurge * 3;
    yourbladlose = newurge * 3 + 150;
    yourbladcumlose = newurge * 4;
    yourbladsexlose = newurge * 5
}

function flushyourdrank() {
    //  Derate bladder capacity if you loses it...
    if (bladDec) {
        if (yourbladder >= yourbladlose) updateyoururge(yourbladurge * 9 / 10);
        else if (yourbladder >= yourblademer && bladDespDec) updateyoururge(yourbladurge * 9.5 / 10);
        //bladder decays based on breaking can only once an hour
        else if (seal && ydrankbeer > 15 && ybeerdecCounter > 30) {
            updateyoururge(yourbladurge * 9.5 / 10);
            ybeerdecCounter = 0;
        }
    }

    yourbladder = 0;
    ydrankwaters = 0;
    ydrankcocktails = 0;
    ydrankbeers = 0;
    ydranksodas = 0;
    ylastpeetime = thetime;
    yrrlockedflag = 0;
    ynowpeeing = 1;
}

//TODO lose control when bursting on the way
//TODO add a chance of her denying you
function youpee() {
    let curtext = [];
    gottagoflag = 0;
    let peed = 0;
    if (locstack[0] === "yourhome") {
        curtext = printList(curtext, ypeelines["yourhome"]);
        peed = 1
    } else if (locstack[0] === "thehome" ||
        locstack[0] === "thebedroom" || locstack[0] === "pickup" || locstack[0] === "fuckher6") {
        if(locstack[0] !== "fuckher6") {
            curtext = printList(curtext, ypeelines["thehome"][0]);
        }
        curtext = printList(curtext, ypeelines["thehome"][1]);
        peed = 1
    } else {
        curtext = printList(curtext, ypeelines["remaining"]);
    }

    if ((locstack[0] === "thebar" && randomchoice(rrlockedthresh) ) || ((locstack[0] === "theclub" || locstack[0] === "dodance") && randomchoice(rrlinethresh)) ) {
        curtext = youbathroomlocked(curtext);
    } else if (locstack[0] === "darkbar" || locstack[0] === "darkmovie" || locstack[0] === "darkclub") {
        //TODO potentially cycle between quotes
        if (yourbladder > yourbladlose - 25)
            curtext.push(ypeelines["youpeeprivate"][0]);
        else
            curtext.push(ypeelines["youpeeprivate2"][0]);
        flushyourdrank();
    } else {
        if (yourbladder > yourbladlose - 25 && !peed)
            curtext.push(pickrandom(ypeelines["youpeeprivate"]));
        else if (!peed)
            curtext.push(pickrandom(ypeelines["youpeeprivate2"]));
        flushyourdrank();
    }
    if (yourbladder >= yourbladlose - 25 && locstack[0] !== "thehottub") curtext = youbegtoilet(curtext);
    else {
        curtext = c([locstack[0], "Continue..."], curtext);
    }
    sayText(curtext);
}

function youbathroomlocked(curtext) {
    const locked = ypeelines["locked"];
    //Description of the situation
    if (locstack[0] === "thebar")
        curtext.push(locked["bar"]);
    else {
        curtext.push(locked["club"]);
    }
    //Description of your reaction, based on how badly you have to go
    if (yourbladder > yourblademer)
        curtext.push(locked["urgency"][0]);
    else if (yourbladder > yourbladneed)
        curtext.push(locked["urgency"][1]);
    else
        curtext.push(locked["urgency"[2]]);
    if(locstack[0] === "thebar") {
        //Tell her the bathroom was locked, depending on how often you tried already
        if (yrrlockedflag > 3) {
            curtext.push(locked["cbar"][0]);
        } else if (yrrlockedflag > 2) {
            curtext.push(locked["cbar"][1]);
        } else if (yrrlockedflag) {
            curtext.push(locked["cbar"][2]);
        } else {
            curtext.push(locked["cbar"][3]);
        }
    } else {
        //Tell her the line was too long, depending on how often you tried already
        if (yrrlockedflag > 3) {
            curtext.push(locked["cclub"][0]);
        } else if (yrrlockedflag > 2) {
            curtext.push(locked["cclub"][1]);
        } else if (yrrlockedflag) {
            curtext.push(locked["cclub"][2]);
        } else {
            curtext.push(locked["cclub"][3]);
        }
    }
    yrrlockedflag++; //Increase how often you tried
    curtext = displayneed(curtext);
    return curtext;
}

function displayyourneed(curtext) {
    if (yourbladder >= yourbladlose && !holdself) {
        curtext.push(pickrandom(yneeds["burst"]));
    } else if (yourbladder > yourblademer) {
        curtext.push(pickrandom(yneeds["desperate"]));
    } else if (yourbladder > yourbladneed) {
        curtext.push(pickrandom(yneeds["need"]));
    } else if (yourbladder > yourbladurge) {
        curtext.push(pickrandom(yneeds["urge"]));
    } else if (locstack[0] === "drinkinggame") {
        curtext.push(pickrandom(yneeds["empty"]));
    }
    return curtext
}

//TODO more variety? and implement for different locations
//TODO test
function ypeeshot() {
    let curtext = [];
    curtext.push(yneeds["ypeeshot"][0]);
    // s("YOU: I got a shot glass. Here hold this for a minute.");
    if (locstack[0] === "driveout")
        curtext.push(yneeds["ypeeshot"][1]);
    // s("You give her the shot glass so you can open your fly with the hand that is not holding the steering wheel.");
    else
        curtext.push(yneeds["ypeeshot"][2]);
    // s("You give her the shot glass so that you can use both hands to open your fly.");
    curtext.push(yneeds["ypeeshot"][3]);
    // s("You quickly whip your dick out, not really caring that she can see it.");
    curtext = printChoicesList(curtext, [0], yneeds["choices"]);
    // c("ypeeshot2", "Continue...");
    sayText(curtext);
}

//TODO test
function ypeeshot2() {
    let curtext = [];
    curtext.push(yneeds["ypeeshot"][4]);
    curtext.push(yneeds["ypeeshot"][5]);
    curtext.push(yneeds["ypeeshot"][6]);
    curtext.push(yneeds["ypeeshot"][7]);
    // s("You urgently reach your hand to her.");
    // s("YOU: Give me the glass, it's coming out!");
    // s(girlname + "quickly hands you the glass.");
    // s("You push it in place before allowing your muscles to relax.");
    curtext = printChoicesList(curtext, [1], yneeds["choices"]);
    // c("ypeeshot3", "Continue...");
    sayText(curtext);
}

//TODO test
function ypeeshot3() {
    let curtext = [];
    if (locstack[0] === "driveout")
        curtext.push(yneeds["ypeeshot"][8]);
    // s("The pee hisses out and the glass is filled in no time. You groan at the effort it takes to stop the flow, you can't grasp yourself as both your hand are occupied.");
    else
        curtext.push(yneeds["ypeeshot"][9]);
    // s("The pee hisses out and the glass is filled in no time. You grab your dick as you force to flow to stop. It is hard but you manage with a groan.");
    curtext.push(yneeds["ypeeshot"][10]);
    // s("YOU: Damn. That's not much better.");
    attraction += 10;
    yourbladder -= 100;
    curtext = printChoicesList(curtext, [2], yneeds["choices"]);
    sayText(curtext);
    // c(locstack[0], "Continue...");
}

//TODO locations that are not the car
//TODO test
function ypeevase() {
    let curtext = [];
    curtext.push(yneeds["peevase"][0]);
    // s("YOU: I got a vase. Here hold this for a minute.");
    if (locstack[0] === "driveout")
        curtext.push(yneeds["peevase"][1]);
    // s("You give her the vase so you can open your fly with the hand that is not holding the steering wheel.");
    else
        curtext.push(yneeds["peevase"][2]);
    // s("You give her the vase so that you can use both hands to open your fly.");
    // s("You quickly whip your dick out, not really caring that she can see it.");
    curtext.push(yneeds["peevase"][3]);
    curtext = printChoicesList(curtext, [3], yneeds["choices"]);
    // c("ypeevase2", "Continue...");
    sayText(curtext);
}

//TODO test
function ypeevase2() {
    let curtext = [];
    curtext.push(yneeds["peevase"][4]);
    curtext.push(yneeds["peevase"][5]);
    curtext.push(yneeds["peevase"][6]);
    curtext.push(yneeds["peevase"][7]);
    // s("You urgently reach your hand to her.");
    // s("YOU: Give me the vase, it's coming out!");
    // s(girlname + " quickly hands you the vase.");
    // s("You push it in place before allowing your muscles to relax.");
    curtext = printChoicesList(curtext, [4], yneeds["choices"]);
    // c("ypeevase3", "Continue...");
    sayText(curtext);
}

//TODO test
function ypeevase3() {
    let curtext = [];
    curtext.push(yneeds["peevase"][8]);
    curtext.push(yneeds["peevase"][9]);
    // s("The pee hisses out for nearly a minute and the vase is almost filled to the to the top");
    // s("YOU: Oh! That's much better.");
    attraction += 10;
    flushyourdrank();
    curtext = printChoicesList(curtext, [2], yneeds["choices"]);
    // c(locstack[0], "Continue...");
    sayText(curtext);
}

//TODO better scene
function ypeeintub() {
    s("You relax your muscles while acting as if nothing happens.");
    s("She doesn't notice that you're peeing right next to her.");
    s("You can't help but get a bit aroused.");
    flushyourdrank();
    c(locstack[0], "Continue");
}

//TODO a Can I watch option
function ypeeoutside() {
    if (yourbladder < yourblademer)
        s("<b>YOU:</b> Hang on I need a pee.");
    else {
        s("<b>YOU;</b> Hold up I really need to pee!");
        s("You are messaging your crotch to help you hold it.");
    }
    if (locstack[0] === "themakeout") c("ypeeoutside2", "Continue...");
    else c("ypeeoutside2b", "Continue...");
}

//In the car
function ypeeoutside2() {
    s("You step out of the car and lower your zipper. You check if no one is around before you pull your penis out.");
    c("ypeeoutside3", "Continue...");
}

function ypeeoutside2b() {
    s("You lower your zipper and check if no one is around before you pull your penis out");
    if (locstack[0] === "thebeach") c("ypeeoutside3c", "Continue...");
    else c("ypeeoutside3b", "Continue...");
}

//TODO determine if she would watch and arousal
function ypeeoutside3() {
    s("You subtly turn towards the car so she could watch if she wanted to. The pee hisses out of your tip and runs in a stream under the car.");
    flushyourdrank();
    c(locstack[0], "Continue...");
}

function ypeeoutside3b() {
    s("You only turn away from her slightly, allowing her to watch if she wants to. The pee hisses out from of your tip and runs in a stream along the ground.");
    s("As you zip back up you can't help but feel aroused.");
    flushyourdrank();
    c(locstack[0], "Continue...");
}

function ypeeoutside3c() {
    s("You only turn away from her slightly, allowing her to watch if she wants to. The pee hisses out from of your tip, it soaks quickly into the sand turning it dark.");
    s("As you zip back up you can't help but feel aroused.");
    flushyourdrank();
    c(locstack[0], "Continue...");
}

//Here's where we decide if you wet yourself or if you just spurted.
//TODO more original quotes (most are now stolen from her)
//TODO fix timings
function wetyourself() {
    s(ywetquote[randcounter]);
    incrandom();
    if (randomchoice(yspurtthresh) && locstack[0] !== "thehottub") {
        spurtedyourself();
    } else {
        yspurtthresh = 3;
        if (locstack[0] === "driveout")
            c("wetyourself2c", "Continue ...");
        else if (locstack[0] === "themakeout")
            c("wetyourself2m", "Continue ...");
        else if (locstack[0] === "thehottub")
            c("wetyourself2t", "Continue ...");
        else
            c("wetyourself2", "Continue ...");
    }
}

//TODO register you wet your pants
function wetyourself2() {
    s("You are helpless as your bladder uncontrollably empties itself.");
    s("Surely she can hear the hissing.");
    flushyourdrank();
    c(locstack[0], "Continue ...");
}

//You're in the make out spot
function wetyourself2m() {
    s("You frantically look around, wanting to safe your car seat. You fumble with the seat belt, then wrench the door open and jump out of the car.");
    wetyourself2();
}

//You're in the hottub
function wetyourself2t() {
    s("You stiffen and let out a shaky breath.");
    flushyourdrank();
    s("You sigh and slump back in the tub, letting the relieve course through you.");
    s("When you are finally empty you open your eyes to meet hers");
    c("wetyourself3t", "Continue ...");
}

//You're in the car
//TODO register you wet the car
function wetyourself2c() {
    s("There is nothing you can do, your hands tighten on the steering wheel.");
    s("YOU: Dammit!");
    s("You are helpless as your bladder uncontrollably empties itself.");
    s("Surely she can hear the hissing.");
    flushyourdrank();
    c("wetyourself3c", "Continue ...");
}

function wetyourself3c() {
    s("YOU: I'm sorry about that. I really couldn't wait.");
    s("You uncomfortably shift in the squishy wet seat.");
    c(locstack[0], "Continue ...");
}


//In the tub
function wetyourself3t() {
    s("YOU: I'm <u>so</u> sorry... I just couldn't hold it.");
    s("The faint scent of your urine rises from the water.");
    s("YOU: I peed in the tub.");
    c(locstack[0], "Continue ...");
}

//TODO more text options and her reponse
function spurtedyourself() {
    yourbladder -= 50;
    yspurtthresh -= 0.1 * yspurtthresh;
    s("You manage to get your control back but you still let out a little bit.");
    c(locstack[0], "Continue ...");
}