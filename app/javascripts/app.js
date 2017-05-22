// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css';
// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
// Import our contract artifacts and turn them into usable abstractions.
import resume_artifacts from '../../build/contracts/Resume.json';

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Resume = contract(resume_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var coinbase;

window.App = {
  start: function () {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Resume.setProvider(web3.currentProvider);

    web3.eth.getCoinbase(function(err, data) {
      if (err == null) {
        coinbase = data;
        $("#coinbase").text("Welcome " + coinbase);
      }
    });

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length == 0) {
        alert('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.')
        return
      }

      accounts = accs
      account = accounts[0]

      App.reloadExperiences()
    })
  },

  addExperience: function() {
    var _startDate = new Date(document.getElementById("startDate").value).getTime();
    var _endDate = new Date(document.getElementById("endDate").value).getTime();
    var _employer = document.getElementById('employer').value;
    var _city = document.getElementById('city').value;
    var _country = document.getElementById('country').value;
    var _description = document.getElementById("description").value;

    console.log(_startDate + ',' + _endDate + ',' + _employer + ',' + _city + ',' + _country + ',' + _description);

    Resume.deployed().then(function(instance) {
      console.log(instance);
      return instance.addExperience(_startDate, _endDate, _employer, _city, _country, _description, {
        from: coinbase,
        gas: 500000
      });
    }).then(function(result) {
      App.reloadExperiences();
    }).catch(function(err) {
      console.error(err);
    });
  },

  reloadExperiences: function () {
    Resume.deployed().then(function(instance) {
      console.log(instance);
      return instance.getExperienceList.call();
    }).then(function(result) {
      console.log(result);
      //cleanExperienceList();

      // from newer to older
      /*for (var i = result[0].length - 1; i >= 0; i--) {
        displayExperience(
          result[0][i],
          result[1][i],
          result[2][i],
          result[3][i],
          result[4][i],
          result[5][i]
        );
      }*/
    }).catch(function(err) {
      console.error(err);
    });
  }
}

// Clear the list of articles to display a fresh one
function cleanExperienceList() {
  var elements = document.getElementsByClassName("experience");

  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

// Display an article on the list
function displayExperience(startDate, endDate, employer, city, country, description) {

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
})
