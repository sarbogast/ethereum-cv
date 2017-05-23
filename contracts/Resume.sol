pragma solidity ^0.4.8;

import "./CVExtender.sol";
import "./mortal.sol";

contract Resume is CVExtender, mortal {

    event onExperienceAdded(int startDate, int endDate, bytes32 employer, bytes32 city, bytes32 country, bytes32 description);

    struct Experience {
        int startDate;
        int endDate;
        bytes32 employer;
        bytes32 city;
        bytes32 country;
        bytes32 description;
    }

    mapping (uint256 => Experience) public experiences;
    uint256 public experienceCounter;

    function addExperience(int newStartDate, int newEndDate, bytes32 newEmployer, bytes32 newCity, bytes32 newCountry, bytes32 newDescription) onlyowner returns (uint256 experienceId) {
        experienceCounter++;
        experiences[experienceCounter] = Experience(newStartDate, newEndDate, newEmployer, newCity, newCountry, newDescription);
        onExperienceAdded(newStartDate, newEndDate, newEmployer, newCity, newCountry, newDescription);
        return experienceCounter;
    }

    function getExperienceList() public constant returns (uint256[] experienceIds, int[] startDates, int[] endDates, bytes32[] employers, bytes32[] cities, bytes32[] countries, bytes32[] descriptions) {
        if(experienceCounter == 0) {
            throw;
        }

        // prepare output arrays
        int[] memory startDate = new int[](experienceCounter);
        int[] memory endDate = new int[](experienceCounter);
        bytes32[] memory employer = new bytes32[](experienceCounter);
        bytes32[] memory city = new bytes32[](experienceCounter);
        bytes32[] memory country = new bytes32[](experienceCounter);
        bytes32[] memory description = new bytes32[](experienceCounter);
        uint256[] memory experienceId = new uint256[](experienceCounter);

        // browse and fecth each
        for (uint i = 1; i <= experienceCounter; i++) {
            Experience memory experience = experiences[i];
            experienceId[i-1] = i;
            startDate[i-1] = experience.startDate;
            endDate[i-1] = experience.endDate;
            employer[i-1] = experience.employer;
            city[i-1] = experience.city;
            country[i-1] = experience.country;
            description[i-1] = experience.description;
        }

        return(experienceId, startDate, endDate, employer, city, country, description);
    }

    function isOwner(address toCheck) constant returns (bool owned) {
        return toCheck == owner;
    }

     /**
      * Below is for our CV!
      * */
    function getAddress() constant returns(string) {
        return "http://ethereum-cv.github.io";
    }

    function getDescription() constant returns(string) {
        return "My CV on the blockchain";
    }
    function getTitle() constant returns(string) {
        return "Fullstack Developer";
    }
    function getAuthor() constant returns(string, string) {
        return ("Sebastien Arboagst", "sebastien.arbogast@epseelon.com");
    }
}
