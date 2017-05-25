pragma solidity ^0.4.8;


import "./CVExtender.sol";
import "./mortal.sol";


contract Resume is CVExtender, mortal {

    event onExperienceAdded(uint experienceId, int startDate, int endDate, bool present, bytes32 role, bytes32 employer, bytes32 city, bytes32 country, string description);
    event onExperienceClosed(uint experienceId, int endDate);

    struct Experience {
    int startDate;
    int endDate;
    bool present;
    bytes32 role;
    bytes32 employer;
    bytes32 city;
    bytes32 country;
    string description;
    }

    mapping (uint256 => Experience) public experiences;

    uint256 public experienceCounter;

    function addExperience(int newStartDate, int newEndDate, bool newPresent, bytes32 newRole, bytes32 newEmployer, bytes32 newCity, bytes32 newCountry, string newDescription) onlyowner returns (uint256 experienceId) {
        if(!newPresent && newEndDate < newStartDate) throw;

        experienceCounter++;
        experiences[experienceCounter] = Experience(newStartDate, newEndDate, newPresent, newRole, newEmployer, newCity, newCountry, newDescription);
        onExperienceAdded(experienceCounter, newStartDate, newEndDate, newPresent, newRole, newEmployer, newCity, newCountry, newDescription);
        return experienceCounter;
    }

    function closeOpenExperience(uint256 experienceId, int endDate) onlyowner returns (bool success) {
        Experience experience = experiences[experienceId];
        if(experience.present) {
            experience.endDate = endDate;
            onExperienceClosed(experienceId, experiences[experienceId].endDate);
            return true;
        } else {
            return false;
        }
    }

    function getExperiences() public constant returns (uint256[] experienceIds, int[] startDates, int[] endDates, bool[] presents) {
        if (experienceCounter == 0) {
            throw;
        }

        // prepare output arrays
        int[] memory startDate = new int[](experienceCounter);
        int[] memory endDate = new int[](experienceCounter);
        bool[] memory present = new bool[](experienceCounter);
        uint256[] memory experienceId = new uint256[](experienceCounter);

        // browse and fecth each
        for (uint i = 1; i <= experienceCounter; i++) {
            Experience memory experience = experiences[i];
            experienceId[i - 1] = i;
            startDate[i - 1] = experience.startDate;
            endDate[i - 1] = experience.endDate;
            present[i - 1] = experience.present;
        }

        return (experienceId, startDate, endDate, present);
    }

    function getExperience(uint experienceId) constant returns (int startDate, int endDate, bool present, bytes32 role, bytes32 employer, bytes32 city, bytes32 country, string description) {
        Experience experience = experiences[experienceId];
        startDate = experience.startDate;
        endDate = experience.endDate;
        present = experience.present;
        role = experience.role;
        employer = experience.employer;
        city = experience.city;
        country = experience.country;
        description = experience.description;
    }

    function isOwner(address toCheck) constant returns (bool owned) {
        return toCheck == owner;
    }

    /**
     * Below is for our CV!
     * */
    function getAddress() constant returns (string) {
        return "http://ethereum-cv.sebastien-arbogast.com";
    }

    function getDescription() constant returns (string) {
        return "My CV on the blockchain";
    }

    function getTitle() constant returns (string) {
        return "Fullstack Developer";
    }

    function getAuthor() constant returns (string, string) {
        return ("Sebastien Arbogast", "sebastien.arbogast@epseelon.com");
    }
}
