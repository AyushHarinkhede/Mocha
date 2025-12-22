// _____________________________________________________________________________________________________________________________________________________________
// AND Gate//

var a=10;
var b=6;
//case1
if(a>b && a>b)
{
    console.log("true");
}
//case2 
var a=12;
var b=8;
if(a>b && a<b)
{
    console.log("false");
}
//case3
var a=13; 
var b=9;
if(a<b && a<b)
{
    console.log("false");
}
//case4
var a=15;
var b=3;
if(a<b && a>b)
{
    console.log("false");
}

// _____________________________________________________________________________________________________________________________________________________________

//OR Gate//

var a=44;
var b=22;
//case1
if(a>b || a>b)
{
    console.log("true");
}
//case2
var a=55;
var b=33;
if(a>b || a<b)
{
    console.log("true");
}
//case3
var a=88;
var b=33;
if(a<b || a<b)
{
    console.log("false");
}
//case4
var a=99;
var b=44;
if(a<b || a>b)
{
    console.log("true");
}

// _____________________________________________________________________________________________________________________________________________________________

//NOT Gate//

var a=7;
var b=9;
//case1
if(!(a>b))
{
    console.log("true");
}
//case2
var a=8;
var b=3;
if(!(a>b))
{
    console.log("false");
}

// _____________________________________________________________________________________________________________________________________________________________

// Switch Case Example//
var days=4;
switch(days)
 {
case 1:
{
    console.log("Monday");
}
break;
case 2:
{
    console.log("Tuesday");
}
break;
case 3:
{
    console.log("Wednesday");
}
case 4:
    {
        console.log("Thrusday");
    }
    break;
case 5:
    {
        console.log("Friday");
    }
    break;
case 6:
    {
        console.log("Saturday");
    }
    break;
case 7:
    {
         console.log("Sunday");
    }
    break;
default:
    {
        console.log("Invalid Input");
    }
}

// _____________________________________________________________________________________________________________________________________________________________

//HOMEWORK//

//And && Operator//
var a=12;
var b=30;
if(a==12 && b==30)
{
    console.log("The time is 12:30");
}

// _____________________________________________________________________________________________________________________________________________________________

//OR || Operator//
var hour=9;
if(hour<10 || hour>18)
{
    console.log("The office is closed.");
}

// _____________________________________________________________________________________________________________________________________________________________

//NOT ! Operator//
var loggedIn=false;
if(!loggedIn)
{
    console.log("Please log in first!");
}
else{
    console.log("Login Denied")
}

// _____________________________________________________________________________________________________________________________________________________________
