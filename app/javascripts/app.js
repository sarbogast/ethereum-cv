// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css';
import 'bootstrap/dist/css/bootstrap.css';
// Import libraries we need.
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract';
// Import our contract artifacts and turn them into usable abstractions.
import resume_artifacts from '../../build/contracts/Resume.json';

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Resume = contract(resume_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var accountBalance;
var isOwner;

// library use to format the date
var moment = require('moment');

window.App = {
    start: function () {
        // Bootstrap the MetaCoin abstraction for Use.
        Resume.setProvider(web3.currentProvider);

        web3.eth.getCoinbase(function (err, data) {
            if (err === null) {
                //console.log(data);
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

    updateAddExperienceButton: function () {
        Resume.deployed().then(function (instance) {
            return instance.isOwner(account);
        }).then(function (result) {
            isOwner = result;
            if (result) {
                $("#addExperienceSection").show();
            } else {
                $("#addExperienceSection").hide();
            }
        });
    },

    addExperience: function () {
        var _startDate = new Date(document.getElementById('startDate').value).getTime();
        var _endDate = new Date(document.getElementById('endDate').value).getTime();
        var _present = document.getElementById('present').checked;
        var _role = document.getElementById('role').value;
        var _employer = document.getElementById('employer').value;
        var _city = document.getElementById('city').value;
        var _country = document.getElementById('country').value;
        var _description = document.getElementById('description').value;

        Resume.deployed().then(function (instance) {
            return instance.addExperience(_startDate, _endDate, _present, _role, _employer, _city, _country, _description, {
                from: account,
                gas: 500000
            })
        }).then(function (result) {
            App.resetExperienceForm();
            App.reloadExperiences();
        }).catch(function (err) {
            console.error(err);
        });
    },

    resetExperienceForm: function () {
        document.getElementById('startDate').value = null;
        document.getElementById('endDate').value = null;
        document.getElementById('present').checked = false;
        document.getElementById('role').value = '';
        document.getElementById('employer').value = '';
        document.getElementById('city').value = '';
        document.getElementById('country').value = '';
        document.getElementById('description').value = '';
    },

    // Load and display the list of experiences
    reloadExperiences: function () {
        Resume.deployed().then(function (instance) {
            return instance.getExperiences()
        }).then(function (result) {
            App.cleanExperienceList();
            //console.log(result);

            var experiences = [];
            for (var i = 0; i < result[0].length; i++) {
                experiences.push({
                    id: Number(result[0][i]),
                    startDate: Number(result[1][i]),
                    endDate: Number(result[2][i]),
                    present: result[3][i]
                })
            }
            experiences.sort(function (a, b) {
                return b.startDate - a.startDate;
            });

            for (var j = 0; j < experiences.length; j++) {
                App.displayExperience(experiences[j].id);
            }
        }).catch(function (err) {
            console.error(err);
        })
    },

    // Listen for events raised from the contract
    listenToEvents: function () {
        Resume.deployed().then(function (instance) {
            instance.onExperienceAdded({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function (error, event) {
                document.getElementById("events").innerHTML += '<li class="list-group-item">Experience #' + event.args.experienceId.toNumber() + ' was added, starting on ' + new Date(event.args.startDate.toNumber()) + ', working for ' + web3.toAscii(event.args.employer) + ' as a ' + web3.toAscii(event.args.role) + '</li>';
            });

            instance.onExperienceClosed({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function (error, event) {
                document.getElementById("events").innerHTML += '<li class="list-group-item">Experience #' + event.args.experienceId.toNumber() + ' was closed on ' + new Date(event.args.endDate.toNumber()) + '</li>';
            });
        });
    },

    // Clear the list of experiences to display the fresh one
    cleanExperienceList: function () {
        var elements = document.getElementsByClassName('experience');

        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    },

    // Display an experience in the list
    displayExperience: function (experienceId) {

        Resume.deployed().then(function (instance) {
            return instance.getExperience(experienceId);
        }).then(function (experience) {
            var experienceObject = {
                id: experienceId,
                startDate: new Date(Number(experience[0])),
                endDate: new Date(Number(experience[1])),
                present: experience[2],
                role: web3.toAscii(experience[3]),
                employer: web3.toAscii(experience[4]),
                city: web3.toAscii(experience[5]),
                country: web3.toAscii(experience[6]),
                description: experience[7]
            };
            //console.log(experienceObject);

            var rowMarker = document.createElement('div');
            rowMarker.className = 'row row-eq-height experience';

            // prepare and display the experience detail (employer, description, dates, location)
            var divMarker = document.createElement('div');
            divMarker.className = 'col-xs-12';

            // employer
            var h3Marker = document.createElement('h3');
            //var aMarker = document.createElement('a');
            //aMarker.href = '#';
            //aMarker.innerHTML = web3.toAscii(employer);
            //h3Marker.appendChild(aMarker);
            h3Marker.innerHTML = experienceObject.role + ', ' + experienceObject.employer;
            divMarker.appendChild(h3Marker);

            // start and end dates
            var pMarker = document.createElement('p');
            pMarker.className = 'text-muted';
            var spanMarker = document.createElement('span');
            spanMarker.className = 'glyphicon glyphicon-calendar';
            pMarker.appendChild(spanMarker);
            var fromDate = moment(experienceObject.startDate).format('DD/MM/YYYY');
            var toDate = moment(experienceObject.endDate).format('DD/MM/YYYY');
            pMarker.innerHTML = pMarker.innerHTML + ' From: ' + fromDate + ' To: ' + (experienceObject.present ? 'Present' : toDate);
            divMarker.appendChild(pMarker);

            // description
            var descriptionMarker = document.createElement('p');
            descriptionMarker.innerHTML = experienceObject.description;
            divMarker.appendChild(descriptionMarker);

            // Location
            var pMarker2 = document.createElement('p');
            pMarker2.className = 'text-muted';
            var spanMarker2 = document.createElement('span');
            spanMarker2.className = 'glyphicon glyphicon-map-marker';
            pMarker.appendChild(spanMarker2);

            pMarker.innerHTML = pMarker.innerHTML + ' ' + experienceObject.city + ' (' + experienceObject.country + ')';
            divMarker.appendChild(pMarker);

            rowMarker.appendChild(divMarker);

            if (isOwner && experienceObject.present) {
                var closeDiv = document.createElement('div');
                closeDiv.className = 'input-group col-xs-4';
                closeDiv.innerHTML = '<input class="form-control" type="date" id="closeDate-' + experienceId + '"><span class="input-group-btn"><button id="closeButton-' + experienceId + '" type="button" class="btn btn-danger" onclick="App.closeExperience(' + experienceId + '); return false;">Close</button></span>';
                rowMarker.appendChild(closeDiv);
            }

            var experienceList = document.getElementById('experience-list');
            experienceList.appendChild(rowMarker);

            var hrMarker = document.createElement('hr');
            hrMarker.className = 'experience';
            experienceList.appendChild(hrMarker);
        });
    },

    closeExperience: function (experienceId) {
        var dateInput = document.getElementById('closeDate-' + experienceId);
        var endDateString = dateInput.value;
        if (endDateString !== '') {
            var closeButton = document.getElementById('closeButton-' + experienceId);
            closeButton.disabled = true;
            dateInput.disabled = true;
            var endDate = new Date(endDateString);
            Resume.deployed().then(function (instance) {
                return instance.closeOpenExperience(experienceId, endDate.getTime(), {from: account, gas: 500000});
            }).then(function () {
                App.reloadExperiences();
            }).catch(function (err) {
                console.error(err);
            });
        }
    }
};

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask');
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn('No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask');
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }

    App.start()
});
