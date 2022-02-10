import { NET_IP } from "../config/Config";
import axios from "axios";
export default function VoterAuditHistoryServices() {
    this.getAuditHistory = () => {
        var url = `${NET_IP}/DataInspection/GetVoterAuditHistoryData?id=052245114028`;
        return axios.get(url).then((response) => response.data);
    };
}
