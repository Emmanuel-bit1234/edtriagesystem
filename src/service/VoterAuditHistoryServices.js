import { NET_IP } from "../config/Config";
import axios from "axios";
export default function VoterAuditHistoryServices() {
    this.getAuditHistoryByID = (Id_Number) => {
        // 052245114028
        var url = `${NET_IP}/DataInspection/GetVoterAuditHistoryData?id=${Id_Number}`;
        return axios.get(url).then((response) => response.data);
    };

    this.getChannelData = (disabilityID,RecordSourceID,SiteID) => {
        // 052245114028
        var url = `${NET_IP}/DataInspection/GetDisabilityName?DisabilityID=${disabilityID}&VoterRecordSourceID=${RecordSourceID}&RegistrationSiteID=${SiteID}`;
        return axios.get(url).then((response) => response.data);
    };
}
