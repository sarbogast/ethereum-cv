// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css';
import 'bootstrap/dist/css/bootstrap.css';
// Import libraries we need.
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract';
// Import our contract artifacts and turn them into usable abstractions.
import resume_artifacts from '../../build/contracts/Resume.json';

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Resume = contract(resume_artifacts)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var accountBalance;

// library use to format the date
var moment = require('moment')

window.App = {
    start: function () {
        // Bootstrap the MetaCoin abstraction for Use.
        Resume.setProvider(web3.currentProvider);

        web3.eth.getCoinbase(function (err, data) {
            if (err === null) {
                console.log(data);
                account = data;

                web3.eth.getBalance(account, function (err, data) {
                    if (err === null) {
                        accountBalance = data;
                        $('#coinbase').text('You are connected with account ' + account);
                        $('#coinbaseBalance').text('Balance: ' + web3.fromWei(accountBalance, 'ether') + ' ETH');
                    }
                })
            }
        });

        App.updateAddExperienceButton();

        App.listenToEvents();

        App.reloadExperiences();
    },

    updateAddExperienceButton: function() {
        Resume.deployed().then(function (instance) {
            return instance.isOwner(account);
        }).then(function (result) {
            console.log(result);
            if(result) {
                $("#addExperienceSection").show();
            } else {
                $("#addExperienceSection").hide();
            }
        });
    },

    addExperience: function () {
        var _startDate = new Date(document.getElementById('startDate').value).getTime();
        var _endDate = new Date(document.getElementById('endDate').value).getTime();
        var _employer = document.getElementById('employer').value;
        var _city = document.getElementById('city').value;
        var _country = document.getElementById('country').value;
        var _description = document.getElementById('description').value;

        Resume.deployed().then(function (instance) {
            return instance.addExperience(_startDate, _endDate, _employer, _city, _country, _description, {
                from: account,
                gas: 500000
            })
        }).then(function (result) {
            App.reloadExperiences()
        }).catch(function (err) {
            console.error(err)
        })
    },

    // Load and display the list of experiences
    reloadExperiences: function () {
        Resume.deployed().then(function (instance) {
            return instance.getExperienceList()
        }).then(function (result) {

            cleanExperienceList();

            // from newer entry
            for (var i = result[0].length - 1; i >= 0; i--) {
                displayExperience(
                    result[0][i],
                    result[1][i],
                    result[2][i],
                    result[3][i],
                    result[4][i],
                    result[5][i],
                    result[6][i]
                )
            }
        }).catch(function (err) {
            console.error(err);
        })
    },

    // Listen for events raised from the contract
    listenToEvents: function () {

        // Uncomment the following lines if you want to display the events
        /*
         Resume.deployed().then(function(instance) {
         instance.onExperienceAdded({}, {
         fromBlock: 0,
         toBlock: 'latest'
         }).watch(function(error, event) {
         document.getElementById("experienceAdded").innerHTML += JSON.stringify(event);
         });
         });
         */
    }
};

// Clear the list of experiences to display the fresh one
function cleanExperienceList() {
    var elements = document.getElementsByClassName('experience');

    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0])
    }
}

// Display an experience in the list
function displayExperience(experienceId, startDate, endDate, employer, city, country, description) {

    var rowMarker = document.createElement('div');
    rowMarker.className = 'row row-eq-height experience';

    // prepare and display the experience detail (employer, description, dates, location)
    var divMarker = document.createElement('div');
    divMarker.className = 'col-xs-6';

    // employer
    var h3Marker = document.createElement('h3');
    var aMarker = document.createElement('a');
    aMarker.href = '#';
    aMarker.innerHTML = web3.toAscii(employer);
    h3Marker.appendChild(aMarker);

    divMarker.appendChild(h3Marker);

    // start and end dates
    var pMarker = document.createElement('p');
    pMarker.className = 'text-muted';
    var spanMarker = document.createElement('span');
    spanMarker.className = 'glyphicon glyphicon-calendar';
    pMarker.appendChild(spanMarker);
    var fromDate = moment(new Date(Number(startDate))).format('DD/MM/YYYY');
    var toDate = moment(new Date(Number(endDate))).format('DD/MM/YYYY');
    pMarker.innerHTML = pMarker.innerHTML + ' From: ' + fromDate + ' To: ' + toDate;
    divMarker.appendChild(pMarker);

    // description
    var descriptionMarker = document.createElement('p');
    descriptionMarker.innerHTML = web3.toAscii(description);
    divMarker.appendChild(descriptionMarker);

    // Location
    var pMarker2 = document.createElement('p');
    pMarker2.className = 'text-muted';
    var spanMarker2 = document.createElement('span');
    spanMarker2.className = 'glyphicon glyphicon-map-marker';
    pMarker.appendChild(spanMarker2);

    pMarker.innerHTML = pMarker.innerHTML + ' ' + web3.toAscii(city) + ' (' + web3.toAscii(country) + ')';
    divMarker.appendChild(pMarker);

    rowMarker.appendChild(divMarker);

    var experienceList = document.getElementById('experience-list');
    var hrMarker = document.createElement('hr');
    hrMarker.className = 'experience';
    experienceList.appendChild(rowMarker);
    experienceList.appendChild(hrMarker)
}

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask')
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider)
    } else {
        console.warn('No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }

    App.start()
});
