let web3;
let realEstateContract;
let admin;
let currentAccount;

const contractABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    {
        "inputs": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "description", "type": "string" },
            { "internalType": "string", "name": "city", "type": "string" },
            { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "addProperty",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [], 
        "name": "admin", 
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }], 
        "stateMutability": "view", 
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "propertyId", "type": "uint256" }], 
        "name": "buyProperty", 
        "outputs": [], 
        "stateMutability": "payable", 
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "properties",
        "outputs": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "string", "name": "description", "type": "string" },
            { "internalType": "string", "name": "city", "type": "string" },
            { "internalType": "uint256", "name": "price", "type": "uint256" },
            { "internalType": "bool", "name": "isSold", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    { 
        "inputs": [], 
        "name": "propertyCount", 
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view", 
        "type": "function" 
    },
    { 
        "inputs": [], 
        "name": "withdrawBalance", 
        "outputs": [], 
        "stateMutability": "nonpayable", 
        "type": "function"
    }
  ];
const contractAddress = "0xC643611CCE06665441D7F76dE36B8752Fb1AC0fD";

// Property images grouped by type
const imageUrls = {
    Villa: ["images/villa.jpg", "images/villa2.jpg", "images/villa3.jpg", "images/villa4.jpg"],
    Commercial: ["images/commercial.jpg", "images/commercial2.jpg", "images/commercial3.jpg", "images/commercial4.jpg"],
    Land: ["images/land.jpg", "images/land2.jpg", "images/land3.jpg", "images/land4.jpg"]
};

// Connect MetaMask
async function connectMetaMask() {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            currentAccount = accounts[0];

            realEstateContract = new web3.eth.Contract(contractABI, contractAddress);
            admin = await realEstateContract.methods.admin().call();

            alert(`Connected with ${currentAccount}`);
            loadProperties();
            document.getElementById('logoutBtn').style.display = 'inline-block';
        } catch (err) {
            alert("MetaMask connection failed: " + err.message);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// Step 1: City Selection
function selectCity(city) {
    document.getElementById("selectedCity").value = city;
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
}

// Step 2: Property Type Selection
function selectPropertyType(type) {
    document.getElementById("selectedType").value = type;
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
    generatePropertyCards();
}

// Step 3: Generate Property Cards
function generatePropertyCards() {
    const city = document.getElementById("selectedCity").value;
    const type = document.getElementById("selectedType").value;
    const images = [...imageUrls[type]];

    const properties = [
        {
            name: `${type} Paradise in ${city}`,
            description: `Spacious ${type.toLowerCase()} located in prime ${city} area.`,
            price: "0.045"
        },
        {
            name: `${city} Elite ${type}`,
            description: `Modern ${type.toLowerCase()} perfect for families in ${city}.`,
            price: "0.16"
        },
        {
            name: `${type} Haven - ${city}`,
            description: `Luxury ${type.toLowerCase()} surrounded by nature in ${city}.`,
            price: "0.175"
        },
        {
            name: `Central ${city} ${type}`,
            description: `Conveniently located ${type.toLowerCase()} in the heart of ${city}.`,
            price: "0.185"
        }
    ];

    const container = document.getElementById("autoPropertyCards");
    container.innerHTML = '';

    properties.forEach((prop, i) => {
        const image = images[i % images.length];
        const card = document.createElement("div");
        card.className = "property-card card text-white bg-dark mb-3 p-3 shadow rounded";
        card.innerHTML = `
            <img src="${image}" class="card-img-top mb-2 rounded" alt="Property Image" height="180">
            <h5 class="card-title">${prop.name}</h5>
            <p class="card-text">${prop.description}</p>
            <p class="card-text"><strong>City:</strong> ${city}</p>
            <p class="card-text"><strong>Price:</strong> ${prop.price} ETH</p>
            <button class="btn btn-warning" onclick="addAutoProperty('${prop.name}', '${prop.description}', '${city}', '${prop.price}')">Add Property</button>
        `;
        container.appendChild(card);
    });
}

// Admin-only Add Property
async function addAutoProperty(name, description, city, priceInEth) {
    if (!currentAccount || currentAccount.toLowerCase() !== admin.toLowerCase()) {
        alert("Only admin can add properties!");
        return;
    }

    const priceInWei = web3.utils.toWei(priceInEth, 'ether');

    try {
        await realEstateContract.methods.addProperty(name, description, city, priceInWei)
            .send({ from: currentAccount });

        alert("✅ Property added successfully!");
        loadProperties();
    } catch (error) {
        alert("Error adding property: " + error.message);
    }
}

// Load Unsold Properties
async function loadProperties() {
    const propertyList = document.getElementById("propertyList");
    propertyList.innerHTML = '';

    const blockList = ["Test Property", "Dummy", "Hide Me"];

    try {
        const count = await realEstateContract.methods.propertyCount().call();
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";

        for (let i = count - 1; i >= 0; i--) {
            const property = await realEstateContract.methods.properties(i).call();

            if (!property.isSold && !blockList.includes(property.name)) {
                const priceInEth = web3.utils.fromWei(property.price, 'ether');
                const typeGuess = Object.keys(imageUrls).find(type => property.name.toLowerCase().includes(type.toLowerCase())) || "Villa";
                const image = getRandomImage(typeGuess);

                const colDiv = document.createElement("div");
                colDiv.className = "col-md-3 mb-4";

                const cardDiv = document.createElement("div");
                cardDiv.className = "property-card card bg-dark text-white p-3 shadow rounded";
                cardDiv.innerHTML = `
                    <img src="${image}" class="card-img-top mb-2 rounded" alt="Property Image" height="180">
                    <h5 class="card-title">${property.name}</h5>
                    <p class="card-text">${property.description}</p>
                    <p class="card-text"><strong>City:</strong> ${property.city}</p>
                    <p class="card-text"><strong>Price:</strong> ${priceInEth} ETH</p>
                    <button class="btn btn-success" onclick="buyProperty(${i})">Buy</button>
                `;

                colDiv.appendChild(cardDiv);
                rowDiv.appendChild(colDiv);
            }
        }

        propertyList.appendChild(rowDiv);
    } catch (error) {
        alert("Error loading properties: " + error.message);
    }
}

// Buy Property
async function buyProperty(propertyId) {
    try {
        const property = await realEstateContract.methods.properties(propertyId).call();
        const valueInWei = web3.utils.toBN(property.price);

        await realEstateContract.methods.buyProperty(propertyId)
            .send({ from: currentAccount, value: valueInWei });

        alert("✅ Property purchased successfully!");
        loadProperties();
    } catch (error) {
        alert("Error buying property: " + error.message);
    }
}

// Load Purchased Properties
async function loadPurchasedProperties() {
    const purchasedList = document.getElementById("purchasedPropertyList");
    purchasedList.innerHTML = '';

    try {
        const count = await realEstateContract.methods.propertyCount().call();

        for (let i = 0; i < count; i++) {
            const property = await realEstateContract.methods.properties(i).call();

            if (property.isSold) {
                const priceInEth = web3.utils.fromWei(property.price, 'ether');

                const item = document.createElement("div");
                item.className = "property-card card bg-secondary text-white p-3 mb-3";
                item.innerHTML = `
                    <strong>${property.name}</strong> - ${property.city} <br>
                    ${property.description} <br>
                    <b>Sold At:</b> ${priceInEth} ETH 
                `;
                purchasedList.appendChild(item);
            }
        }

        const myModal = new bootstrap.Modal(document.getElementById('purchasedModal'));
        myModal.show();
    } catch (error) {
        alert("Error loading purchased properties: " + error.message);
    }
}

// Get Random Image
function getRandomImage(type) {
    const imgs = imageUrls[type];
    return imgs[Math.floor(Math.random() * imgs.length)];
}

