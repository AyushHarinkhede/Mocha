// _____________________________________________________________________________________________________________________________________________________________

// while loop //
var i=0;  
while(i<3)  
{ 
    console.log(i); 
    i++; 
} 
// another Example of while loop //
let stars = 1; 
while (stars<=8) { 
    console.log("star number:"+ stars);  
    stars++;  
} 

// _____________________________________________________________________________________________________________________________________________________________

// Do While Loop
let battery = 97;
do {
    console.log("charging battery"
        + battery + "%");
        battery++;
    
} while (battery<= 100);


// Another example of Do While Loop//
let n = 1;  
do {
    console.log("Number: " + n);
    n++;
} while (n <= 5);

// _____________________________________________________________________________________________________________________________________________________________

// for loop//
for(let i=1;i<=5;i++)
{
    console.log("Iteration number: " + i);
}



// Another example of for loop//
for(let j=5;j>=1;j--)
{
    console.log("Countdown: " + j);
}

// _____________________________________________________________________________________________________________________________________________________________

// character ki length ko detect krna with .length//
var a="aayush";
var num=a.length;
console.log(num);

// _____________________________________________________________________________________________________________________________________________________________

//If else example//
var age=17;
let votingCard=false
if(age>=18 && votingCard==true)
{
    console.log("you are eligible for voting");
}
else{
    console.log("you are not eligible for voting");     
}


//If else example//
if(age>=18 || votingCard==true)
{
    console.log("you are eligible for voting");
}
else{
    console.log("you are not eligible for voting");     
}


//If else example//
let color=prompt("Enter the color of traffic light:");
if(colo=="red")
{ 
    console.log("Stop");
}else if(color=="yellow")
{
    console.log("Ready");
}else if(color=="green")
{
    console.log("Go");
}else{
    console.log("Invalid color");
}

// _____________________________________________________________________________________________________________________________________________________________





//Else if statement HOMEWORK TODAY//
var age=12;

if(age==10)
{
    console.log("payment has been credited by 1000 rupees only");
}
else if(age==11)
{
    console.log("payment credited 2000 rupees only");
}
else if(age==12)
{
    console.log("payment has been credited by 3000 rupees only");
}
else if(age==13)
{
    console.log("payment has been credited by 4000 rupees only");
}
else if(age==14)
{
    console.log("payment has been credited by 5000 rupees only");
}
else if(age==15)
{
    console.log("payment has been credited by 6000 rupees only");
}
else{
    console.log("no payment has been credited");
}

//Else if statement HOMEWORK TODAY 2//
var button=2;

if(button==1)
{
    console.log("turn on fan");
}
else if(button==2)
{
    console.log("turn on T.V");
}
else if(button==3)
{
    console.log("turn on lights");
}
else if(button==4)
{
    console.log("turn on AC");
}
else if(button==5)
{
    console.log("turn on geyser");
}
else if(button==6)
{
    console.log("turn on gas");
}
else if(button==7)
{
    console.log("turn on fridge");
}
else if(button==8)
{
    console.log("turn off all appliances at same time");
}
else{
    console.log("no appliance is on");
}



//If statement//
var a=10;
var b=5;
if(a>b)
{
    console.log("a is greater than b");
}


// _________________________________________________________________________________________________________________________________________________________________________________________

//Else statement//
var m=10;
var c=5;
if(m>c)
{
    console.log("m is greater");
}
else
{
    console.log("c is greater");
}

//Else statement 2//
var p=50;
var q=50;
if(p>=q)
{
    console.log("p is queen");
}
else{
    console.log("q is king");
}

// _____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

//Else if statement//
var minal=12;
if(minal>=18)
{
    console.log("eigible for voting");
}
else if(minal>=16)
{
    console.log("not eigible for voting");
}
else
{
    console.log("not eigible for voting");
}


// _________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//If else example//
let colo=prompt("Enter the color of traffic light:");
if(colo=="red")
{
    console.log("Stop");
}else if(colo=="yellow")
{
    console.log("Ready");
}else if(colo=="green")
{
    console.log("Go");
}else{
    console.log("Invalid color");
}

// _____________________________________________________________________________________________________________________________________________________________

//while loop example//
const a=2
let b=1
while(b<=10){
    c=a*b
    console.log("2 X"+b+"="+c)
    //console.log("2 X",b."=",c)
    // console.log(`2 X ${b} =${c}`)
    b++;
}

// _____________________________________________________________________________________________________________________________________________________________

//for loop example//
for(a=0;a>=10;a++){
    console.log(a);
}


// _____________________________________________________________________________________________________________________________________________________________
