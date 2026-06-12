let chart;
let currentCity = "Bangalore";
let currentData = {};

const markerPositions = {

    "Bangalore": [
        { top: "30%", left: "40%" },
        { top: "50%", left: "60%" },
        { top: "70%", left: "30%" },
        { top: "20%", left: "70%" },
        { top: "60%", left: "20%" }
    ],

    "Pune": [
        { top: "40%", left: "50%" },
        { top: "60%", left: "30%" },
        { top: "25%", left: "65%" },
        { top: "70%", left: "55%" },
        { top: "50%", left: "75%" },
        { top: "35%", left: "20%" }
    ],

    "Nashik": [
        { top: "35%", left: "45%" },
        { top: "55%", left: "65%" },
        { top: "25%", left: "30%" },
        { top: "65%", left: "40%" },
        { top: "45%", left: "70%" },
        { top: "60%", left: "25%" },
        { top: "30%", left: "75%" }
    ]
};

async function init(){

    const res = await fetch("/api/cities");

    const cities = await res.json();

    const select = document.getElementById("citySelect");

    cities.forEach(city => {

        const option = document.createElement("option");

        option.value = city;
        option.innerText = city;

        select.appendChild(option);
    });

    loadCityData();

    updateClock();

    setInterval(updateClock,1000);
}

async function loadCityData(){

    currentCity =
        document.getElementById("citySelect").value;

    const res =
        await fetch(`/api/data/${currentCity}`);

    const data = await res.json();

    currentData = data;

    document.getElementById("mapFrame").src =
        `https://www.google.com/maps?q=${currentCity}&output=embed`;

    const zoneBox = document.getElementById("zones");

    const markerBox = document.getElementById("markers");

    const alertBox = document.getElementById("alertBox");

    zoneBox.innerHTML = "";
    markerBox.innerHTML = "";
    alertBox.innerHTML = "";

    let labels = [];
    let values = [];

    let totalWaste = 0;
    let totalRecycle = 0;
    let health = 100;
    let highRisk = 0;

    let i = 0;

    for(let zone in data){

        const z = data[zone];

        totalWaste += z.waste;
        totalRecycle += z.recycling;

        labels.push(zone);
        values.push(z.waste);

        if(z.risk === "High"){
            health -= 15;
            highRisk++;
        }

        else if(z.risk === "Medium"){
            health -= 8;
        }

        // ZONE CARD

        const div = document.createElement("div");

        div.className = "zone";

        div.innerHTML = `
            <h2>${zone}</h2>
            <p>🗑 Waste: ${z.waste}</p>
            <p>♻ Recycling: ${z.recycling}%</p>
            <p>⚠ Risk: ${z.risk}</p>
        `;

        zoneBox.appendChild(div);

        // ALERT

        if(z.risk === "High"){

            const alert = document.createElement("div");

            alert.className = "alert";

            alert.innerText =
                `⚠ ${zone} is highly polluted`;

            alertBox.appendChild(alert);
        }

        // MARKERS

        const marker = document.createElement("div");

        marker.className = "marker";

        const pos = markerPositions[currentCity][i];

        marker.style.top = pos.top;
        marker.style.left = pos.left;

        if(z.risk === "High"){

            marker.style.background = "#ef4444";

            marker.style.animation =
                "pulse 1s infinite";
        }

        else if(z.risk === "Medium"){

            marker.style.background = "#f59e0b";
        }

        else{

            marker.style.background = "#22c55e";
        }

        marker.onclick = () => {

            alert(
                `${zone}

Waste: ${z.waste}

Recycling: ${z.recycling}%

Risk: ${z.risk}`
            );
        };

        markerBox.appendChild(marker);

        i++;
    }

    // STATS

    document.getElementById("totalWaste")
        .innerText = totalWaste;

    document.getElementById("avgRecycle")
        .innerText =
        Math.round(totalRecycle / labels.length) + "%";

    document.getElementById("highRisk")
        .innerText = highRisk;

    document.getElementById("healthScore")
        .innerText = health;

    updateStatus(health);

    drawChart(labels,values);
}

function drawChart(labels,values){

    const ctx = document.getElementById("chart");

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx,{

        type:"bar",

        data:{

            labels:labels,

            datasets:[{

                label:`${currentCity} Waste Levels`,

                data:values,

                backgroundColor:"#f59e0b"
            }]
        }
    });
}

function setTheme(theme){

    document.body.className = theme;
}

function updateClock(){

    const now = new Date();

    document.getElementById("clock")
        .innerText = now.toLocaleString();
}

function updateStatus(score){

    const status =
        document.getElementById("statusText");

    if(score < 60){

        status.innerText =
            "🔴 Emergency Active";
    }

    else if(score < 80){

        status.innerText =
            "🟡 Moderate Risk";
    }

    else{

        status.innerText =
            "🟢 System Stable";
    }
}

function filterZones(){

    const input =
        document.getElementById("searchBox")
        .value
        .toLowerCase();

    const zones =
        document.querySelectorAll(".zone");

    zones.forEach(zone => {

        const text =
            zone.innerText.toLowerCase();

        if(text.includes(input)){

            zone.style.display = "block";
        }

        else{

            zone.style.display = "none";
        }
    });
}

// AI CHATBOT

function sendMessage(){

    const input =
        document.getElementById("chatInput");

    const msg = input.value;

    if(msg.trim() === ""){
        return;
    }

    addMessage(msg,"user");

    const response =
        generateBotReply(msg.toLowerCase());

    setTimeout(() => {

        addMessage(response,"bot");

    },700);

    input.value = "";
}

function addMessage(text,type){

    const chat =
        document.getElementById("chatMessages");

    const div =
        document.createElement("div");

    div.className = `message ${type}`;

    div.innerText = text;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;
}

function generateBotReply(msg){

    if(msg.includes("highest waste")){

        let maxZone = "";
        let maxWaste = 0;

        for(let zone in currentData){

            if(currentData[zone].waste > maxWaste){

                maxWaste =
                    currentData[zone].waste;

                maxZone = zone;
            }
        }

        return `⚠ ${maxZone} has the highest waste level (${maxWaste}).`;
    }

    if(msg.includes("stable")){

        return `✅ ${currentCity} is currently under monitored stability.`;
    }

    if(msg.includes("recycling")){

        return `♻ Recycling efficiency is improving across monitored zones.`;
    }

    if(msg.includes("risk")){

        return `🚨 High risk zones require immediate waste optimization.`;
    }

    return `🧠 RecycleIQ AI is monitoring ${currentCity} in real time.`;
}

init();