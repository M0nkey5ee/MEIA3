
//
//  This function is used to leave ANY location and drive off.
//
function leavehm() {
    changevenueflag = 1;
    checkedherout = 0;
    kisscounter = 0;
    feelcounter = 0;
    rrlockedflag = 0;
    externalflirt = 0;

    let curtext = showneed([]);

    if (gottagoflag > 0) {
        curtext = printChoicesList(curtext, [0,1], drive["leavehm"]["choices"]);
        // c("holdit", "Ask her to hold it.");
        // c("allowpee", "Let her go.");
    } else {
        flirtedflag = 0;
        curtext.push("<b>YOU</b> " + pickrandom(drive["leavehm"]["outtahere"]));
        s("<b>YOU:</b> " + outtahere[randcounter]);
        incrandom();
        curtext.push(girltalk + "Yeah! " + pickrandom(drive["leavehm"]["outtahere"]));
        curtext = displayneed(curtext);
        curtext = displayyourneed(curtext);
        curtext = printChoicesList(curtext, [2], drive["leavehm"]["choices"]);
    }
    sayText(curtext);

}

let suggestedLocation

//TODO fix the go to the bar like she asked
function driveout() {
    let curtext = [];
    if (locstack[0] !== "driveout") {
        pushloc("driveout");
        locationMCSetup("driveout", drive);
        curtext = printIntro(curtext, 0);
        suggestedloc = "none";
        if (wetthecar)
            curtext.push(appearance["clothes"][heroutfit]["soakedseatquote"]);
            // s(soakedseatquote);
        else
            curtext = printIntro(curtext, 1);
        curtext = printIntro(curtext, 2);
    } else {
         curtext = printIntro(curtext, 4);
    }
    curtext = displayneed(curtext);
    //TODO can probably combine the printing things in the if statement
    if (suggestedloc === "none") {
        if (randomchoice(8)) {
            updateSuggestedLocation();
            if (suggestedloc !== "none")
                curtext = printDialogue(curtext, suggestedloc,0);
        }
    }
    curtext = displayyourneed(curtext);
    curtext = printAlways(curtext);
    sayText(curtext);
    printLocationMenu();
}

function nextstop() {
    s("<b>YOU:</b> I'll definitely stop at the next place I see.");
    s(girltalk + "Thanks!");
    displayneed();
    c(locstack[0], "Continue...");
}

function drivearound() {
    s("You are driving around with " + girlname + " in the passenger seat.");
    showneed();
    displayyourneed();
    if (bladder > bladlose) wetherself();
    else if (yourbladder > yourbladlose) wetyourself();
    else {
        if (yourbladder > yourblademer)
            c("drivetell", "Tell her you need to go.");
        if (gottagoflag > 0) {
            preventpee();
        } else standobjs();
        c(locstack[0], "Continue...");
    }
}

function drivetell() {
    s("You shift uncomfortably in your seat, trying to focus on the road.");
    s("YOU: I'm bursting for a pee.");
    s(girltalk + "Then you better stop somewhere so you can go.");
    c("drivepee", "I can't wait.");
    c(locstack[0], "I'll stop at the next place I see.");
}

function drivepee() {
    s(girltalk + "Do you have anything you can pee in? A cup or something?");
    if (shotglass > 0) c("ypeeshot", "Pee in the shot glass.");
    //TODO figure out how towels would work for you
    // if ( ptowels > 0 ) c("peetowels" , "Pee in the roll of paper towels.");
    if (vase > 0) c("ypeevase", "Pee in the vase.");
    c(locstack[0], "No, I got nothing!")
}

