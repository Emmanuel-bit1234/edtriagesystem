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
}
