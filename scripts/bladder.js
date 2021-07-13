//This file contains all functions related to peeing
//TODO organize this better

//Her bladder variables
let customurge = 250;
let minurge = 187; //Bladder never decays below this

let minperc = 75; //Percentage of the minimumvalue of the bladder

let bladurge = 250; // Level where she feels the first urge
let bladneed = bladurge * 2; // Level where she continuously needs to go
let blademer = bladurge * 3; // Level where it becomes an emergency
let bladlose = bladurge * 3 + 150; // Level where she loses control
let bladcumlose = bladurge * 4; // Level where she spurts as she cums
let bladsexlose = bladurge * 5; // Level where she can't control it during sex

let maxtummy = 250; // Drink capacity of stomach
const maxbeer = 500; // Beer capacity of stomach

let bladDec = 1;
let bladDespDec = 1;
let seal = 1;
let beerdecCounter = 0; //How long has it been since her bladder capacity has been decayed by beer
let ybeerdecCounter = 0; //How long has it been since your bladder capacity has been decayed by beer

//  So she doesn't seem unfamiliar with the concept after the first time.
let peedtowels = 0; // has she peed in your paper towels
let peedvase = 0; // has she peed in your vase
let peedshot = 0; // has she peed in the shot glass
let peedoutside = 0; // has she peed outside

//  The following are used by her to complain about how long she's
// been waiting and how much she's drunk.
let lastpeetime = 0;  // When did she last go?
let timeheld = 0; // for stats
let drankbeers = 0;
let drankcocktails = 0;
let dranksodas = 0;
let drankwaters = 0;

let drankbeer = 0; // has she drunk beer?  Changes capacities and rates.

// Flags for drinking game.
let notdesperate = 0; //neither you or her are desperate after drinking game.
let notydesperate = 0; //You aren't desperate but she is after drinking game.
let nothdesperate = 0; //She isn't desperate but you are after drinking game

//Initializes the bladder values for the girl
function initUrge(urge){
    minurge = urge * minperc/100;
    updateurge(urge);
}

// noinspection DuplicatedCode
function updateurge(newurge) {
    if (newurge < minurge) newurge = minurge;
    newurge = Math.round(newurge);
    bladurge = newurge;
    bladneed = newurge * 2; // Level where she continuously needs to go
    blademer = newurge * 3; // Level where it becomes an emergency
    bladlose = newurge * 3 + 150; // Level where she loses control
    bladcumlose = newurge * 4; // Level where she spurts as she cums
    bladsexlose = newurge * 5; // Level where she can't control it during sex
}

// Slightly randomizes the calculated tuminc
// so the bladder doesn't fill with a completely fixed amount each time
function randtuminc(tempinc) {
    if (tempinc === 2)
        return tempinc;
    let choicearray = [];
    for (let i = 0; i < 10; i++) {
        if (i === 0)
            choicearray.push(tempinc - 2);
        else if (i < 3)
            choicearray.push(tempinc - 1);
        else if (i < 7)
            choicearray.push(tempinc);
        else if (i < 9)
            choicearray.push(tempinc + 1);
        else
            choicearray.push(tempinc + 2);
    }
    return pickrandom(choicearray);
}

//
//  Reset All Pee Counters ( this means she peed )
//
function flushdrank() {

    //  Derate bladder capacity if she loses it...
    if (bladDec) {
        if (bladder >= bladlose) updateurge(bladurge * 9 / 10);
        else if (bladder >= blademer && bladDespDec) updateurge(bladurge * 9.5 / 10);
        //bladder decays based on breaking the seal can only happen once an hour
        else if (seal && drankbeer > 15 && beerdecCounter > 30) {
            updateurge(bladurge * 9.5 / 10);
            beerdecCounter = 0;
        }
    }

    bladder = 0;
    askholditcounter = 0;
    waitcounter = 0;
    gottagoflag = 0;
    drankwaters = 0;
    drankcocktails = 0;
    drankbeers = 0;
    dranksodas = 0;
    lastpeetime = thetime;
    rrlockedflag = 0;
    shespurted = 0;
    nowpeeing = 1;
    bribeaskthresh = 8;
}



// Showneed calculates how she's going to indicate
// her current level of need ( if at all ) based on her situation
function showneed(curtext) {
    //TODO turn quotes into JSON

    // Clear the gottagoflag.  It will be set by displaygottavoc().
    gottagoflag = 0;

    //  How this should work:
    //  Outer IFs determine LOCATION/SCENARIO.
    //  Inner IFs determine pee request parameters
    //  Upper IFs are emergencies

    // If she's within 2 turns of wetting and not too shy, she will vocalize
    // no matter what.

    if (bladder >= (bladlose - 25) && shyness < 90) {
        if (externalflirt) curtext = voccurse(curtext);
        curtext = displaygottavoc(curtext);
    } else if (changevenueflag) {
        // She's almost always going to ask to go if you're off somewhere
        if ((bladder >= blademer) ||
            (bladder >= bladneed && shyness < 70)) {
            if (waitcounter === 0) {  // did you just ask her to wait?
                curtext.push(girltalk + "Hey! Before we go...");
                waitcounter = 4;
                curtext = displaygottavoc(curtext);
            } else {
                curtext.push(girlname + " looks like she really has to pee, but she doesn't say anything.");
                if (askholditcounter)
                    curtext.push("After all, you did ask her to hold it.");
            }
        }
    } else if (waitcounter === 0 && !externalflirt) {
        // Then there are generic instances where she might ask
        // She'll try to hold it if you flirted with somebody at that location
        // Shyness < 80 is enough to ask if she's having a bladder emergency
        if (shyness < 80 && bladder > blademer) {
            waitcounter = 6;
            curtext = displaygottavoc(curtext);
            // Shyness < 60 is enough to ask if she's merely needing to pee bad
        } else if (shyness < 60 && bladder > bladneed) {
            waitcounter = 10;
            curtext = displaygottavoc(curtext);
            // Shyness < 40 and she's letting you know at 1st urge.
        } else if (shyness < 40 && bladder > bladurge) {
            waitcounter = 12;
            curtext = displaygottavoc(curtext);
            // Otherwise, she may or may not show symptoms of having to go
        } else if ((Math.random() * bladlose) < bladder) {
            curtext = displayneed(curtext);
        }
        // Otherwise, she may or may not show symptoms of having to go
    } else if ((Math.random() * bladlose) < bladder) {
        curtext = displayneed(curtext);
    }
    changevenueflag = 0;
    return curtext;
}


// DisplayGottaVoc function prints a quasi-random vocalization from "+girlname+"
// indication her sincere hope to find a bathroom soon.
function displaygottavoc(curtext, index) {
    let textchoice = [];
    if (askholditcounter > 0 && bladder > bladurge && randomchoice(3)) {
        textchoice.push(girltalk + "" + wanthold[randcounter]);
    }

    if (bladder >= bladneed && !brokeice) {
        textchoice.push(girlname + " looks embarassed.");
        textchoice.push(girltalk + "Jesus, I'm sorry.");
    }

    if (locstack[0] === "driveout") {
        if (bladder >= bladlose - 10) {
            textchoice.push(girltalk + "" + carlosequotes[randcounter]);
        } else if (bladder >= blademer) {
            textchoice.push(girltalk + "" + caremerquotes[randcounter]);
        } else if (bladder >= bladneed) {
            textchoice.push(girltalk + "" + carneedquotes[randcounter]);
        } else if (bladder >= bladurge) {
            textchoice.push(girltalk + "" + carurgequotes[randcounter]);
        } else {
        }
    } else {
        if (bladder >= bladlose - 10) {
            textchoice.push(girltalk + "" + losequotes[randcounter]);
        } else if (bladder >= blademer) {
            textchoice.push(girltalk + "" + emerquotes[randcounter]);
        } else if (bladder >= bladneed) {
            textchoice.push(girltalk + "" + needquotes[randcounter]);
        } else if (bladder >= bladurge) {
            textchoice.push(girltalk + "" + urgequotes[randcounter]);
        }
    }
    if (bladder >= bladneed) gottagoflag = 1;
    if (bladder >= bladurge) brokeice = 1;
    incrandom();
    if(index){
        if (textchoice.length === 1){
            curtext.splice(index, 0, textchoice[0]);
        } else {
            textchoice.forEach(text => {curtext.splice(index, 0, text); index++});
        }
    } else {
        textchoice.forEach(text => curtext.push(text));
    }
    return curtext;
}


// Publish a note about her holding it for you.
// Depends on whether you asked her to hold it,
// and emergency bladder state
function noteholding(curtext) {
    if (bladder > blademer && askholditcounter) curtext.push(pickrandom(needs["sheholds"]));
    return curtext;
}

//
//  Publish a note about her looking like she has to go.
//
function interpbladder(curtext) {
    if (bladder > bladlose) curtext.push(pickrandom(needs["interplose"]));
    else if (bladder > blademer) curtext.push(pickrandom(needs["interpemer"]));
    else if (bladder > bladneed) curtext.push(pickrandom(needs["interplose"]));
    return curtext;
}

//TODO lose control when bursting on the way
function indepee(curtext=[], called=false) {
    gottagoflag = 0;
    //TODO the locstack aren't compeltely correct
    if (haveherpurse) {
        haveherpurse = 0;
    } else if (locstack[0] === "thehome" ||
        locstack[0] === "thebedroom" ||
        locstack[0] === "pickup" ||
        locstack[0] === "fuckher6") {
        curtext.push(peelines["thehome"][0]);
        // s(girlname + " heads for the bathroom, leaving the door slightly ajar.");
    } else if (locstack[0] === "themakeout" ||
        locstack[0] === "thehottub" ||
        locstack[0] === "driveout" ||
        locstack[0] === "thehome" ||
        locstack[0] === "thebedroom" ||
        locstack[0] === "thewalk" || locstack[0] === "theyard" || locstack[0] === "thebeach") {
        curtext.push(peelines["noneavailable"][0]);
    } else
        curtext = printList(curtext, peelines["remaining"]);
    if ((locstack[0] === "thebar" && randomchoice(rrlockedthresh) ) || ((locstack[0] === "theclub" || locstack[0] === "dodance") && randomchoice(rrlinethresh)) ){
        curtext = bathroomlocked(curtext);
    } else if (locstack[0] === "themakeout") {
        curtext.push(peelines["noneavailable"][1]);
        curtext = displayneed(curtext);
    } else if (locstack[0] === "driveout") {
        curtext.push(peelines["noneavailable"][2]);
        curtext = displayneed(curtext);
    } else if (locstack[0] === "thewalk" || locstack[0] === "theyard" || locstack[0] === "thebeach" || locstack[0] === "thehottub") {
        curtext.push(peelines["noneavailable"][3]);
        curtext = displayneed(curtext);
        curtext = interpbladder(curtext);
    } else if (locstack[0] === "thehome" ||
        locstack[0] === "thebedroom" ||
        locstack[0] === "fuckher6") {
        curtext.push(peelines["thehome"][1]);
        flushdrank();
    } else if (locstack[0] === "pickup") {
        curtext.push(peelines["thehome"][2]);
        flushdrank();
    } else {
        if (bladder > bladlose - 25)
            curtext.push(pickrandom(appearance[heroutfit]["peeprivate"]));
        else
            curtext.push(pickrandom(appearance[heroutfit]["peeprivate2"]));
        //TODO check validity of these attraction
        attraction -= 2;
        flushdrank();
    }
    if (bladder >= bladlose - 25 && locstack[0] !== "thehottub") curtext = begtoilet(curtext);
    else {
        curtext = c([locstack[0], "Continue..."], curtext);
    }
    //If the function has been called by another function, send the result back otherwise print it yourself
    if (called)
        return curtext;
    else
        sayText(curtext);
}



//TODO your and her bathroomlocked can probably be intertwened, only difference is start and the locked variable
function bathroomlocked(curtext) {
    const locked = peelines["locked"]
    //Description of her reaction, based on how badly she has to go
    if (bladder > blademer)
        curtext.push(locked["urgency"][0]);
    else if (bladder > bladneed)
        curtext.push(locked["urgency"][1]);
    else
        curtext.push(locked["urgency"][2]);
    if(locstack[0] === "thebar") {
        //She tells you the bathroom was locked, depending on how often you tried already
        if (rrlockedflag > 3) {
            curtext.push(locked["cbar"][0]);
        } else if (rrlockedflag > 2) {
            curtext.push(locked["cbar"][1]);
        } else if (rrlockedflag) {
            curtext.push(locked["cbar"][2]);
        } else {
            curtext.push(locked["cbar"][3]);
        }
    } else {
        //She tells you the line was too long, depending on how often she tried already
        if (rrlockedflag > 3) {
            curtext.push(locked["cclub"][0]);
        } else if (rrlockedflag > 2) {
            curtext.push(locked["cclub"][1]);
        } else if (rrlockedflag) {
            curtext.push(locked["cclub"][2]);
        } else {
            curtext.push(locked["cclub"][3]);
        }
    }

    rrlockedflag++; //Increase how often she tried
    curtext = displayneed(curtext);
    return curtext;

}

//  Displayneed function prints a relatively random
//  indication of her level of pee urgency.
function displayneed(curtext) {
    showedneed = 1;
    if (locstack[0] === "themakeout" || locstack[0] === "driveout" ||
        locstack[0] === "drivearound" || locstack[0] === "domovie" ||
        locstack[0] === "thebed" || fuckingnow > 0){
        if (bladder >= bladlose){
            curtext.push(needs["sitneedlose"][randcounter]);
        } else if (bladder > blademer) {
            curtext.push(needs["sitneedemer"][randcounter]);
        } else if (bladder > bladneed) {
            curtext.push(needs["sitneed"][randcounter]);
        } else if (bladder > bladurge) {
            curtext.push(needs["sitneedurge"][randcounter]);
        }
    } else if (locstack[0] === "thehottub"){
        if (bladder >= bladlose){
            curtext.push(needs["tubneedlose"][randcounter]);
        } else if (bladder > blademer) {
            curtext.push(needs["tubneedemer"][randcounter]);
        } else if (bladder > bladneed) {
            curtext.push(needs["tubneed"][randcounter]);
        } else if (bladder > bladurge) {
            curtext.push(needs["tubneedurge"][randcounter]);
        }
    } else {
        if (bladder >= bladlose){
            curtext.push(needs["needlose"][randcounter]);
        } else if (bladder > blademer) {
            curtext.push(needs["needemer"][randcounter]);
        } else if (bladder > bladneed) {
            curtext.push(needs["need"][randcounter]);
        } else if (bladder > bladurge) {
            curtext.push(needs["needurge"][randcounter]);
        }
    }
    incrandom();
    return curtext;
}

//TODO make this more fancy
function youbegtoilet(curtext) {
    curtext.push(ypeelines["beg"][0]);
    if (shotglass > 0) curtext = callChoice(ypeelines["beg"][1][0], curtext);
    if (vase > 0) curtext = callChoice(ypeelines["beg"][1][1], curtext);
    curtext = callChoice(ypeelines["beg"][1][2], curtext);
    return curtext;
}

//
//  She says how long she's been waiting to pee.
//
function displaywaited(curtext) {
    let timewaited = " ";
    let halftimewaited;
    halftimewaited = Math.floor((thetime - lastpeetime) / 30);
    if (halftimewaited > 1) {
        timewaited += Math.floor(halftimewaited / 2);
        if (halftimewaited % 2 === 1) {
            timewaited += " and a half hours";
        } else if (halftimewaited === 2) {
            timewaited += " whole hour";
        } else {
            timewaited += " hours"
        }
    } else if (halftimewaited === 1) {
        timewaited = " half an hour";
    }

    if (halftimewaited > 1)
        curtext.push(girltalk + pickrandom(needs["holdingtime"]) + timewaited + "!");
    return curtext;
}

//
//  She says how much she's drank since she last peed.
//
function displaydrank(curtext) {

    let sentence = " ";
    comma = 0;

    if (drankwaters > 0) {
        comma = 1;
        sentence += drankwaters + " water";
        if (drankwaters > 1) sentence += "s";
    }

    if (drankbeers > 0) {
        if (comma > 0) {
            if (dranksodas + drankcocktails === 0)
                sentence += " and ";
            else
                sentence += ", ";
        }
        comma = 1;

        sentence += drankbeers + " beer";
        if (drankbeers > 1) sentence += "s";
    }

    if (dranksodas > 0) {
        if (comma > 0) {
            if (drankcocktails === 0)
                sentence += " and ";
            else
                sentence += ", ";
        }
        comma = 1;
        sentence += dranksodas + " soda";
        if (dranksodas > 1) sentence += "s";
    }

    if (drankcocktails > 0) {
        if (comma > 0) sentence += " and ";
        comma = 1;
        sentence += drankcocktails + " cocktail";
        if (drankcocktails > 1) sentence += "s";
    }

    if ((drankwaters + drankbeers + drankcocktails + dranksodas) > 0) {
        curtext.push(girltalk + "I drank " + sentence + " " + pickrandom(needs["drankburst"]));
    }

    return curtext;
}

//
//  You try to convince her to hold it.
//
function convinceher(curtext) {
    let selection = []; //Used to keep track of which options need to be printed
    if (haveItem("roses")) {
        selection.push(0);
    }
    if (haveItem("earrings")) {
        selection.push(1);
    }
    if (owedfavor > 0) {
        selection.push(2);
    }
    selection.push(3);
    selection.push(4);
    curtext = printChoicesList(curtext, selection, needs["convinceher"]);
    return curtext;
}

function bribeask() {
    let curtext = []
    curtext = printList(curtext, needs["bribeask"]);
    if (randomchoice(bribeaskthresh) && (
        (bladder >= bladlose && attraction > holditlosethresh) ||
        (bladder >= blademer && attraction > holditemerthresh) ||
        (bladder >= bladneed && attraction > holditneedthresh))) {
        curtext.push(girltalk + pickrandom(general["okayforyou"]));
        askholditcounter++;
        curtext = displayholdquip(curtext);
        curtext = printChoicesList(curtext, [0],  needs["choices"]);
    } else {
        //TODO figure out how to deal with multiple variable quotes
        curtext.push(girltalk + "You've already asked me to hold it " + askholditcounter + " times.");
        curtext = displaygottavoc(curtext);
        curtext = printChoicesList(curtext, [1],  needs["choices"]);
    }
    sayText(curtext);
    bribeaskthresh -= askholditcounter * 0.1;
}

//TODO test
function bribefavor() {
    let curtext = needs["bribefavor"]
    // s("<b>YOU:</b> Pretty please!  Remember you promised to do me a favor!");
    // s(girltalk + "Well... Okay.  But just a little bit.  I did promise you a favor.");
    curtext = displayholdquip(curtext);
    curtext = interpbladder(curtext);
    owedfavor -= 1;
    askholditcounter++;
    curtext = printChoicesList(curtext, [0],  needs["choices"]);
    sayText(curtext);
}

//
//  Ask her to hold it in.
//
//TODO fix it that if you are at her place after you asked her and she doesn't have to go you always fail
function holdit() {
    let curtext = [];
    curtext.push(pickrandom(needs["askhold"]));
    gottagoflag = 0;
    waitcounter = 6;
    if ((bladder >= bladlose && attraction > holditlosethresh) ||
        (bladder >= blademer && attraction > holditemerthresh) ||
        (bladder >= bladneed && attraction > holditneedthresh)) {
        if (bladder >= blademer) {
            curtext.push(girltalk + pickrandom(needs["surpriseexcl"])); //TODO this shouldn't be allowed
            if (randomchoice(5))
                curtext = displaydrank(curtext);
            else
                curtext = displaywaited(curtext);
            curtext.push(needs["holdit"]["dialogue"][0]); //She's not sure, you have to convince her
            if (locstack[0] !== "gostore") curtext = displayneed(curtext);
            else curtext = displaygottavoc(curtext);
            curtext = convinceher(curtext);
        } else {
            curtext = displayholdquip(curtext);
            askholditcounter++;
            if (bladder >= bladlose) {
                if (locstack[0] === "gostore") {
                    //TODO maybe put in one thing to print all lines
                    curtext.push(needs["holdit"]["dialogue"][1]);
                    curtext.push(needs["holdit"]["dialogue"][2]);
                    curtext.push(needs["holdit"]["dialogue"][3]); //She's wetting herself over the phone
                    bladder = 0;
                    waitcounter = 0;
                    askholditcounter = 0;
                    attraction = 0;
                } else {
                    curtext = displayneed(curtext);
                }
            }
            curtext = callChoice(needs["choices"][0], curtext);
        }
    } else {
        if (locstack[0] === "gostore") {
            curtext.push(needs["holdit"]["dialogue"][4]);
            curtext.push(needs["holdit"]["dialogue"][5]);
            //She's not holding it while on the phone
            attraction -= 5;
            bladder = 0;
            curtext = callChoice(needs["choices"][0], curtext);
        } else {
            curtext.push(needs["holdit"]["dialogue"][6]);
            // she's not holding it for you
            attraction -= 5;
            curtext = indepee(curtext, true);
        }
    }
    sayText(curtext);
}

function allowpee() {
    gottagoflag = 0;
    askholditcounter = 0;
    let curtext = [];
    curtext.push(needs["allowpee"][0]);
    curtext.push(needs["allowpee"][1]);
    if (locstack[0] === "fuckher6" || locstack[0] === "thehome" || locstack[0] === "thebedroom" || locstack[0] === "darkbar"
        || locstack[0] === "pickup" || locstack[0] === "darkclub" || locstack[0] === "darkbar") {
        curtext = callChoice(needs["choices"][1], curtext);
    } else {
        //TODO test
        // s(girltalk + "Can you hold my purse for me?");
        curtext.push(needs["allowpee"][2]);
        attraction += 7;
        curtext = printChoicesList(curtext, [1,5], needs["choices"]);
        // c("holdpurse", "Sure, I'll take care of it!");
        // c("indepee", "I think you'd better take it with you.");
    }
    sayText(curtext);
}

function peephone() {
    let curtext = [];
    gottagoflag = 0;
    if (attraction > 30) {
        if (bladder > blademer && shyness < 75) {
            curtext = printLList(curtext,peelines["peephone"], 0);
            attraction += 10;
            flushdrank();
        } else {
            curtext = printLList(curtext,peelines["peephone"], 1);
        }
    } else {
        curtext = printLList(curtext,peelines["peephone"], 2);
        bladder = 0;
    }
    curtext = c([locstack[0], "Continue..."], curtext);
    sayText(curtext);
}


//TODO figureout duplicate continue
function peeshot() {
    //TODO test
    let curtext = [];
    if (attraction > 30) {
        if ((bladder > blademer && shyness < 60) ||
            (bladder >= bladlose - 25)) {
            gottagoflag = 0;
            if (peedshot < 1) {
                curtext.push(needs["peeshot"][0]);
                curtext.push(needs["peeshot"][1]);
                // s(girltalk + "You're a naughty boy, aren't you?");
                // s(girltalk + "But I'm going to wet my panties if I don't go.....");
            }
            peedshot = 1;
            curtext = displayneed(curtext);
            curtext.push(needs["peeshot"][2]);
            // s(girltalk + "God! I can't wait any longer!");
            // c("peeshot2", "Continue...");
            curtext = printChoicesList(curtext, [10], needs["choices"]);
        } else {
            gottagoflag = 0;
            curtext.push(needs["peeshot"][3]);
            // s(girltalk + "I think maybe not.  At least not yet.");
            curtext = printChoicesList(curtext, [0], needs["choices"]);
            // c(locstack[0], "Continue...");
        }
    } else if (locstack[0] !== "themakeout" && locstack[0] !== "driveout") {
        curtext.push(needs["peeshot"][4]);
        curtext.push(needs["peeshot"][5]);
        curtext.push(needs["peeshot"][6]);
        // s(girltalk + "Somehow, I don't think that's happening.");
        // s("She runs to the bathroom with your shot glass in hand.");
        // s("You are left to ponder your situation.");
        flushdrank();
        attraction -= 3;
        shotglass -= 1;
        curtext = printChoicesList(curtext, [0], needs["choices"]);
        // c(locstack[0], "Continue...");

    } else {
        curtext.push(needs["peeshot"][4]);
        // s(girltalk + "Somehow I don't see that happening.");
        curtext = printChoicesList(curtext, [0], needs["choices"]);
        // c(locstack[0], "Continue...");
    }
    sayText(curtext);
}

//TODO test
function peeshot2() {
    let curtext = [];
    if (pantycolor !== "none")
        curtext.push(appearance["peeshotquote"]);
    else
        curtext.push(appearance["peeshotquotebare"]);
    // if (pantycolor !== "none") s(peeshotquote);
    // else s(peeshotquotebare);
    curtext = itscomingout(curtext);
    curtext = printChoicesList(curtext, [11], needs["choices"]);
    // c("peeshot3", "Continue...");
    sayText(curtext);
}

//TODO test
function peeshot3() {
    let curtext = [];
    curtext.push(needs["peeshot"][7]);
    curtext.push(needs["peeshot"][8]);
    // s("The pee hisses out and the glass is filled in no time.  " + girlname + " bends over and jams her hand between her legs, gasping in the effort to stop the flow.");
    // s(girltalk + "Damn.  That's not much better.");
    attraction += 3;
    bladder -= 100;
    waitcounter = 4;
    sawherpee = 1;
    curtext = printChoicesList(curtext, [0], needs["choices"]);
    // c(locstack[0], "Continue...");
    sayText(curtext);
}


//TODO search privacy in club/bar?
//TODO don't take it to the bathroom with her in the car
//TODO test
function peevase() {
    let curtext = [];
    if (attraction > 30) {
        if (bladder > blademer) {
            gottagoflag = 0;
            if (peedvase < 0) {
                curtext.push(needs["peevase"][0]);
                curtext.push(needs["peevase"][1]);
                // s(girltalk + "That's pretty kinky!");
                // s(girltalk + "But I'm about to wet my panties!");
            }
            curtext = displayneed(curtext);
            peedvase = 1;
            curtext.push(needs["peevase"][2]);
            curtext.push(needs["peevase"][3]);
            curtext.push(needs["peevase"][4]);
            // s(girltalk + "I just can't hold it anymore.  Give it here.");
            // s("She grabs the vase, wrenching it from your hands and nearly dropping it.");
            // c("peevase2", "Continue...");
            curtext = printChoicesList(curtext, [12], needs["choices"]);
        } else {
            curtext = displaygottavoc(curtext);
            gottagoflag = 0;
            curtext.push(needs["peevase"][5]);
            // s(girltalk + "But a vase?  I can't! At least not yet.");
            curtext = displayholdquip(curtext);
            curtext = printChoicesList(curtext, [0], needs["choices"]);
            // c(locstack[0], "Continue...");
        }
    } else {
        curtext.push(needs["peevase"][2]);
        curtext.push(needs["peevase"][3]);
        curtext.push(needs["peevase"][4]);
        // s(girltalk + "Somehow, I don't think that's happening.");
        // s("She runs to the bathroom with your vase in hand.");
        // s("You are left to ponder your situation.");
        flushdrank();
        attraction -= 3;
        vase -= 1;
        curtext = printChoicesList(curtext, [0], needs["choices"]);
        // c(locstack[0], "Continue...");
    }
    sayText(curtext);
}

//TODO test
function peevase2() {
    let curtext = [];
    if (pantycolor !== "none")
        curtext.push(appearance["peeskirtquote"]);
    else
        curtext.push(appearance["peeskirtquotebare"]);
    // if (pantycolor !== "none") s(peeskirtquote);
    // else s(peeskirtquotebare);
    curtext = itscomingout(curtext);
    curtext = printChoicesList(curtext, [13], needs["choices"]);
    // c("peevase3", "Continue...");
    sayText(curtext);
}

//TODO test
function peevase3() {
    let curtext = [];
    curtext.push(needs["peevase"][5]);
    curtext.push(needs["peevase"][6]);
    curtext.push(girltalk + pickrandom(needs["embarquote"]));
    // s("The pee hisses out for nearly a minute, the vase is filled almost to the top.");
    // s(girlname + " puts herself back together, looking embarrassed.");
    // s(girltalk + pickrandom(needs["embarquote"]));
    attraction += 3;
    flushdrank();
    sawherpee = 1;
    curtext = printChoicesList(curtext, [0], needs["choices"]);
    // c(locstack[0], "Continue...");
    sayText(curtext);
}

//TODO she can't run away with the towels while in the car
//TODO check for having peed towels/vase or shot
//TODO test
function peetowels() {
    let curtext = [];
    if (attraction > 30) {
        if (bladder > blademer) {
            gottagoflag = 0;
            if (peedtowels < 0) {
                curtext.push(needs["peetowels"][0]);
                curtext.push(needs["peetowels"][1]);
                // s(girltalk + "That's kind of gross!");
                // s(girltalk + "But I'm about to wet my panties!");
            }
            displayneed();
            peedtowels = 1;
            wetherpanties = 1;
            curtext.push(needs["peetowels"][2]);
            curtext.push(needs["peetowels"][3]);
            // s(girltalk + "I just can't hold it anymore.  Give it here.");
            // s("She takes the roll of paper towels in both hands and freezes for a moment, thinking.");
            curtext = printChoicesList(curtext, [14], needs["choices"]);
            // c("peetowels2", "Continue...");
        } else {
            //TODO unrreachable because you only get here when your bladder is beyond emer?
            curtext = displaygottavoc(curtext);
            gottagoflag = 0;
            curtext.push(needs["peetowels"][4]);
            // s(girltalk + "But in just a roll of towels?  No way! At least not yet.");
            curtext = displayholdquip(curtext);
            curtext = printChoicesList(curtext, [0], needs["choices"]);
            // c(locstack[0], "Continue...");
        }
    } else {
        curtext.push(needs["peetowels"][5]);
        curtext.push(needs["peetowels"][6]);
        curtext.push(needs["peetowels"][7]);
        // s(girltalk + "Somehow, I don't think that's happening.");
        // s("She runs off with your roll of paper towels in hand.");
        // s("You are left to ponder your situation.");
        flushdrank();
        attraction -= 3;
        if (attraction < 0) attraction = 0;
        ptowels -= 1;
        curtext = printChoicesList(curtext, [0], needs["choices"]);
        // c(locstack[0], "Continue...");
    }
    sayText(curtext);
}

//TODO test
function peetowels2() {
    let curtext = [];
    if (pantycolor !== "none")
        curtext.push(appearance["peetowelquote"]);
    else
        curtext.push(appearance["peetowelquotebare"]);
    // if (pantycolor !== "none") s(girlname + peetowelquote);
    // else s(girlname + peetowelquotebare);
    curtext = itscomingout(curtext);
    curtext = printChoicesList(curtext, [15], needs["choices"]);
    // c("peetowels3", "Continue...");
    sayText(curtext);
}

//TODO test
function peetowels3() {
    let curtext = [];
    curtext.push(needs["peetowels"][8]);
    curtext.push(needs["peetowels"][9]);
    curtext.push(girltalk + pickrandom(needs["embarquote"]));
    // s("The pee hisses out and is mostly absorbed by the paper towels, just a small trickle running down her left leg.");
    // s("She carefully sets to sopping wet roll of towels in a corner.");
    // s(girltalk + embarquote[randcounter]);
    attraction += 3;
    flushdrank();
    ptowels -= 1;
    sawherpee = 1;
    curtext = printChoicesList(curtext, [0], needs["choices"]);
    // c(locstack[0], "Continue...");
    sayText(curtext);
}

//TODO test
function peeintub() {
    let curtext = [];
    if (bladder > blademer) {
        curtext = displaygottavoc(curtext);
        curtext.push(needs["peeintub"][0]);
        // s(girltalk + "Sure you're okay with it?");
        curtext = displayneed(curtext);
        curtext = printChoicesList(curtext, [16], needs["choices"]);
        // c("peeintub2", "Continue...");
    } else {
        curtext.push(needs["peeintub"][1]);
        // s(girltalk + "I'll just wait, thank you very much.");
        curtext = printChoicesList(curtext, [0], needs["choices"]);
        // c(locstack[0], "Continue...");
    }
    sayText(curtext);
}

//TODO test
function peeintub2() {
    let curtext = printListSelection([], needs["peeintub"], range(2, 5));
    // s(girlgasp + "Ungh!  I can't hold it.");
    // s("You nonchalantly move closer and slip your hand under her butt.  The strong stream of pee flows out between your fingers for nearly a minute, and you can detect the barest scent of urine rising from the hot water.  It feels strangely cool in the warm water of the tub.");
    flushdrank();
    // s("The stream slows and finishes, and " + girlname + " lets out a sigh of relief.");
    // s(girltalk + "That feels <i>so</i> much better.");
    curtext = printChoicesList(curtext, [0], needs["choices"]);
    // c(locstack[0], "Continue...");
    sayText(curtext);
}

//TODO do something if you peed outside already(mention to follow your lead)
//TODO she pees outside if she's not bursting
//TODO fix the duplicate code
function peeoutside() {
    if (attraction > 30) {
        if (bladder > blademer) {
            if (peedoutside)
                s(girltalk + "I'm so embarrassed to have to pee outside again.");
            else
                s(girltalk + "That's pretty daring.  I've never gone outside before.");
            s(girltalk + "But I'm about to wet my panties if I don't go somewhere!");
            s(girltalk + "I can't hold it!  What am I gonna do???");
            displayneed();
            if (locstack[0] === "themakeout") c("peeoutside2", "Continue...");
            else c("peeoutside2b", "Continue...");

        } else {
            displaygottavoc();
            s(girltalk + "But I can't just go outside!");
            s(girltalk + "At least not yet.");
            displayholdquip();
            gottagoflag = 0;
            c(locstack[0], "Continue...");
        }
    } else {
        //TODO this code is almost impossible to reach? since you need at least 40 attraction to get outside
        s(girltalk + "Pee outside?  No way am I exposing my privates to the whole world!");
        attraction -= 3;
        if (attraction < 0) attraction = 0;
        c(locstack[0], "Continue...");
    }

}

// In the car
function peeoutside2() {
    if (pantycolor !== "none") s(peeoutsidequote);
    else s(peeoutsidequotebare);
    s(girltalk + "Are you sure it's safe?");
    c("peeoutside3", "Continue...");
}

// Not in the car
function peeoutside2b() {
    if (pantycolor !== "none") s(peeoutsidebquote);
    else s(peeoutsidebquotebare);
    s(girltalk + "Are you sure it's safe?");
    if (locstack[0] === "thebeach") c("peeoutside3c", "Continue...");
    else c("peeoutside3b", "Continue...");
}

// She was in the car
function peeoutside3() {
    itscomingout();
    s("You try to be nonchalant as you stare, and she doesn't seem to notice.  The pee hisses out from between her smooth thighs for nearly a minute, and runs in a stream under the car.  You can smell her scent as steam rises from the hot river.");
    //TODO attraction goes down?
    attraction -= 3;
    flushdrank();
    peedoutside = 1;
    sawherpee = 1;
    c(locstack[0], "Continue...");
}

//  Again, she's not in the car
function peeoutside3b() {
    s(girltalk + "Oh!  Don't look!  It's coming!");
    s("You nonchalantly move closer and watch as the pee hisses out from between her delicate pussy lips for nearly a minute, and runs in a stream along the ground.  You can smell her scent as steam rises from the hot river and she sighs in relief.");
    s(girltalk + "That's so much better.");
    s("She seems aroused as she gets back up.");
    //TODO attraction goes down?
    attraction -= 3;
    flushdrank();
    peedoutside = 1;
    sawherpee = 1;
    c(locstack[0], "Continue...");
}

//  Pee on the beach
function peeoutside3c() {
    itscomingout();
    s("You nonchalantly move closer and watch as the pee hisses out from between her delicate pussy lips for nearly a minute, soaking quickly into the sand and turning it dark.  You can smell her scent and hear the hiss of the urine hitting the sand and she sighs orgasimcally.");
    s(girltalk + "That's <b>so</b> much better.  I was dying!");
    s("She seems aroused as she gets back up.");
    //TODO attraction goes down?
    attraction -= 3;
    flushdrank();
    peedoutside = 1;
    sawherpee = 1;
    c(locstack[0], "Continue...");
}




//  DisplayHoldQuip function prints a quasi-random quip from "+girlname+"
//  saying she's going to try to hold it for you.
function displayholdquip(curtext) {
    //TODO is the noneed ever used?
    //TODO test
    let need = "noneed" //How full her bladder is influences what she says
    if (bladder >= bladlose)
        need = "lose";
        // s(girltalk + quiplose[randcounter]);
    else if (bladder >= blademer)
        need = "emer"
        // s(girltalk + quipemer[randcounter]);
    else if (bladder >= bladneed)
        need = "need"
        // s(girltalk + quipneed[randcounter]);
    else if (bladder >= bladurge)
        need = "urge";
        // s(girltalk + quipurge[randcounter]);
    curtext.push(girltalk + pickrandom(needs["holdquip"][need]));
    return curtext;
}

// If she begs you, you end up not leaving the venue.
function begtoilet(curtext) {
    //TODO mention having peed outside before? / autonomously choose that
    //TODO test
    let selection = [0];
    // s(girlname + " looks intently into your eyes:");
    if (peedvase)
        selection.push(1);
        // s("I've absolutely got to go.  I <i>need</i> your vase again. <b>NOW!</b>");
    else if (peedshot)
        selection.push(2);
        // s("I'm gonna pee myself!  I <i>need</i> that shot glass again. <b>NOW!</b>");
    else if (peedtowels)
        selection.push(3);
        // s("I just <b>can't</b> hold it - you don't have any more paper towels, do you?");
    else
        selection.push(4);
        // s("I'm <i>begging</i> you - find me somewhere to pee.  <b>NOW!</b>");
    printListSelection(curtext, needs["begtoilet"]["dialogue"], selection);
    selection = [];
    if (shotglass > 0)
        selection.push(0);
        // c("peeshot", "Offer her the shot glass.");
    if (ptowels > 0)
        selection.push(1);
        // c("peetowels", "Offer her the roll of paper towels.");
    if (vase > 0)
        selection.push(2);
        // c("peevase", "Offer her the vase.");
    if (locstack[0] === "themakeout")
        selection.push(3);
        // c("peeoutside", "Suggest she pee outside.");
    selection.push(4);
    return printChoicesList(curtext, selection, needs["begtoilet"]["choices"]);
    // c(locstack[0], "Stand by helplessly.");
}


//TODO add extra options like pee outside
//TODO make responses more realisitc
//TODO don't take her purse in certian situations
function askpee() {
    s("<b>YOU:</b> Do you need to pee?");

    if (shyness > 60) s(girlname + " blushes.");
    else s(girltalk + "...");

    if (bladder > bladneed && bladder < blademer)
        s("She seems to be considering the matter...");

    if (((shyness < 50 && bladder > bladneed) ||
        bladder > blademer) &&
        (locstack[0] !== "drinkinggame" && !externalflirt)) {
        displaygottavoc();
        interpbladder();
        showneed();
        c("pstory", "Ask her if she's ever wet herself.");
        preventpee();
    } else {
        s(girltalk + denyquotes[randcounter]);
        displayneed();
        interpbladder();
        c(locstack[0], "Continue...");
    }
}

function askcanhold() {
    s("<b>YOU:</b> How are you doing?  Can you still hold it?");
    if (bladder >= bladlose) s(girltalk + holdlosequotes[randcounter]);
    else if (bladder >= blademer) s(girltalk + holdemerquotes[randcounter]);
    else if (bladder >= bladneed) s(girltalk + holdneedquotes[randcounter]);
    else if (bladder >= bladurge) s(girltalk + holdurgequotes[randcounter]);
    else s(girltalk + holdokayquotes[randcounter]);
    incrandom();
    interpbladder();
    c(locstack[0], "Continue...");
}

function pstory() {
    s("<b>You ask her:</b> have you ever waited too long?");
    displayneed();
    s(girltalk + peestory[pstorycounter]);
    oldpstorycounter = pstorycounter;
    pstorycounter++;
    if (pstorycounter > maxpstory) pstorycounter = 0;
    c("pstory2", "Ask her what happened.");
    c(locstack[0], "Continue...");
}

function pstory2() {
    s("<b>You ask her:</b> so... did you make it?");
    s(girlname + " blushes and looks down at her feet.");
    s(girltalk + peestory2[oldpstorycounter]);
    displayneed();
    c(locstack[0], "Continue...");
}

//TODO make her less demanding
function preventpee(curtext) {

    // If she's not in obviously dire straits, your
    // admonitions, whatever they are, will effectly
    // have answered her request to pee.  So the flag
    // will be cleared.

    let choices = [1, 9] // This keeps track of the options you can choose from so they can be printed at the end

    if (bladder < bladlose - 50)
        gottagoflag = 0;

    if (locstack[0] === "dodance")
        choices.push(2); //Pee together
    if (locstack[0] === "darkbar" || locstack[0] === "darkmovie" || locstack[0] === "darkclub")
        choices.push(3); //Watch
    if (locstack[0] === "darkmovie")
        choices.push(4); //No restroom
    if (locstack[0] === "darkbar")
        choices.push(5); //pdrinkinggame
    if (locstack[0] === "darkclub")
        choices.push(6); //pphotegame
    if (locstack[0] === "driveout") {
        choices.push(7); //nextstop
    } else {
        choices.push(8); //allowpee
    }

    return printChoicesList(curtext, choices, needs["preventpee"]);
}


//TODO chance with triggering each other into wetting when desperate
//TODO it's impossible to spurt more than once while it shouldn't be
//Here's actually where we decide if she wet or just spurted
function wetherself() {
    s(wetquote[randcounter]);
    incrandom();
    if (randomchoice(spurtthresh) && locstack[0] !== "thehottub" && !shespurted) {
        spurtedherself();
    } else {
        spurtthresh = 5;
        if (locstack[0] === "driveout")
            c("wetherself2c", "Continue ...");
        else if (locstack[0] === "themakeout")
            c("wetherself2m", "Continue ...");
        else if (locstack[0] === "thehottub")
            c("wetherself2t", "Continue ...");
        else
            c("wetherself2", "Continue ...");
    }
}

function wetherself2() {

    s("You hear the loud hissing as her bladder uncontrollably empties itself.");
    flushdrank();
    wetlegs = 1;
    wetherpanties = 1;
    s(girltalk + embarquote[randcounter]);
    incrandom();
    c("wetherself3", "Continue ...");

}

// She's in the makeout spot
function wetherself2m() {
    s(girlname + " suddenly and frantically looks around.  She fumbles with her seat belt, then the wrenches open the door and jumps out of the car.");
    wetherself2();
}

// She's in the hottub
function wetherself2t() {
    s(girlname + " suddenly stiffens and whispers: Oh no!");
    flushdrank();
    s("She sighs and slumps back in the tub, lost in her own little world for a minute or so.");
    s("There's complete silence aside from her heavy breathing and some crickets in the distance.");
    c("wetherself3t", "Continue ...");
}

// She's in the car
function wetherself2c() {
    s(girlname + " suddenly and frantically looks around, pulling open the glove box and feeling under her chair.");
    s(girltalk + " Oh No!  Your seat!");
    s("She arches her back, lifting her ass off the chair and straining against her seatbelt.");
    s("You hear the loud hissing as her bladder uncontrollably empties itself.");
    flushdrank();
    wetlegs = 1;
    wetherpanties = 1;
    wetthecar = 1;
    c("wetherself3c", "Continue ...");
}

function wetherself3c() {
    s(girltalk + "I'm <u>so</u> sorry about your car...");
    s("She settles unhappily into the squishy wet seat.");
    shyness += 20;
    if (shyness > 100) shyness = 100;
    attraction -= 20;
    c(locstack[0], "Continue ...");
}

function wetherself3() {
    if (pantycolor !== "none" && shyness < 70) {
        s(wetherselfquote);
        if (attraction > 40) {
            s(girlname + " hands you the wet panties, soaked with her fragrant urine.");
            s(girltalk + "Is there someplace you can put these?");
            wetpanties += 1;
        }
        pantycolor = "none";
    } else if (pantycolor === "none")
        s(girltalk + "Good thing I wasn't wearing panties, I guess.");
    s(dryquote[randcounter]);
    incrandom();
    if (ptowels > 0)
        c("giveptowels", "Offer her paper towels");
    if (panties > 0)
        c("givedrypanties", "Offer her a clean pair of panties");
    shyness += 15;
    if (shyness > 100) shyness = 100;
    //TODO maybe not during hold contest
    c("scoldher", "Scold her for wetting herself");
    c(locstack[0], "Continue ...");
}

// In the tub
function wetherself3t() {
    s(girltalk + "I'm <u>so</u> sorry ... I just couldn't hold it.");
    s("The faint scent of her urine rises from the water.");
    s(girltalk + "I peed in the tub.");
    shyness += 20;
    if (shyness > 100) shyness = 100;
    attraction -= 20;
    c(locstack[0], "Continue ...");
}

function spurtedherself() {
    bladder -= 50;
    spurtthresh -= 0.1 * spurtthresh;
    shespurted = 1;
    s(spurtquote[randcounter]);
    incrandom();
    displayneed();
    c("askspurted", "Ask her if she peed herself.");
    c(locstack[0], "Continue ...");
}

function askspurted() {
    s("<b>YOU:</b> Did you just pee yourself?");
    s(spurtquote[randcounter]);
    incrandom();
    s(girltalk + spurtdenyquote[randcounter]);
    incrandom();
    displayneed();
    if (locstack[0] !== "thehottub")
        c("checkspurted", "Check if she's wet.");
    c(locstack[0], "Continue ...");
}

function checkspurted() {
    s("<b>YOU:</b> I'm not sure I believe you.");

    if (attraction < 75) {
        s("You run your hand up her leg, but she pushes you away:");
        s(girltalk + "Hey! Keep your hands to yourself!");
        displayneed();
        attraction -= 10;
        shyness += 10;
    } else {
        if (pantycolor === "none") {
            s("You run your hand up her thigh until you feel the lips of her bare pussy.");
            s("There are drops of some liquid up there.");
        } else {
            s("You run your hand up her thigh until you feel the thin fabric of her panties.");
            s("They aren't sopping wet, but the gusset has a definite wet spot.");
        }
        if (bladder > blademer)
            s(feelthigh[randcounter]);
        incrandom();
        c("smellspurted", "Smell your fingers.");
    }
    c(locstack[0], "Continue ...");
}

function smellspurted() {
    s("You sniff your damp fingers.");
    s(smellpee[randcounter]);
    incrandom();
    c(locstack[0], "Continue ...");
}

//TODO make this more pleasurable/more BDSM like scolding?
function scoldher() {
    s("<b>YOU:</b> You're such a baby, wetting yourself like that!");
    s("She pouts and turns away from you.");
    s("Her face turns bright red and she begins to cry.");
    attraction -= 20;
    c("callherataxi", "Call her a cab");
}

//
//  It's coming out and she can't stop it
//  used to help describe various pees.
//
function itscomingout(curtext) {
    //TODO test
    if (!sawherpee)
        curtext.push(girltalk + pickrandom(needs["outpeelook"]));
        // s(girltalk + outpeelook[randcounter]);
    else
        curtext.push(girltalk + pickrandom(needs["outpeehide"]));
        // s(girltalk + outpeehide[randcounter]);
    curtext.push(girlgasp + pickrandom(needs["outpeectrl"]));
    curtext.push(girltalk + pickrandom(needs["outpeecome"]));
    // s(girlgasp + outpeectrl[randcounter]);
    // s(girltalk + outpeecome[randcounter]);
    return curtext;
}



