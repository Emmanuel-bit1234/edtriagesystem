import axios from "axios";
import { NET_IP } from "../config/Config";

export default function PoliticalPartyService() {
    this.getAllPoliticalParties = () => {
        var url = `${NET_IP}/API/GetPoliticalParties`; 
        return axios.get(url).then((response) => response.data);
    };
    this.createParty = (data) => {
        var url = `${NET_IP}/API/CreatePoliticalParty`; 
        return axios.post(url, data).then((response) => response.data);
    };
    this.deActivatePoliticalParty = (id) => {
        var url = `${NET_IP}/API/ChangeStatusPoliticalParty/${id}`; 
        return axios.post(url).then((response) => response.data);
    };
    this.getAllExecutiveRoles = (id) => {
        var url = `${NET_IP}/API/GetAvailablePartyExecutiveRole/${id}`; 
        return axios.post(url).then((response) => response.data);
    };
    this.getExecutiveDetails = (data) => {
        var url = `${NET_IP}/API/GetVoterDetailsByRegNumber`
        return axios.post(url,data).then((response) => response.data?.VoterDetails);
    };
    this.addExecutiveMember = (data) => {
        var url = `${NET_IP}/API/AssignExecutiveMember`;
        return axios.post(url, data).then((response) => response.data);
    };
    this.getExecMembersByParty = (id) => {
        var url = `${NET_IP}/API/GetPartyExecutiveMembers/${id}`;
        return axios.get(url).then((response) => response.data.ExecutiveList);
    };
    this.getMembersByParty = (id) => {
        var url = `${NET_IP}/API/GetPoliticalPartyMembers/${id}`;
        return axios.get(url).then((response) => response.data.MemberList);
    };
    this.verifyRegisteredPartyMembersCsv = (data) => {
        var url = `${NET_IP}/API/CheckPoliticalPartyMembersCSVv2`;
        return axios.post(url,data).then((response) => response.data);
    }
    this.addCsvMembers = (data) => {
        var url = `${NET_IP}/API/SavePoliticalPartyMembersCSVv2`; 
        return axios.post(url,data).then((response) => response.data);
    }
}
