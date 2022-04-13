import axios from "axios";
import { NET_IP } from "../config/Config";

export default function PoliticalPartyService() {
    this.getAllPoliticalParties = () => {
        var url = `${NET_IP}/api/PoliticalPartiesApi`;
        return axios.get(url).then((response) => response.data);
    };
    this.createParty = (data) => {
        var url = `${NET_IP}/api/PoliticalPartiesApi`;
        return axios.post(url, data).then((response) => response.data);
    };
}
