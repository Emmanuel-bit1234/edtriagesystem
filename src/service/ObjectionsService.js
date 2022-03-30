import axios from "axios";
import { NET_IP } from "../config/Config";

export default function ObjectionsService() {
    this.getAllObjectionType = () => {
        var url = `${NET_IP}/DataInspection/GetObjectionTypes1`;
        return axios.get(url).then((response) => response.data);
    };
    this.getAllObjectionStatuses = () => {
        var url = `${NET_IP}/DataInspection/GetObjectionStatuses`;
        return axios.get(url).then((response) => response.data);
    };
    this.getObjectionsByID = (ID) => {
        var url = `${NET_IP}/DataInspection/GetObjectionsByRegistrationNo?regNo=${ID}`;
        return axios.get(url).then((response) => response.data.Objections);
    };
    this.getObjectionsByTypeStatusAndEvent = (id1, id2, id3) => {
        var url = `${NET_IP}/DataInspection/GetObjections?ObjectionTypeID=${id1}&ObjectionStatusID=${id2}&EventID=${id3}`;
        return axios.get(url).then((response) => response.data.Objections);
    };
    this.createObjection = (data) => {
        var url = `${NET_IP}/DataInspection/InsertObjection`;
        return axios.post(url, data).then((response) => response.data);
    };
    this.adjudicateObjection = (id1, id2, reason) => {
        var url = `${NET_IP}/DataInspection/AdjudicateObjection?ObjectionID=${id1}&ObjectionStatusID=${id2}&StatusReason=${reason}`
        return axios.post(url).then((response) => response.data);
    };
}
